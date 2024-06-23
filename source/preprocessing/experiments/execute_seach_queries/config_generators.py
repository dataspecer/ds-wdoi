import copy

SINGLE_MAX_RESULTS = 20
BASE_RERANKING_MAX_RESULTS = 100
CROSS_ENCODER_MAX_RESULTS = 30

def __get_single_candidate_config(method_id, max_results):
    return { 
        "candidateSelectorConfig": {
            "id": method_id,
            "maxResults": max_results
        }
    } 

def __get_tuple_fusion_candidate_config(first_method_id, second_method_id, max_results, fusion_weights):
    return {
        "fusionCandidateSelectorConfig": {
            "id": "fusion",
            "maxResults": max_results,
            "fusionWeights": fusion_weights,
            "candidateSelectors": [
                {
                    "id": first_method_id,
                    "maxResults": max_results
                },
                {
                    "id": second_method_id,
                    "maxResults": max_results
                }
            ]
        } 
    }

def __get_triple_fusion_candidate_config(max_results, fusion_weights):
    return {
        "fusionCandidateSelectorConfig": {
            "id": "fusion",
            "maxResults": max_results,
            "fusionWeights": fusion_weights,
            "candidateSelectors": [
                {
                    "id": "qdrant_dense",
                    "maxResults": max_results
                },
                {
                    "id": "qdrant_sparse",
                    "maxResults": max_results
                },
                {
                    "id": "elastic_bm25",
                    "maxResults": max_results
                }
            ]
        } 
    }

def __get_cross_encoder_reranker_config(max_results):
    return {
        "id": "cross_encoder",
        "maxResults": max_results
    }

def __get_boost_reranker_config(max_results, query_weight, feature_weights):
    return {
        "id": "feature_instance_mappings",
        "maxResults": max_results,
        "queryWeight": query_weight,
        "featureWeights": feature_weights
    }

def __append_cross_encoder_reranker_config(max_results, method_key, config):
    new_method_key = f"{method_key}_cross_encoder"
    new_config = copy.copy(config)
    if "rerankerConfig" in new_config:
        new_config["rerankerConfig"] = copy.copy(new_config["rerankerConfig"])
        new_config["rerankerConfig"].append(__get_cross_encoder_reranker_config(max_results))
    else:
        new_config["rerankerConfig"] = [ __get_cross_encoder_reranker_config(max_results)]
    return new_method_key, new_config

def single_method_config_generator(max_results):
    method_ids = ['elastic_bm25', 'qdrant_sparse', 'qdrant_dense']
    for method_id in method_ids:
        method_key = f"single_{method_id}"
        yield method_key, __get_single_candidate_config(method_id, max_results)


def tuple_fusion_method_config_generator(max_results):
    methods_tuples = [('qdrant_dense', 'qdrant_sparse'), ('qdrant_sparse', 'elastic_bm25'), ('qdrant_dense', 'elastic_bm25')]
    for tuple in methods_tuples:
        first_method_id = tuple[0]
        second_method_id = tuple[1]
        for p in range(1, 10):
            first_weight = round(p / 10.0, 1) # 0.1 ... 0.9
            second_weight = round(1 - first_weight, 1) # 0.9 ... 0.1
            
            method_key = f"tuple_fusion_{first_method_id}_{str(first_weight)}_x_{second_method_id}_{str(second_weight)}"
            yield method_key, __get_tuple_fusion_candidate_config(first_method_id, second_method_id, max_results, [first_weight, second_weight])

def triple_fusion_method_config_generator(max_results):
    for first_p in range(1, 9):
        for second_p in range(1, (10 - (first_p))):
            first_weight = round(first_p / 10.0, 1)
            second_weight = round(second_p / 10.0, 1)
            third_weight = round((10 - first_p - second_p) / 10.0, 1) 
        
            method_key = f"triple_fusion_qdrant_dense_{str(first_weight)}_x_qdrant_sparse_{str(second_weight)}_x_elastic_bm25_{str(third_weight)}"
            yield method_key, __get_triple_fusion_candidate_config(max_results, [first_weight, second_weight, third_weight])


def configs_without_reranking():
    # The single method has base max results, since there is no reranking, unlike fusions.
    for idx, config_generator in enumerate([single_method_config_generator, tuple_fusion_method_config_generator, triple_fusion_method_config_generator]):
        for config_key, config in config_generator(SINGLE_MAX_RESULTS if idx == 0 else BASE_RERANKING_MAX_RESULTS):
            yield config_key, config
            
def boost_reranker_config_generator(method_key, config, max_results):
    for boost_weight in [0.25, 0.5, 0.75]:
        boost_method_key = f"{method_key}_boost_{str(boost_weight)}"
        boost_config = copy.copy(config)
        boost_config["rerankerConfig"] = [  __get_boost_reranker_config(max_results, (1 - boost_weight), [0.5]) ]
        yield boost_method_key, boost_config
            
def configs_with_boost_reranking():
    for config_generator in [single_method_config_generator, tuple_fusion_method_config_generator, triple_fusion_method_config_generator]:
        for method_key, config in config_generator(BASE_RERANKING_MAX_RESULTS):
            for boost_method_key, boost_config in boost_reranker_config_generator(method_key, config, BASE_RERANKING_MAX_RESULTS):
                yield boost_method_key, boost_config
         
def __final_candidates_generator(max_results):
    # Single methods
    for single_key, single_config in single_method_config_generator(max_results):
        yield single_key, single_config
        
    # Tuple fusion
    tuple_key = f"tuple_fusion_qdrant_dense_{str(0.4)}_x_qdrant_sparse_{str(0.6)}"
    tuple_config =  __get_tuple_fusion_candidate_config("qdrant_dense", "qdrant_sparse", max_results, [0.4, 0.6])
    yield tuple_key, tuple_config
    
    # Triple fusion
    triple_key = f"triple_fusion_qdrant_dense_{str(0.4)}_x_qdrant_sparse_{str(0.5)}_x_elastic_bm25_{str(0.1)}"
    triple_config = __get_triple_fusion_candidate_config(max_results, [0.4, 0.5, 0.1])
    yield triple_key, triple_config
         
def configs_with_cross_encoder_final_selection():
    # Only cross encoder
    for method_key_no_boost, config_no_boost  in __final_candidates_generator(BASE_RERANKING_MAX_RESULTS):
        yield __append_cross_encoder_reranker_config(CROSS_ENCODER_MAX_RESULTS, method_key_no_boost, config_no_boost)
    
    # With boost and cross encoder
    for method_key_for_boost, config_for_boost  in __final_candidates_generator(BASE_RERANKING_MAX_RESULTS):
        boosted_method_key = f"{method_key_for_boost}_boost_0.5"
        boosted_config = copy.copy(config_for_boost)
        boosted_config["rerankerConfig"] = [  __get_boost_reranker_config(BASE_RERANKING_MAX_RESULTS, 0.5, [0.5]) ]
        yield __append_cross_encoder_reranker_config(CROSS_ENCODER_MAX_RESULTS, boosted_method_key, boosted_config)
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

def __get_tuple_fusion_candidate_config(second_method_id, max_results, fusion_weights):
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

def __get_boost_reranker_config(max_results, query_weight, feature_weights):
    return {
        "id": "feature_instance_mappings",
        "maxResults": max_results,
        "queryWeight": query_weight,
        "featureWeights": feature_weights
    }


def single_method_config_generator(max_results):
    method_ids = ['elastic_bm25', 'qdrant_sparse', 'qdrant_dense']
    for method_id in method_ids:
        method_key = f"single_{method_id}"
        yield method_key, __get_single_candidate_config(method_id, max_results)

def tuple_fusion_method_config_generator(max_results):
    second_methods_ids = ['elastic_bm25', 'qdrant_sparse']
    for second_method_id in second_methods_ids:
        for p in range(1, 10):
            first_weight = round(p / 10.0, 1) # 0.1 ... 0.9
            second_weight = round(1 - first_weight, 1) # 0.9 ... 0.1
            
            method_key = f"tuple_fusion_qdrant_dense_{str(first_weight)}_x_{second_method_id}_{str(second_weight)}"
            yield method_key, __get_tuple_fusion_candidate_config(second_method_id, max_results, [first_weight, second_weight])

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
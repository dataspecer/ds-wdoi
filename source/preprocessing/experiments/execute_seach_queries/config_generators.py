

def single_method_config_generator():
    method_ids = ['elastic_bm25', 'qdrant_sparse', 'qdrant_dense']
    for method_id in method_ids:
        key = f"single_{method_id}"
        yield key, { 
            "candidateSelectorConfig": {
                "id": method_id,
                "maxResults": 20
            }
        } 

def tuple_fusion_method_config_generator():
    second_methods_ids = ['elastic_bm25', 'qdrant_sparse']
    for second_method_id in second_methods_ids:
        for p in range(1, 10):
            first_weight = round(p / 10.0, 1) # 0.1 ... 0.9
            second_weight = round(1 - first_weight, 1) # 0.9 ... 0.1
            
            method_key = f"tuple_fusion_qdrant_dense_{str(first_weight)}_x_{second_method_id}_{str(second_weight)}"
            
            yield method_key, {
                "fusionCandidateSelectorConfig": {
                    "id": "fusion",
                    "maxResults": 100,
                    "fusionWeights": [first_weight, second_weight],
                    "candidateSelectors": [
                        {
                            "id": "qdrant_dense",
                            "maxResults": 100
                        },
                        {
                            "id": second_method_id,
                            "maxResults": 100
                        }
                    ]
                } 
            }


def triple_fusion_method_config_generator():
    for first_p in range(1, 9):
        for second_p in range(1, (10 - (first_p))):
            first_weight = round(first_p / 10.0, 1)
            second_weight = round(second_p / 10.0, 1)
            third_weight = round((10 - first_p - second_p) / 10.0, 1)
        
        method_key = f"triple_fusion_qdrant_dense_{str(first_weight)}_x_qdrant_sparse_{str(second_weight)}_x_elastic_bm25_{str(third_weight)}"
        
        yield method_key, {
            "fusionCandidateSelectorConfig": {
                "id": "fusion",
                "maxResults": 100,
                "fusionWeights": [first_weight, second_weight, third_weight],
                "candidateSelectors": [
                    {
                        "id": "qdrant_dense",
                        "maxResults": 100
                    },
                    {
                        "id": "qdrant_sparse",
                        "maxResults": 100
                    },
                    {
                        "id": "elastic_bm25",
                        "maxResults": 100
                    }
                ]
            } 
        }


def configs_without_reranking():
    for config_generator in [single_method_config_generator, tuple_fusion_method_config_generator, triple_fusion_method_config_generator]:
        for config_key, config in config_generator():
            yield config_key, config
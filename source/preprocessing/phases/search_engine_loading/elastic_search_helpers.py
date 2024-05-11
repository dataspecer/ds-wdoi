import phases.search_engine_loading.elastic_search_config as es
import pprint
import core.utils.logging as ul

logger = ul.root_logger.getChild("es_helpers")
pp = pprint.PrettyPrinter(indent=2)

def __create_dynamic_mapping(language_shortcut: str, analyzer: str):
    template_name = "language" + "_" + language_shortcut + "_" + "template" 
    template_value = {
        "match_mapping_type": "string",
        "match": "*_" + language_shortcut,
        "mapping": {
            "type": "text",
            "analyzer": analyzer,
            'fields': {'keyword': {
                'type': 'keyword',
                "normalizer": "lowercase",
                'ignore_above': 256
                }
            },
        }
    }
    return { template_name: template_value } 

def __create_language_mappings():
    dynamic_templates = []
    # Create mapping only for the allowed English language.
    analyzer = "english"
    language_shortcuts =  es.ANALYZER_LANGUAGE_MAP[analyzer]
    for shortcut in language_shortcuts:
        dynamic_templates.append(__create_dynamic_mapping(shortcut, analyzer))
    return {
        "_source": {
            "enabled": False
        },
        "dynamic": True,
        "dynamic_templates": dynamic_templates,
    }

def index_exists(client, name):
    if not client.indices.exists(index=name):
        logger.info(f"Index '{name}' does not exist.")
        return False
    else:
        logger.info(f"Index '{name}' does exist.")
        return True

def list_indices():
    logger.info("Listing indices started")
    
    indices = es.client.indices.get(index="*")
    for index_name, index_info in indices.items():
        print(index_name)
        pp.pprint(index_info)
        print()
    
    logger.info("Listing indices ended")

def list_mappings():
    logger.info("Listing mappings started")
    
    mappings = es.client.indices.get_mapping(index="*")
    for index_name, mapping_info in mappings.items():
        print(index_name)
        pp.pprint(mapping_info)
        print()
    
    logger.info("Listing mappings ended")

def list_sizes():
    logger.info("List sizes")
    
    response = es.client.indices.stats(index="*", metric="store")
    for index, stats in response['indices'].items():
        size_in_bytes = stats['total']['store']['size_in_bytes']
        print(f"Index Size: '{index}': {size_in_bytes} bytes")
        
    logger.info("List sizes ended")
        
def refresh():
    logger.info("Refreshing started")
    
    cls_exists = index_exists(es.client, es.CLASSES_ELASTIC_INDEX_NAME)
    props_exists = index_exists(es.client, es.PROPERTIES_ELASTIC_INDEX_NAME)
    
    if not cls_exists or not props_exists:
        logger.critical("One of the indices does not exist, please create it before refreshing.")
        logger.critical("Exiting...")        
        exit(1)
    else:
        logger.info(f"Refreshing index '{es.CLASSES_ELASTIC_INDEX_NAME}'")
        es.client.indices.refresh(index=es.CLASSES_ELASTIC_INDEX_NAME)
        logger.info(f"Refreshed index '{es.CLASSES_ELASTIC_INDEX_NAME}' successfully")
        
        logger.info(f"Refreshing index '{es.PROPERTIES_ELASTIC_INDEX_NAME}'")
        es.client.indices.refresh(index=es.PROPERTIES_ELASTIC_INDEX_NAME)
        logger.info(f"Refreshed index '{es.PROPERTIES_ELASTIC_INDEX_NAME}' successfully")
    
    logger.info("Refreshing ended")

def create():
    logger.info("Creating started")
    
    cls_exists = index_exists(es.client, es.CLASSES_ELASTIC_INDEX_NAME)
    props_exists = index_exists(es.client, es.PROPERTIES_ELASTIC_INDEX_NAME)
    
    if cls_exists or props_exists:
        logger.critical("One of the indices exists, please delete it before creating a new one.")
        logger.critical("Exiting...")
        exit(1)        
    else:
        mappings = __create_language_mappings()
        
        logger.info(f"Creating index '{es.CLASSES_ELASTIC_INDEX_NAME}'")
        es.client.indices.create(index=es.CLASSES_ELASTIC_INDEX_NAME, mappings=mappings)
        logger.info(f"Created index '{es.CLASSES_ELASTIC_INDEX_NAME}' successfully")
        
        logger.info(f"Creating index '{es.PROPERTIES_ELASTIC_INDEX_NAME}'")
        es.client.indices.create(index=es.PROPERTIES_ELASTIC_INDEX_NAME, mappings=mappings)
        logger.info(f"Created index '{es.PROPERTIES_ELASTIC_INDEX_NAME}' successfully")
            
    logger.info("Creating ended")
    

def delete():
    logger.info("Deleting started")
    
    if (index_exists(es.client, es.CLASSES_ELASTIC_INDEX_NAME)):
        logger.info(f"Deleting classes index '{es.CLASSES_ELASTIC_INDEX_NAME}'")
        es.client.indices.delete(index=es.CLASSES_ELASTIC_INDEX_NAME)
        logger.info(f"Deleted classes index '{es.CLASSES_ELASTIC_INDEX_NAME}' successfully")
        
    if (index_exists(es.client, es.PROPERTIES_ELASTIC_INDEX_NAME)):
        logger.info(f"Deleting properties index '{es.PROPERTIES_ELASTIC_INDEX_NAME}'")
        es.client.indices.delete(index=es.PROPERTIES_ELASTIC_INDEX_NAME)
        logger.info(f"Deleted properties index '{es.PROPERTIES_ELASTIC_INDEX_NAME}' successfully")   
    
    logger.info("Deleting ended")
        
def search(search_string, search_classes: bool = True):
    logger.info("Searching started")
    
    cls_exists = index_exists(es.client, es.CLASSES_ELASTIC_INDEX_NAME)
    props_exists = index_exists(es.client, es.PROPERTIES_ELASTIC_INDEX_NAME)
    
    search_index = es.CLASSES_ELASTIC_INDEX_NAME if search_classes else es.PROPERTIES_ELASTIC_INDEX_NAME
    
    if search_string == "":
        logger.critical("Cannot search for empty string, please add argument for the script.")
        logger.critical("Exiting...")
        exit(1)
    elif not cls_exists or not props_exists:
        logger.critical("One of the indices does not exist.")
        logger.critical("Exiting...")
        exit(1)
    else:
        # query_obj = {
        #     "dis_max": {
        #         "queries": {
        #             "multi_match": {
        #                 "query":      f"{search_string}",
        #                 "type":       "most_fields",
        #                 "fields": ["labels_en", "labels_en.keyword^2", "aliases_en.keyword^2", "aliases_en"],
        #             },        
        #             "multi_match": {
        #                 "query":      f"{search_string}",
        #                 "type":       "best_fields",
        #                 "fields": ["labels_en", "labels_en.keyword^2", "aliases_en.keyword^2", "aliases_en"],
        #             },
        #         },
        #         "tie_breaker": 0.7
        #     }
        # }
        query_obj = {
            "bool": {
                "should": [
                    {
                        "match": {
                        "labels_en": {
                            "query": f"{search_string}",
                            "fuzziness": "AUTO"
                            },
                        }
                    },
                    {
                        "term": {
                        "labels_en.keyword": {
                            "value": f"{search_string}",
                            "boost": 2.0
                            },
                        }
                    },
                    {
                        "match": {
                        "aliases_en": {
                            "query": f"{search_string}",
                            "fuzziness": "AUTO"
                            },
                        }
                    },
                    {
                        "term": {
                        "aliases_en.keyword": {
                            "value": f"{search_string}",
                            "boost": 2.0
                            },
                        }
                    }
                ]
            }
        }
        resp = es.client.search(index=search_index, query=query_obj)
        logger.info("Got %d Hits for %s:" % (resp['hits']['total']['value'], search_index))
        for hit in resp['hits']['hits']:
            print("id: " + hit["_id"] + " score: " + str(hit["_score"]))
   
    logger.info("Searching ended")
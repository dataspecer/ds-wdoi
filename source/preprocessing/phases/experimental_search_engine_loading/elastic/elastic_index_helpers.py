import phases.experimental_search_engine_loading.elastic.elastic_client as es
import phases.experimental_search_engine_loading.elastic.input_generation.mappings.mappings as mappings
import pprint
import core.utils.logging as ul

logger = ul.root_logger.getChild("es_helpers")
pp = pprint.PrettyPrinter(indent=2)

def index_exists(client, name):
    if not client.indices.exists(index=name):
        logger.info(f"Index '{name}' does not exist.")
        return False
    else:
        logger.info(f"Index '{name}' does exist.")
        return True

def list_indices():
    logger.info("Listing indices started")
    
    indices = es.elastic_client.indices.get(index="*")
    for index_name, index_info in indices.items():
        print(index_name)
        pp.pprint(index_info)
        print()
    
    logger.info("Listing indices ended")

def list_mappings():
    logger.info("Listing mappings started")
    
    mappings = es.elastic_client.indices.get_mapping(index="*")
    for index_name, mapping_info in mappings.items():
        print(index_name)
        pp.pprint(mapping_info)
        print()
    
    logger.info("Listing mappings ended")

def list_sizes():
    logger.info("List sizes")
    
    response = es.elastic_client.indices.stats(index="*", metric="store")
    for index, stats in response['indices'].items():
        size_in_bytes = stats['total']['store']['size_in_bytes']
        print(f"Index Size: '{index}': {size_in_bytes} bytes")
        
    logger.info("List sizes ended")
        
def refresh():
    logger.info("Refreshing started")
    
    cls_exists = index_exists(es.elastic_client, es.ELASTIC_CLASSES_INDEX_NAME)
    props_exists = index_exists(es.elastic_client, es.ELASTIC_PROPERTIES_INDEX_NAME)
    
    if not cls_exists or not props_exists:
        logger.critical("One of the indices does not exist, please create it before refreshing.")
        logger.critical("Exiting...")        
        exit(1)
    else:
        logger.info(f"Refreshing index '{es.ELASTIC_CLASSES_INDEX_NAME}'")
        es.elastic_client.indices.refresh(index=es.ELASTIC_CLASSES_INDEX_NAME)
        logger.info(f"Refreshed index '{es.ELASTIC_CLASSES_INDEX_NAME}' successfully")
        
        logger.info(f"Refreshing index '{es.ELASTIC_PROPERTIES_INDEX_NAME}'")
        es.elastic_client.indices.refresh(index=es.ELASTIC_PROPERTIES_INDEX_NAME)
        logger.info(f"Refreshed index '{es.ELASTIC_PROPERTIES_INDEX_NAME}' successfully")
    
    logger.info("Refreshing ended")

def create():
    logger.info("Creating started")
    
    cls_exists = index_exists(es.elastic_client, es.ELASTIC_CLASSES_INDEX_NAME)
    props_exists = index_exists(es.elastic_client, es.ELASTIC_PROPERTIES_INDEX_NAME)
    
    if cls_exists or props_exists:
        logger.critical("One of the indices exists, please delete it before creating a new one.")
        logger.critical("Exiting...")
        exit(1)        
    else:
        
        logger.info(f"Creating index '{es.ELASTIC_CLASSES_INDEX_NAME}'")
        es.elastic_client.indices.create(index=es.ELASTIC_CLASSES_INDEX_NAME, mappings=mappings.create_class_mappings())
        logger.info(f"Created index '{es.ELASTIC_CLASSES_INDEX_NAME}' successfully")
        
        logger.info(f"Creating index '{es.ELASTIC_PROPERTIES_INDEX_NAME}'")
        es.elastic_client.indices.create(index=es.ELASTIC_PROPERTIES_INDEX_NAME, mappings=mappings.create_property_mappings())
        logger.info(f"Created index '{es.ELASTIC_PROPERTIES_INDEX_NAME}' successfully")
            
    logger.info("Creating ended")

def delete():
    logger.info("Deleting started")
    
    if (index_exists(es.elastic_client, es.ELASTIC_CLASSES_INDEX_NAME)):
        logger.info(f"Deleting classes index '{es.ELASTIC_CLASSES_INDEX_NAME}'")
        es.elastic_client.indices.delete(index=es.ELASTIC_CLASSES_INDEX_NAME)
        logger.info(f"Deleted classes index '{es.ELASTIC_CLASSES_INDEX_NAME}' successfully")
        
    if (index_exists(es.elastic_client, es.ELASTIC_PROPERTIES_INDEX_NAME)):
        logger.info(f"Deleting properties index '{es.ELASTIC_PROPERTIES_INDEX_NAME}'")
        es.elastic_client.indices.delete(index=es.ELASTIC_PROPERTIES_INDEX_NAME)
        logger.info(f"Deleted properties index '{es.ELASTIC_PROPERTIES_INDEX_NAME}' successfully")   
    
    logger.info("Deleting ended")
import argparse
import utils.elastic_search as es
import logging

logger = logging.getLogger("es-helpers")
logging.basicConfig(level=20)

def index_exists(client, name):
    if not client.indices.exists(index=name):
        logger.info(f"Index == {name} does not exist.")
        return False
    else:
        logger.info(f"Index == {name} does exist.")
        return True

def refresh():
    logger.info("Refreshing started")
    
    cls_exists = index_exists(es.client, es.CLASSES_ELASTIC_INDEX_NAME)
    props_exists = index_exists(es.client, es.PROPERTIES_ELASTIC_INDEX_NAME)
    
    if not cls_exists or not props_exists:
        logger.critical("One of the indices does not exist, please create it before refreshing.")
        logger.critical("Exiting...")        
        exit(1)
    else:
        logger.info(f"Refreshing index == {es.CLASSES_ELASTIC_INDEX_NAME}")
        es.client.indices.refresh(index=es.CLASSES_ELASTIC_INDEX_NAME)
        logger.info(f"Refreshed index == {es.CLASSES_ELASTIC_INDEX_NAME} successfully")
        
        logger.info(f"Refreshing index == {es.PROPERTIES_ELASTIC_INDEX_NAME}")
        es.client.indices.refresh(index=es.PROPERTIES_ELASTIC_INDEX_NAME)
        logger.info(f"Refreshed index == {es.PROPERTIES_ELASTIC_INDEX_NAME} successfully")
    
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
        logger.info(f"Creating index == {es.CLASSES_ELASTIC_INDEX_NAME}")
        es.client.indices.create(index=es.CLASSES_ELASTIC_INDEX_NAME)
        logger.info(f"Created index == {es.CLASSES_ELASTIC_INDEX_NAME} successfully")
        
        logger.info(f"Creating index == {es.PROPERTIES_ELASTIC_INDEX_NAME}")
        es.client.indices.create(index=es.PROPERTIES_ELASTIC_INDEX_NAME)
        logger.info(f"Created index == {es.PROPERTIES_ELASTIC_INDEX_NAME} successfully")
            
    logger.info("Creating ended")
    

def delete():
    logger.info("Deleting started")
    
    if (index_exists(es.client, es.CLASSES_ELASTIC_INDEX_NAME)):
        logger.info(f"Deleting classes index == {es.CLASSES_ELASTIC_INDEX_NAME}")
        es.client.indices.delete(index=es.CLASSES_ELASTIC_INDEX_NAME)
        logger.info(f"Deleted classes index == {es.CLASSES_ELASTIC_INDEX_NAME} successfully")
        
    if (index_exists(es.client, es.PROPERTIES_ELASTIC_INDEX_NAME)):
        logger.info(f"Deleting properties index == {es.PROPERTIES_ELASTIC_INDEX_NAME}")
        es.client.indices.delete(index=es.PROPERTIES_ELASTIC_INDEX_NAME)
        logger.info(f"Deleted properties index == {es.PROPERTIES_ELASTIC_INDEX_NAME} successfully")   
    
    logger.info("Deleting ended")
        
def search(search_string):
    logger.info("Searching started")
    
    cls_exists = index_exists(es.client, es.CLASSES_ELASTIC_INDEX_NAME)
    props_exists = index_exists(es.client, es.PROPERTIES_ELASTIC_INDEX_NAME)
    
    if search_string == "":
        logger.critical("Cannot search for empty string, please add argument for the script.")
        logger.critical("Exiting...")
        exit(1)
    elif not cls_exists or not props_exists:
        logger.critical("One of the indices does not exist.")
        logger.critical("Exiting...")
        exit(1)
    else:
        query_obj = {
            "multi_match": {
                "query":      f"{search_string}",
                "type":       "phrase_prefix",
                "slop": 5,
            }
        }
        resp = es.client.search(index=es.CLASSES_ELASTIC_INDEX_NAME, query=query_obj)
        logger.info("Got %d Hits:" % resp['hits']['total']['value'])
        for hit in resp['hits']['hits']:
            print(hit["_id"])
            print(hit["_source"])
            print()
   
    logger.info("Searching ended")
    
if __name__ == "__main__":
    parser = argparse.ArgumentParser(
                prog="Helper elastic search script",
                description="""
                            The script enables to execute operations handling indeces in the elastic search instance.
                            The operations are:
                            1. create properties and classes indeces
                            2. delete properties and classes indeces
                            3. refresh properties and classes indeces
                            4. search for the given string
                            """)
    parser.add_argument("operation",
                        type=str,
                        choices=["create", "delete", "refresh", "search"], 
                        help="An operation to execute.")
    parser.add_argument("query",
                        type=str,
                        help="A string to search for in the ES instance.",
                        nargs="?",
                        default="")
    args = parser.parse_args()
    operation = args.operation
        
    if operation == "create":
        create()
    elif operation == "delete":
        delete()
    elif operation == "refresh":
        refresh()
    elif operation == "search":
        search(args.query)
    else:
        raise ValueError("Operation was not defined for the script.")
    
    
    
    


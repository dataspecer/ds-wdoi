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
        logger.info("One of the indices does not exist, please create it before refreshing.")
        logger.info("Exiting...")        
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
        logger.info("One of the indices exists, please delete it before creating a new one.")
        logger.info("Exiting...")
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
        print(f"Deleting classes index == {es.CLASSES_ELASTIC_INDEX_NAME}")
        es.client.indices.delete(index=es.CLASSES_ELASTIC_INDEX_NAME)
        print(f"Deleted classes index == {es.CLASSES_ELASTIC_INDEX_NAME} successfully")
        
    if (index_exists(es.client, es.PROPERTIES_ELASTIC_INDEX_NAME)):
        print(f"Deleting properties index == {es.PROPERTIES_ELASTIC_INDEX_NAME}")
        es.client.indices.delete(index=es.PROPERTIES_ELASTIC_INDEX_NAME)
        print(f"Deleted properties index == {es.PROPERTIES_ELASTIC_INDEX_NAME} successfully")   
    
    logger.info("Deleting ended")
        

if __name__ == "__main__":
    parser = argparse.ArgumentParser(
                prog="Helper elastic search script",
                description="""
                            The script enables to execute operations handling indeces in the elastic search instance.
                            The operations are:
                            1. create properties and classes indeces
                            2. delete properties and classes indeces
                            3. refresh properties and classes indeces
                            """)
    parser.add_argument("operation",
                        type=str,
                        choices=["create", "delete", "refresh"], 
                        help="An operation to execute.")
    args = parser.parse_args()
    operation = args.operation
        
    if operation == "create":
        create()
    elif operation == "delete":
        delete()
    elif operation == "refresh":
        refresh()
    else:
        raise ValueError("Operation was not defined for the script.")
    
    
    
    


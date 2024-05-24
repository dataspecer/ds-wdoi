import argparse
import phases.experimental_search_engine_loading.qdrant.qdrant_loading as qdrant_helpers
import phases.experimental_search_engine_loading.elastic.elastic_index_helpers as es_helpers    
    
if __name__ == "__main__":
    parser = argparse.ArgumentParser(
                prog="Helpers for elastic search and qdrant",
                description="""
                            The script enables to execute operations handling indeces in the elastic search instance and the qdrant instance.
                            """)
    parser.add_argument("operation",
                        type=str,
                        choices=["qdrant_info", "qdrant_delete", "es_create", "es_delete", "es_refresh", "es_list", "es_mappings", "es_size"], 
                        help="An operation to execute.")
    args = parser.parse_args()
    operation = args.operation
        
    if operation == "qdrant_info":
        qdrant_helpers.collection_info(qdrant_helpers.QDRANT_CLASSES_COLLECTION_NAME)
    elif operation == "qdrant_delete":
        qdrant_helpers.delete_collection(qdrant_helpers.QDRANT_CLASSES_COLLECTION_NAME)
    elif operation == "es_create":
        es_helpers.create()
    elif operation == "es_delete":
        es_helpers.delete()
    elif operation == "es_refresh":
        es_helpers.refresh()
    elif operation == "es_list":
        es_helpers.list_indices()
    elif operation == "es_mappings":
        es_helpers.list_mappings()
    elif operation == "es_size":
        es_helpers.list_sizes()
    else:
        raise ValueError("Operation was not defined for the script.")
    
    
    
    


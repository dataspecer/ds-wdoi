import argparse
import phases.experimental_search_engine_loading.qdrant.qdrant_loading as qdrant_helpers
    
if __name__ == "__main__":
    parser = argparse.ArgumentParser(
                prog="Helpers for elastic search and qdrant",
                description="""
                            The script enables to execute operations handling indeces in the elastic search instance.
                            The operations are:
                            1. qdrant_info - prints information about the qdrant indices.
                            2. qdrant_delete - deletes all existing indices from qdrant.
                            """)
    parser.add_argument("operation",
                        type=str,
                        choices=["qdrant_info", "qdrant_delete"], 
                        help="An operation to execute.")
    args = parser.parse_args()
    operation = args.operation
        
    if operation == "qdrant_info":
        qdrant_helpers.collection_info(qdrant_helpers.CLASSES_COLLECTION_NAME)
    elif operation == "qdrant_delete":
        qdrant_helpers.delete_collection(qdrant_helpers.CLASSES_COLLECTION_NAME)
    else:
        raise ValueError("Operation was not defined for the script.")
    
    
    
    


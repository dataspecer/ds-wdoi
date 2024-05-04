import argparse
import phases.search_engine_loading.elastic_search_config as es
import pprint
import core.utils.logging as ul
import phases.search_engine_loading.elastic_search_helpers as helpers
    
if __name__ == "__main__":
    parser = argparse.ArgumentParser(
                prog="Helper elastic search script",
                description="""
                            The script enables to execute operations handling indeces in the elastic search instance.
                            The operations are:
                            1. create - create properties and classes indeces
                            2. delete - delete properties and classes indeces
                            3. refresh - refresh properties and classes indeces
                            4. search_classes - search classes for the given string
                            4. search_properties - search properties for the given string
                            5. list - list indices
                            6. mappings - list mappings of indices
                            """)
    parser.add_argument("operation",
                        type=str,
                        choices=["create", "delete", "refresh", "search_classes", "search_properties", "list", "mappings"], 
                        help="An operation to execute.")
    parser.add_argument("query",
                        type=str,
                        help="A string to search for in the ES instance.",
                        nargs="?",
                        default="")
    args = parser.parse_args()
    operation = args.operation
        
    if operation == "create":
        helpers.create()
    elif operation == "delete":
        helpers.delete()
    elif operation == "refresh":
        helpers.refresh()
    elif operation == "search_classes":
        helpers.search(args.query, True)
    elif operation == "search_properties":
        helpers.search(args.query, False)
    elif operation == "list":
        helpers.list_indices()
    elif operation == "mappings":
        helpers.list_mappings()
    else:
        raise ValueError("Operation was not defined for the script.")
    
    
    
    


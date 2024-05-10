import argparse
import pathlib
from phases.search_engine_loading.loading_to_es_search_phase import main_loading

if __name__ == "__main__":
    parser = argparse.ArgumentParser(
                prog="Loads aliases and labels into the search service (Elastic search)",
                description="""The script loads aliases and labels into the search service (Elastic search).
                               The input of the script are two files from the previous step - classes-*.json and properties-*.json
                               The script iterates over the entities in the files and extracts the english language objects into Elastic proprietary format,
                               that will serve as an input to the Elastic search.
                               The object will contain the labels and aliases as fields.
                            """)
    parser.add_argument("classesJsonFile",
                        type=pathlib.Path, 
                        help="A path to the transformed classes json file.")
    parser.add_argument("propertiesJsonFile",
                        type=pathlib.Path, 
                        help="A path to the transformed properties json file.")
    args = parser.parse_args()
    
    main_loading(args.propertiesJsonFile, args.classesJsonFile)
      
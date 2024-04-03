import argparse
import pathlib
from phases.search_engine_loading.loading_to_es_search_phase import main_loading
from core.default_languages import DEFAULT_LANGUAGES

if __name__ == "__main__":
    parser = argparse.ArgumentParser(
                prog="Loads aliases and labels into the search service (Elastic search)",
                description="""The script loads aliases and labels into the search service (Elastic search).
                               The input of the script are two files from the previous step - classes-*.json and properties-*.json
                               The script iterates over the entities in the files and extracts the selected languages into an object,
                               that will serve as an input to the Elastic search.
                               The object will contain the selected languages as fields, and for each field there will be an object,
                               that will contain fields label and aliases.
                               If for the selected languages the value does not exists it will be inited as default empty string or empty array (in the case of aliases).
                            """)
    parser.add_argument("--lang",
                        nargs="+",
                        action="store",
                        dest="lang",
                        default=DEFAULT_LANGUAGES,
                        type=str,
                        help="Usage \"--langs en cs ... -- posArg1 posArg2 ...\" or at the end \"... posArgN --lang en cs ...")
    parser.add_argument("classesJsonFile",
                        type=pathlib.Path, 
                        help="A path to the transformed classes json file.")
    parser.add_argument("propertiesJsonFile",
                        type=pathlib.Path, 
                        help="A path to the transformed properties json file.")
    args = parser.parse_args()
    
    main_loading(args.propertiesJsonFile, args.classesJsonFile, args.lang)
      
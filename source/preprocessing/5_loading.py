import sys
import argparse
import pathlib
import logging
import utils.timer as timer

import phases.p5_loading_load_to_search_service as ph4

LOG_FILE = "info_load.log"
logger = logging.getLogger("loading")
DEFAULT_LANGUAGES = ["en"]

@timer.timed(logger)
def __main(args):
    try:
        ph4.load_properties(args.propertiesJsonFile, args.lang)
        ph4.load_classes(args.classesJsonFile, args.lang)
    except Exception as e:
        logger.exception("There was an error that cannot be handled")
        logger.error("Exiting...")
        sys.exit(1)

if __name__ == "__main__":
    logging.basicConfig(level=20, handlers=[logging.FileHandler(LOG_FILE), logging.StreamHandler(sys.stdout)])
    parser = argparse.ArgumentParser(
                prog="Loads aliases, descriptions and labels into the search service (Elastic search)",
                description="""The script loads aliases, descriptions and labels into the search service (Elastic search).
                               The input of the script are two files from the previous step - classes.json and properties.json.
                               The script iterates over the entities in the files and extracts the selected languages into an object,
                               that will serve as an input to the Elastic search.
                               The object will contain the selected languages as fields, and for each field there will be an object,
                               that will contain fields label, aliases and description.
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
    
    __main(args)
      
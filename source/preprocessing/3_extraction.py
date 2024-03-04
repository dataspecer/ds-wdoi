import sys
import argparse
import pathlib
import logging
import utils.timer as timer

import phases.p3_extraction as ph3

LOG_FILE = "info_ex.log"
logger = logging.getLogger("extraction")
DEFAULT_LANGUAGES = ["en"]

@timer.timed(logger)
def __main(args):
    try:
        if args.phases in ["both", "cls"]:
            ph3.extract_classes(args.classesBz2File, args.lang)
        if args.phases in ["both", "props"]:
            ph3.extract_properties(args.propertiesBz2File, args.lang)
    except Exception as e:
        logger.exception("There was an error that cannot be handled")
        logger.error("Exiting...")
        sys.exit(1)

if __name__ == "__main__":
    logging.basicConfig(level=20, handlers=[logging.FileHandler(LOG_FILE), logging.StreamHandler(sys.stdout)])
    parser = argparse.ArgumentParser(
                prog="Classes and properties extractor",
                description="""The script extracts classes and properties from previous step (extraction) into a new simplified data model.
                               The outputs are two files "classes-ex.json" and "properties-ex.json" uncompressed.
                               The algorithm works in two phases.
                               The first phase extracts classes and the second phase extracts properties.
                            """)
    parser.add_argument("--lang",
                        nargs="+",
                        action="store",
                        dest="lang",
                        default=DEFAULT_LANGUAGES,
                        type=str,
                        help="Usage \"--langs en cs ... -- posArg1 posArg2 ...\" or at the end \"... posArgN --lang en cs ...")
    parser.add_argument("phases",
                        type=str,
                        choices=["cls", "both", "props"],
                        help="cls - transform only classes, props - transform only properties, both - transform both")
    parser.add_argument("classesBz2File",
                        type=pathlib.Path, 
                        help="A path to the extracted classes json dump bz2 file.")
    parser.add_argument("propertiesBz2File",
                        type=pathlib.Path, 
                        help="A path to the extracted properties json dump bz2 file.")
    args = parser.parse_args()
    
    __main(args)
      
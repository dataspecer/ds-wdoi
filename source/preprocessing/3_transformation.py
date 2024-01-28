import sys
import argparse
import pathlib
import logging
import utils.timer as timer

import phases.p3_transformation_transform_entities as ph3

LOG_FILE = "info_tran.log"
logger = logging.getLogger("transformation")
DEFAULT_LANGUAGES = ["en"]

@timer.timed(logger)
def __main(args):
    try:
        if args.phases in ["both", "cls"]:
            ph3.transform_classes(args.classesBz2File, args.lang)
        if args.phases in ["both", "props"]:
            ph3.transform_properties(args.propertiesBz2File, args.lang)
    except Exception as e:
        logger.exception("There was an error that cannot be handled")
        logger.error("Exiting...")
        sys.exit(1)

if __name__ == "__main__":
    logging.basicConfig(level=20, handlers=[logging.FileHandler(LOG_FILE), logging.StreamHandler(sys.stdout)])
    parser = argparse.ArgumentParser(
                prog="Class and properties transformator",
                description="""The script transforms extracted classes and properties from previous step (extraction).
                               The outputs are two files "classes.json" and "properties.json" uncompressed.
                               The algorithm works in two phases.
                               The first phase transforms classes and the second phase transforms properties.
                               The output files are ment to be input to the server.
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
      
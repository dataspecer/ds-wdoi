import sys
import argparse
import pathlib
import logging
import core.utils.timer as timer
import phases.extraction.extraction_phase as extraction
from core.default_languages import DEFAULT_LANGUAGES

LOG_FILE = "info_ex.log"
logger = logging.getLogger("extraction")

@timer.timed(logger)
def __main(args):
    try:
        if args.phases in ["both", "cls"]:
            extraction.extract_classes(args.classesGzipFile, args.lang)
        if args.phases in ["both", "props"]:
            extraction.extract_properties(args.propertiesGzipFile, args.lang)
    except Exception as e:
        logger.exception("There was an error that cannot be handled")
        logger.error("Exiting...")
        sys.exit(1)

if __name__ == "__main__":
    logging.basicConfig(level=20, handlers=[logging.FileHandler(LOG_FILE), logging.StreamHandler(sys.stdout)], format='%(asctime)s %(levelname)-8s %(name)s : %(message)s', datefmt='%Y-%m-%d %H:%M:%S')
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
    parser.add_argument("classesGzipFile",
                        type=pathlib.Path, 
                        help="A path to the extracted classes json dump .gz file.")
    parser.add_argument("propertiesGzipFile",
                        type=pathlib.Path, 
                        help="A path to the extracted properties json dump .gz file.")
    args = parser.parse_args()
    
    __main(args)
      
import sys
import argparse
import pathlib
import logging
import core.utils.timer as timer
import phases.modification.modification_phase as modification

LOG_FILE = "info_mod.log"
logger = logging.getLogger("modification")

@timer.timed(logger)
def __main(args):
    try:
        modification.modify(args.classesJsonFile, args.propertiesJsonFile, args.classesPropertyStatsJsonFile, args.propertiesStatsJsonFile)
    except Exception as e:
        logger.exception("There was an error that cannot be handled")
        logger.error("Exiting...")
        sys.exit(1)
    
if __name__ == "__main__":
    logging.basicConfig(level=20, handlers=[logging.FileHandler(LOG_FILE), logging.StreamHandler(sys.stdout)], format='%(asctime)s %(levelname)-8s %(name)s : %(message)s', datefmt='%Y-%m-%d %H:%M:%S')
    parser = argparse.ArgumentParser(
                prog="Modify strcture and semantics of classes and properties.",
                description="""The scripts loads all the data from previous step and modifies them.
                                For futher information refer to the project readme.
                            """)
    parser.add_argument("classesJsonFile",
                        type=pathlib.Path, 
                        help="A path to the separated classes json file.")
    parser.add_argument("propertiesJsonFile",
                        type=pathlib.Path, 
                        help="A path to the separated properties json file.")
    parser.add_argument("classesPropertyStatsJsonFile",
                        type=pathlib.Path, 
                        help="A path to the property usage statistics on classes json file.")
    parser.add_argument("propertiesStatsJsonFile",
                        type=pathlib.Path, 
                        help="A path to the property domain and range statistics on properties json file.")
    args = parser.parse_args()
    
    __main(args)
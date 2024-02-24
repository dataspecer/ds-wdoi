import sys
import argparse
import pathlib
import logging
import utils.timer as timer
import phases.p4_modification as ph4

LOG_FILE = "info_mod.log"
logger = logging.getLogger("modification")

@timer.timed(logger)
def __main(args):
    try:
        ph4.modify(args.classesJsonFile, args.propertiesJsonFile)
    except Exception as e:
        logger.exception("There was an error that cannot be handled")
        logger.error("Exiting...")
        sys.exit(1)
    
if __name__ == "__main__":
    logging.basicConfig(level=20, handlers=[logging.FileHandler(LOG_FILE), logging.StreamHandler(sys.stdout)])
    parser = argparse.ArgumentParser(
                prog="Modify strcture and semantics of classes and properties.",
                description="""The scripts loads all the data from previous step and modifies them.
                                For futher information refer to the project readme.
                            """)
    parser.add_argument("classesJsonFile",
                        type=pathlib.Path, 
                        help="A path to the extracted classes json file.")
    parser.add_argument("propertiesJsonFile",
                        type=pathlib.Path, 
                        help="A path to the extracted properties json file.")
    args = parser.parse_args()
    
    __main(args)
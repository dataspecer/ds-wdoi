import sys
import argparse
import pathlib
import logging
import utils.timer as timer
import phases.p5_property_recommendations as ph5

LOG_FILE = "info_rec.log"
logger = logging.getLogger("recommendations")

@timer.timed(logger)
def __main(args):
    try:
        ph5.compute_recommendations(args.classesJsonFile, args.propertiesJsonFile)
    except Exception as e:
        logger.exception("There was an error that cannot be handled")
        logger.error("Exiting...")
        sys.exit(1)
    
if __name__ == "__main__":
    logging.basicConfig(level=20, handlers=[logging.FileHandler(LOG_FILE), logging.StreamHandler(sys.stdout)])
    parser = argparse.ArgumentParser(
                prog="Precompute recommendations of properties for classes",
                description="""The scripts loads all the data from previous step and precomputes recommendations of properties for classes.
                               It connects to the recommender server and then for each class it sorts it is subjectOf and valueOf properties based on probabilities.
                               It produces three files:
                                1. Containing global ranking of properties.
                                2. Containing classes.
                                3. Containing properties.
                            """)
    parser.add_argument("classesJsonFile",
                        type=pathlib.Path, 
                        help="A path to the modified classes json file.")
    parser.add_argument("propertiesJsonFile",
                        type=pathlib.Path, 
                        help="A path to the modified properties json file.")
    args = parser.parse_args()
    
    __main(args)
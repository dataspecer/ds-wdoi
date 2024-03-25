import sys
import argparse
import pathlib
import logging
import core.utils.timer as timer
import phases.property_recommendations.property_recommendations_phase as recommendations

LOG_FILE = "info_rec.log"
logger = logging.getLogger("recommendations")

@timer.timed(logger)
def __main(args):
    try:
        recommendations.compute_recommendations(args.classesJsonFile, args.propertiesJsonFile)
    except Exception as e:
        logger.exception("There was an error that cannot be handled")
        logger.error("Exiting...")
        sys.exit(1)
    
if __name__ == "__main__":
    logging.basicConfig(level=20, handlers=[logging.FileHandler(LOG_FILE), logging.StreamHandler(sys.stdout)], format='%(asctime)s %(levelname)-8s %(name)s : %(message)s', datefmt='%Y-%m-%d %H:%M:%S')
    parser = argparse.ArgumentParser(
                prog="A phase for changing ordering of properties that require precomputation.",
                description="""The scripts loads all the data from previous step and precomputes recommendations of properties for classes.
                               It boosts properties of classes enclosed in the properties_for_this_type property.
                            """)
    parser.add_argument("classesJsonFile",
                        type=pathlib.Path, 
                        help="A path to the modified classes json file.")
    parser.add_argument("propertiesJsonFile",
                        type=pathlib.Path, 
                        help="A path to the modified properties json file.")
    args = parser.parse_args()
    
    __main(args)
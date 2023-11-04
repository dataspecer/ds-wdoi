import sys
import argparse
import pathlib
import logging
import utils.timer as timer

import source.preprocessing.phases.p4_semantic_modification as ph4

LOG_FILE = "info_mod.log"
logger = logging.getLogger("modification")

if __name__ == "__main__":
    logging.basicConfig(level=20, handlers=[logging.FileHandler(LOG_FILE), logging.StreamHandler(sys.stdout)])
    parser = argparse.ArgumentParser(
                prog="Modified samantically classes and properties",
                description="""The scripts loads all the data from previous step and modifies them.
                                For classes:
                                    1. removes unexisting references from statements
                                    2. assign children references to parents.
                                    3. makes all classes rooted
                                For properties:
                                    1. removes unexisting references from statements (constraints included)
                                    2. assignes subject and object values to the classes 
                            """)
    parser.add_argument("classesJsonFile",
                        type=pathlib.Path, 
                        help="A path to the transformed classes json file.")
    parser.add_argument("propertiesJsonFile",
                        type=pathlib.Path, 
                        help="A path to the transformed properties json file.")
    args = parser.parse_args()
    
    logger.info("Preprocessin started")
    preprocessing_start_time = timer.get_time()

    try:
            # Phase one
            logger.info("Starting phase 1 - loading classes and properties")
            phase1_start_time = timer.get_time()
            
            logger.info("Loading classes")
            classes = p4.load_classes(args.classesJsonFile)
            
            logger.info("Loading properties")
            properties = p4.load_properties(args.propertiesJsonFile)
            
            phase1_end_time = timer.get_time()
            logger.info("Ending phase 1 - loading classes and properties. Elapsed time %s",
                    timer.get_formated_elapsed_time(phase1_start_time, phase1_end_time))
        
            # Phase two
            logger.info("Starting phase 2 - classes and properties modification")
            phase2_start_time = timer.get_time()
            
            logger.info("Modifying classes")
            ph4.modify_classes(classes, properties)
            
            logger.info("Modifying properties")
            ph4.modify_properties(classes, properties)
            
            phase2_end_time = timer.get_time()
            logger.info("Ending phase 2 - classes and properties modification. Elapsed time %s",
                    timer.get_formated_elapsed_time(phase2_start_time, phase2_end_time))
        
    except Exception as e:
        logger.exception("There was an error that cannot be handled")
        logger.error("Exiting...")
        sys.exit(1)
    
    preprocessing_end_time = timer.get_time()
    logger.info("Preprocessing finished in %s",
                timer.get_formated_elapsed_time(preprocessing_start_time, preprocessing_end_time))
      
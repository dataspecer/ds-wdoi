import sys
import argparse
import pathlib
import logging
import utils.timer as timer

import phases.transformation_p1_transform_classes as ph1
import phases.transformation_p2_transform_properties as ph2

LOG_FILE = "info_tr.log"
logger = logging.getLogger("transformation")

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
    
    logger.info("Preprocessin started")
    preprocessing_start_time = timer.get_time()
    
    try:
        
        if args.phases in ["both", "cls"]:
            # Phase one
            logger.info("Starting phase 1 - transforming classes")
            phase1_start_time = timer.get_time()
            
            ph1.transform_classes(args.classesBz2File)
            
            phase1_end_time = timer.get_time()
            logger.info("Ending phase 1. Elapsed time %s",
                    timer.get_formated_elapsed_time(phase1_start_time, phase1_end_time))
        
        if args.phases in ["both", "props"]:
            # Phase two
            logger.info("Starting phase 2 - transforming properties")
            phase2_start_time = timer.get_time()
            
            #ph2.transform_properties(args.propertiesBz2File)
            
            phase2_end_time = timer.get_time()
            logger.info("Ending phase 2. Elapsed time %s",
                    timer.get_formated_elapsed_time(phase2_start_time, phase2_end_time))
        
    except Exception as e:
        logger.exception("There was an error that cannot be handled")
        logger.error("Exiting...")
        sys.exit(1)
    
    preprocessing_end_time = timer.get_time()
    logger.info("Preprocessing finished in %s",
                timer.get_formated_elapsed_time(preprocessing_start_time, preprocessing_end_time))
      
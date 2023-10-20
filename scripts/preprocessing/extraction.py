import sys
import argparse
import pathlib
import logging
import utils.timer as timer

import phases.extraction_p1_find_ids as ph1
import phases.extraction_p2_extract_to_file as ph2

LOG_FILE = "info_ex.log"
logger = logging.getLogger("extraction")

if __name__ == "__main__":
    logging.basicConfig(level=20, handlers=[logging.FileHandler("info_ex.log"), logging.StreamHandler(sys.stdout)])
    parser = argparse.ArgumentParser(
                prog="Wikidata class and properties extractor",
                description="""The script extracts classes and properties from the wikidata .bz2 json dump.
                            For the given dump, it iterates over each json line and check whether the entity is class or property.
                            It creates corresponding two files "classes.json.bz2" and "properties.json.bz2".
                            Each file contains a json array where on each line is a wikidata entity.
                            The algorithm runs in two phases. 
                            The first phase extracts class and property Ids from the dump into a set.
                            The second phase iterates over the dump again extracting classes and properties into separate files.
                            """)
    parser.add_argument("bz2DumpFile",
                        type=pathlib.Path, 
                        help="A path to the Wikidata .bz2 json dump file.")
    args = parser.parse_args()
    
    logger.info("Preprocessin started")
    preprocessing_start_time = timer.get_time()
    
    try:
        # Phase one
        logger.info("Starting phase 1 - extracting idsList")
        phase1_start_time = timer.get_time()
        
        wd_entity_ids_set: set = ph1.extract_ids(args.bz2DumpFile)
        
        phase1_end_time = timer.get_time()
        logger.info("Ending phase 1. Elapsed time %s",
                timer.get_formated_elapsed_time(phase1_start_time, phase1_end_time))
        
        # Phase two
        logger.info("Starting phase 2 - extracting entities to files")
        phase2_start_time = timer.get_time()
        
        ph2.extract_classes_properties(args.bz2DumpFile, wd_entity_ids_set)
        
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
      
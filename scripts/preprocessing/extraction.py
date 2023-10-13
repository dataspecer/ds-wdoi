import sys
import argparse
import pathlib
import logging
import utils.timer as timer

import pprint

import phase1_find_ids.extraction_p1_find_ids as ph1
import phase2_extract_to_file.extraction_p2_extract_to_file as ph2

logger = logging.getLogger("extraction")

if __name__ == "__main__":
    logging.basicConfig(level=20)
    pp = pprint.PrettyPrinter(indent=4)
    parser = argparse.ArgumentParser(
                prog="Wikidata class and properties extractor",
                description="""The script extracts classes and properties from the wikidata .bz2 json dump.
                            For the given dump, it iterates over each json line and check whether the entity is class or property.
                            It creates corresponding two files "classes.json" and "properties.json".
                            Each file contains a json array where on each line is a wikidata entity.
                            It can be parsed all at once or reading line be line.
                            """)
    parser.add_argument("bz2DumpFile",
                        type=pathlib.Path, 
                        help="A path to the Wikidata .bz2 json dump file.")
    args = parser.parse_args()
    
    logger.info("Preprocessin started.")
    preprocessing_start_time = timer.get_time()
    
    try:
        # Phase one
        logger.info("Starting phase 1 - extracting idsList")
        phase1_start_time = timer.get_time()
        
        idsSet: set = ph1.extract_ids(args.bz2DumpFile)
        
        phase1_end_time = timer.get_time()
        logger.info("Ending phase 1. Elapsed time %s .",
                timer.get_formated_elapsed_time(phase1_start_time, phase1_end_time))
        
        # Phase two
        logger.info("Starting phase 2 - extracting entities to files")
        phase2_start_time = timer.get_time()
        
        ph2.extract_classes_properties(args.bz2DumpFile, idsSet)
        
        phase2_end_time = timer.get_time()
        logger.info("Ending phase 2. Elapsed time %s .",
                timer.get_formated_elapsed_time(phase2_start_time, phase2_end_time))
    
    except Exception as e:
        logger.error(e)
        logger.error("Exiting...")
        sys.exit(1)
    
    preprocessing_end_time = timer.get_time()
    logger.info("Preprocessing finished in %s .",
                timer.get_formated_elapsed_time(preprocessing_start_time, preprocessing_end_time))
      
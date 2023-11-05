import sys
import argparse
import pathlib
import logging
import utils.timer as timer

import phases.p4_semantic_modification as ph4
import wikidata.modifications.modifier as mods

LOG_FILE = "info_mod.log"
logger = logging.getLogger("modification")

@timer.timed(logger)
def __main(args):
    try:
        classes = ph4.load_classes(args.classesJsonFile)
        properties = ph4.load_properties(args.propertiesJsonFile)
        context = mods.Context(classes, properties)
        ph4.modify_classes(context)
        ph4.modify_properties(context)
        ph4.write_classes_to_file(context.class_map)
        ph4.write_properties_to_file(context.property_map)
    except Exception as e:
        logger.exception("There was an error that cannot be handled")
        logger.error("Exiting...")
        sys.exit(1)
    
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
    
    __main(args)
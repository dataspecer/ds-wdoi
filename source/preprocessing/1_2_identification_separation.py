import sys
import argparse
import pathlib
import logging
import utils.timer as timer
import phases.p1_identification as ph1
import phases.p2_separation as ph2

LOG_FILE = "info_id_sep.log"
logger = logging.getLogger("identification-separation")

@timer.timed(logger)
def __main(args):
    try:
        wd_entity_ids_set: set = ph1.identify_classes_properties(args.bz2DumpFile)
        ph2.separate_to_files(args.bz2DumpFile, wd_entity_ids_set)
    except Exception as e:
        logger.exception("There was an error that cannot be handled")
        logger.critical("Exiting...")
        sys.exit(1)

if __name__ == "__main__":
    logging.basicConfig(level=20, handlers=[logging.FileHandler(LOG_FILE), logging.StreamHandler(sys.stdout)])
    parser = argparse.ArgumentParser(
                prog="Wikidata class and properties identification and separation",
                description="""The script identifies and separates classes and properties from the wikidata .bz2 json dump to two new files.
                            For the given dump, it iterates over each json line and checks whether the entity is a class or a property.
                            It creates corresponding two files "classes.json.bz2" and "properties.json.bz2".
                            Each file contains a json array where on each line is a wikidata entity preserving the Wikidata data model of entities.
                            The algorithm runs in two phases. 
                            The first phase identifies classes and properties Ids from the dump into a set.
                            The second phase iterates over the dump again separating classes and properties into separate files.
                            """)
    parser.add_argument("bz2DumpFile",
                        required=True,
                        type=pathlib.Path, 
                        help="A path to the Wikidata .bz2 json dump file.")
    args = parser.parse_args()
    
    __main(args)
      
import sys
import argparse
import pathlib
import logging
import utils.timer as timer
from wikidata.statistics.property_usage import PropertyUsageStatistics
import phases.p1_identification as ph1
import phases.p2_separation as ph2

LOG_FILE = "info_id_sep.log"
logger = logging.getLogger("identification-separation")

@timer.timed(logger)
def __main(args):
    try:
        property_statistics = PropertyUsageStatistics(logger)
        wd_classes_ids_set, wd_properties_ids_dict = ph1.identify_classes_properties(args.gzipDumpFile, property_statistics)
        property_statistics.first_pass_finished(wd_classes_ids_set, wd_properties_ids_dict)
        ph2.separate_to_files(args.gzipDumpFile, wd_classes_ids_set, wd_properties_ids_dict, property_statistics)
        property_statistics.finalize_statistics()
    except Exception as e:
        logger.exception("There was an error that cannot be handled")
        logger.critical("Exiting...")
        sys.exit(1)

if __name__ == "__main__":
    logging.basicConfig(level=20, handlers=[logging.FileHandler(LOG_FILE), logging.StreamHandler(sys.stdout)])
    parser = argparse.ArgumentParser(
                prog="Wikidata class and properties identification and separation",
                description="""The script identifies and separates classes and properties from the wikidata .gz json dump to two new files.
                            For the given dump, it iterates over each json line and checks whether the entity is a class or a property.
                            It creates corresponding two files "classes.json.gz" and "properties.json.gz".
                            Each file contains a json array where on each line is a wikidata entity preserving the Wikidata data model of entities.
                            The algorithm runs in two phases. 
                            The first phase identifies classes and properties Ids from the dump into a set.
                            The second phase iterates over the dump again separating classes and properties into separate files.
                            """)
    parser.add_argument("gzipDumpFile",
                        type=pathlib.Path, 
                        help="A path to the Wikidata .gz json dump file.")
    args = parser.parse_args()
    
    __main(args)
      
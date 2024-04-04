import sys
import core.utils.logging as ul
import core.utils.timer as timer
from core.utils import timer
from core.statistics.property_usage import PropertyUsageStatistics
import phases.identification_separation.identification as identification
import phases.identification_separation.separation as separation

main_logger = ul.root_logger.getChild("identification_separation")

@timer.timed(main_logger)
def main_identification_separation(gzip_dump_file_path):
    try:
        property_statistics = PropertyUsageStatistics(main_logger)
        wd_classes_ids_set, wd_properties_ids_dict = identification.identify_classes_properties(gzip_dump_file_path, property_statistics)
        property_statistics.first_pass_finished(wd_classes_ids_set, wd_properties_ids_dict)
        separation.separate_to_files(gzip_dump_file_path, wd_classes_ids_set, wd_properties_ids_dict, property_statistics)
        property_statistics.finalize_statistics()
    except Exception as e:
        main_logger.exception("There was an error that cannot be handled")
        main_logger.critical("Exiting...")
        sys.exit(1)
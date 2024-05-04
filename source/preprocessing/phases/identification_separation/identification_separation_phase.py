from pathlib import Path
import core.utils.timer as timer
import phases.identification_separation.identification as identification
import phases.identification_separation.separation as separation
from core.utils import timer
from core.statistics.property_usage import PropertyUsageStatistics
from phases.identification_separation.main_logger import main_logger

@timer.timed(main_logger)
def main_identification_separation(gzip_dump_file_path: Path):
    try:
        property_statistics = PropertyUsageStatistics(main_logger)
        wd_classes_ids_set, wd_properties_ids_dict = identification.identify_classes_properties(gzip_dump_file_path, property_statistics)
        property_statistics.first_pass_finished(wd_classes_ids_set, wd_properties_ids_dict)
        separation.separate_to_files(gzip_dump_file_path, wd_classes_ids_set, wd_properties_ids_dict, property_statistics)
        property_statistics.finalize_statistics()
        return True
    except Exception as e:
        main_logger.exception("There was an error that cannot be handled")
        main_logger.critical("Exiting phase...")
        return False
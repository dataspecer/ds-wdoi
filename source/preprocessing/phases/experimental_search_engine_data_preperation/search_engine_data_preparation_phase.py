from pathlib import Path
from enum import StrEnum
from core.utils.timer import timed
from phases.experimental_search_engine_data_preperation.main_logger import main_logger
from phases.experimental_search_engine_data_preperation.data_entities.data_class import transform_wd_class
from phases.experimental_search_engine_data_preperation.data_entities.data_property import transform_wd_property
import core.utils.decoding as decoding
import core.utils.logging as ul
from phases.experimental_search_engine_data_preperation.reduce_property_usage import reduce_property_usage

class Phases(StrEnum):
    ALL = "all"
    PROPERTY_USAGE_REDUCTION = "reduce"
    EXPAND_TO_LANGUAGE_FIELDS = "expand"
    LEXICALIZE = "lexicalize"
    VECTORIZE = "vectorize"

@timed(main_logger)
def __load_classes_to_dict(classes_json_file_path: Path) -> dict:
    return decoding.load_entities_to_dict(classes_json_file_path, main_logger, ul.CLASSES_PROGRESS_STEP, transform_wd_class)

@timed(main_logger)
def __load_properties_to_dict(properties_json_file_path: Path) -> dict:
    return decoding.load_entities_to_dict(properties_json_file_path, main_logger, ul.PROPERTIES_PROGRESS_STEP, transform_wd_property)

@timed(main_logger)
def main_search_engine_data_preparation(phase: Phases, classes_json_file_path: Path, properties_json_file_path: Path, gzip_json_dump_file_path: Path) -> bool:
    try:
        classes_dict = __load_classes_to_dict(classes_json_file_path)
        properties_dict = __load_properties_to_dict(properties_json_file_path)
        
        if phase in [Phases.ALL, Phases.PROPERTY_USAGE_REDUCTION]:
            reduce_property_usage(classes_dict, properties_dict)
            
        return True
    except Exception as e:
        main_logger.exception("There was an error that cannot be handled")
        main_logger.critical("Exiting phase...")
        return False
from pathlib import Path
from enum import StrEnum
from core.utils.timer import timed
from phases.experimental_search_engine_data_preparation.main_logger import main_logger
from phases.experimental_search_engine_data_preparation.data_entities.data_class import transform_wd_class
from phases.experimental_search_engine_data_preparation.data_entities.data_property import transform_wd_property
import core.utils.decoding as decoding
import core.utils.logging as ul
import phases.experimental_search_engine_data_preparation.phase_parts.reduce_property_usage.reduce_property_usage_part as reduce
import phases.experimental_search_engine_data_preparation.phase_parts.expand_to_language_fields.expand_to_language_fields_part as expand
import phases.experimental_search_engine_data_preparation.phase_parts.lexicalize_entities.lexicalize_entities_part as lex
import phases.experimental_search_engine_data_preparation.phase_parts.vectorize.vectorize_part as vectorize
import phases.experimental_search_engine_data_preparation.phase_parts.minimize.minimize_for_search_service as minimize

class Phases(StrEnum):
    ALL = "all"
    PROPERTY_USAGE_REDUCTION = "reduce"
    EXPAND_TO_LANGUAGE_FIELDS = "expand"
    LEXICALIZE = "lexicalize"
    VECTORIZE = "vectorize"
    MINIMIZE = "minimize"

@timed(main_logger)
def __load_classes_to_dict(classes_json_file_path: Path) -> dict:
    return decoding.load_entities_to_dict(classes_json_file_path, main_logger, ul.CLASSES_PROGRESS_STEP, transform_wd_class)

@timed(main_logger)
def __load_properties_to_dict(properties_json_file_path: Path) -> dict:
    return decoding.load_entities_to_dict(properties_json_file_path, main_logger, ul.PROPERTIES_PROGRESS_STEP, transform_wd_property)

@timed(main_logger)
def main_search_engine_data_preparation(phase: Phases, classes_json_file_path: Path, properties_json_file_path: Path, gzip_json_dump_file_path: Path) -> bool:
    try:
        
        if phase in [Phases.ALL, Phases.PROPERTY_USAGE_REDUCTION]:
            classes_dict = __load_classes_to_dict(classes_json_file_path)
            properties_dict = __load_properties_to_dict(properties_json_file_path)
            reduce.reduce_property_usage(classes_dict, properties_dict)
            
        if phase in [Phases.ALL, Phases.EXPAND_TO_LANGUAGE_FIELDS]:
            expand.expand_to_langauge_fields(reduce.CLASSE_OUTPUT_FILE_PATH, gzip_json_dump_file_path)
            
        if phase in [Phases.ALL, Phases.LEXICALIZE]:
            lex.lexicalize_entities(reduce.CLASSE_OUTPUT_FILE_PATH, reduce.PROPERTIES_OUTPUT_FILE_PATH, expand.CLASSES_OUTPUT_FILE_PATH)
            
        if phase in [Phases.ALL, Phases.VECTORIZE]:
            vectorize.vectorize_entities(reduce.CLASSE_OUTPUT_FILE_PATH, reduce.PROPERTIES_OUTPUT_FILE_PATH, lex.CLASSE_OUTPUT_FILE_PATH, lex.PROPERTIES_OUTPUT_FILE_PATH)
        
        if phase in [Phases.ALL, Phases.MINIMIZE]:
            minimize.minimize_for_search_service(vectorize.CLASSE_OUTPUT_FILE_PATH, vectorize.PROPERTIES_OUTPUT_FILE_PATH)            
            
        return True
    except Exception as e:
        main_logger.exception("There was an error that cannot be handled")
        main_logger.critical("Exiting phase...")
        return False
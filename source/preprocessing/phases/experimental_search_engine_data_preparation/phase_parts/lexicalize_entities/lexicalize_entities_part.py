from pathlib import Path
from phases.experimental_search_engine_data_preparation.main_logger import main_logger
from core.utils.timer import timed
from phases.experimental_search_engine_data_preparation.data_entities.data_class import DataClassFields
from phases.experimental_search_engine_data_preparation.data_entities.data_property import DataPropertyFields
import core.utils.logging as ul
import core.utils.decoding as decoding
from core.output_directory import OUTPUT_DIR_PATH

logger = main_logger.getChild("lexicalize_entities")

CLASSE_OUTPUT_FILE_PATH = OUTPUT_DIR_PATH / "classes-experimental-prep-3-lexicalize.json" 
PROPERTIES_OUTPUT_FILE_PATH = OUTPUT_DIR_PATH / "properties-experimental-prep-3-lexicalize.json" 

@timed(logger)
def __load_classes_to_dict(classes_json_file_path: Path) -> dict:
    return decoding.load_entities_to_dict(classes_json_file_path, logger, ul.CLASSES_PROGRESS_STEP)

@timed(logger)
def __load_properties_to_dict(classes_json_file_path: Path) -> dict:
    return decoding.load_entities_to_dict(classes_json_file_path, logger, ul.CLASSES_PROGRESS_STEP)

@timed(logger)
def __load_expanded_labels_to_dict(expanded_labels_json_file_path: Path) -> dict:
    return decoding.load_entities_to_dict(expanded_labels_json_file_path, logger, ul.PROPERTIES_PROGRESS_STEP)

@timed(logger)
def __write_dicts_to_files(classes_dict, properties_dict):
    decoding.write_entities_dict_to_file(classes_dict, CLASSE_OUTPUT_FILE_PATH)
    decoding.write_entities_dict_to_file(properties_dict, PROPERTIES_OUTPUT_FILE_PATH)

@timed(logger)
def __lexicalize_classes(classes_dict: dict, properties_dict: dict, expanded_labels_dict: dict):
    pass

@timed(logger)
def __lexicalize_properties(classes_dict: dict, properties_dict: dict, expanded_labels_dict: dict):
    pass    

@timed(logger)
def reduce_property_usage(classes_json_file_path: Path, properties_json_file_path: Path, expanded_labels_json_file_path: Path):
    classes_dict = __load_classes_to_dict(classes_json_file_path)
    properties_dict = __load_properties_to_dict(properties_json_file_path)
    expanded_labels_dict = __load_expanded_labels_to_dict(expanded_labels_json_file_path)
    __lexicalize_classes(classes_dict, properties_dict, expanded_labels_dict)
    __lexicalize_properties(classes_dict, properties_dict, expanded_labels_dict)
    __write_dicts_to_files(classes_dict, properties_dict)
    
    
    
    
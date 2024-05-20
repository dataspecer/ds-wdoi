from pathlib import Path
from phases.experimental_search_engine_data_preparation.main_logger import main_logger
from core.utils.timer import timed
from phases.experimental_search_engine_data_preparation.data_entities.data_class import DataClassFields
from phases.experimental_search_engine_data_preparation.data_entities.data_property import DataPropertyFields
import core.utils.logging as ul
import core.utils.decoding as decoding
from core.output_directory import OUTPUT_DIR_PATH
from phases.experimental_search_engine_data_preparation.phase_parts.lexicalize_entities.fields_lexicalization.class_fields_lexicalization import lexicalize_wd_data_class
from phases.experimental_search_engine_data_preparation.phase_parts.lexicalize_entities.fields_lexicalization.properties_fields_lexicalization import lexicalize_wd_data_property

logger = main_logger.getChild("lexicalize_entities")

CLASSE_OUTPUT_FILE_PATH = OUTPUT_DIR_PATH / "classes-experimental-prep-3-lexicalize.json" 
PROPERTIES_OUTPUT_FILE_PATH = OUTPUT_DIR_PATH / "properties-experimental-prep-3-lexicalize.json" 

@timed(logger)
def __load_classes_to_dict(classes_json_file_path: Path) -> dict:
    return decoding.load_entities_to_dict(classes_json_file_path, logger, ul.CLASSES_PROGRESS_STEP)

@timed(logger)
def __load_properties_to_dict(classes_json_file_path: Path) -> dict:
    return decoding.load_entities_to_dict(classes_json_file_path, logger, ul.PROPERTIES_PROGRESS_STEP)

@timed(logger)
def __load_expanded_labels_to_dict(expanded_labels_json_file_path: Path) -> dict:
    return decoding.load_entities_to_dict(expanded_labels_json_file_path, logger, ul.CLASSES_PROGRESS_STEP)

@timed(logger)
def __write_dicts_to_files(classes_lex_dict, properties_lex_dict):
    decoding.write_entities_dict_to_file(classes_lex_dict, CLASSE_OUTPUT_FILE_PATH)
    decoding.write_entities_dict_to_file(properties_lex_dict, PROPERTIES_OUTPUT_FILE_PATH)

@timed(logger)
def __lexicalize_classes(classes_dict: dict, expanded_labels_dict: dict):
    classes_lex_dict = dict()
    for i, [wd_data_class_id, wd_data_class] in enumerate(classes_dict.items()):
        lex_map = lexicalize_wd_data_class(wd_data_class, classes_dict, expanded_labels_dict)
        classes_lex_dict[wd_data_class_id] = { 
                DataClassFields.ID.value: wd_data_class_id,
                DataClassFields.LEXICALIZATION.value: lex_map
            }
        ul.try_log_progress(logger, i, ul.CLASSES_PROGRESS_STEP)
    return classes_lex_dict

@timed(logger)
def __lexicalize_properties(properties_dict: dict):
    properties_lex_dict = dict()
    for i, [wd_data_property_id, wd_data_property] in enumerate(properties_dict.items()):
        lex_map = lexicalize_wd_data_property(wd_data_property)
        properties_lex_dict[wd_data_property_id] = { 
                DataPropertyFields.ID.value: wd_data_property_id,
                DataPropertyFields.LEXICALIZATION.value: lex_map
            }
        ul.try_log_progress(logger, i, ul.PROPERTIES_PROGRESS_STEP)
    return properties_lex_dict

@timed(logger)
def lexicalize_entities(classes_json_file_path: Path, properties_json_file_path: Path, expanded_labels_json_file_path: Path):
    classes_dict = __load_classes_to_dict(classes_json_file_path)
    properties_dict = __load_properties_to_dict(properties_json_file_path)
    expanded_labels_dict = __load_expanded_labels_to_dict(expanded_labels_json_file_path)
    classes_lex_dict = __lexicalize_classes(classes_dict, expanded_labels_dict)
    properties_lex_dict = __lexicalize_properties(properties_dict)
    __write_dicts_to_files(classes_lex_dict, properties_lex_dict)
    
    
    
    
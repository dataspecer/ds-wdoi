from pathlib import Path
import core.utils.logging as ul
import core.utils.decoding as decoding
from core.utils.timer import timed
from phases.property_recommendations.boost_score_for_properties_for_this_type import boost_score_for_properties_for_this_type
from phases.property_recommendations.merge_property_constraints_with_usage_statistics import merge_property_subject_object_type_constraints_into_usage_statistics
from phases.property_recommendations.main_logger import main_logger

CLASSES_OUTPUT_FILE_PATH = Path(".") / "classes-recs.json"
PROPERTIES_OUTPUT_FILE_PATH = Path(".") / "properties-recs.json"

@timed(main_logger)
def __load_classes_to_dict(json_file_path: Path) -> dict:
    return decoding.load_entities_to_dict(json_file_path, main_logger, ul.CLASSES_PROGRESS_STEP)

@timed(main_logger)
def __load_properties_to_dict(json_file_path: Path) -> dict:
    return decoding.load_entities_to_dict(json_file_path, main_logger, ul.PROPERTIES_PROGRESS_STEP)

@timed(main_logger)
def __write_classes_to_file(classes_dict: dict):
    decoding.write_entities_dict_to_file(classes_dict, CLASSES_OUTPUT_FILE_PATH)

@timed(main_logger)
def __write_properties_to_file(properties_dict: dict):
    decoding.write_entities_dict_to_file(properties_dict, PROPERTIES_OUTPUT_FILE_PATH)

@timed(main_logger)
def __merge_property_constraints_with_usage(classes_dict: dict, properties_dict: dict):
    merge_property_subject_object_type_constraints_into_usage_statistics(classes_dict, properties_dict)

@timed(main_logger)
def __boost_properties_for_this_type(classes_dict: dict):
    boost_score_for_properties_for_this_type(classes_dict)

@timed(main_logger)
def __store_results(classes_dict: dict, properties_dict: dict):
    __write_properties_to_file(properties_dict)
    __write_classes_to_file(classes_dict)

@timed(main_logger)
def __compute_recommendations(classes_json_file_path: Path, properties_json_file_path: Path):
    properties_dict = __load_properties_to_dict(properties_json_file_path)
    classes_dict = __load_classes_to_dict(classes_json_file_path)
    __merge_property_constraints_with_usage(classes_dict, properties_dict)
    __boost_properties_for_this_type(classes_dict)
    __store_results(classes_dict, properties_dict)

@timed(main_logger)
def main_property_recommendations(classe_json_file: Path, properties_json_file: Path):
    try:
        __compute_recommendations(classe_json_file, properties_json_file)
        return True
    except Exception as e:
        main_logger.exception("There was an error that cannot be handled")
        main_logger.critical("Exiting phase...")
        return False
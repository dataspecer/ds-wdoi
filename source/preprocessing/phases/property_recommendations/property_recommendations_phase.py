import pathlib
import logging
import core.utils.logging as ul
import core.utils.decoding as decoding
from core.utils.timer import timed
from phases.property_recommendations.merge_constraints_with_usage_statistics import merge_property_constraints_with_usage_statistics

main_logger = logging.getLogger("recommendations").getChild("p5_property_recommendations")

CLASSES_OUTPUT_FILE = "classes-recs.json"
PROPERTIES_OUTPUT_FILE = "properties-recs.json"

@timed(main_logger)
def __load_classes_to_dict(json_file_path: pathlib.Path) -> dict:
    return decoding.load_entities_to_dict(json_file_path, main_logger, ul.CLASSES_PROGRESS_STEP)

@timed(main_logger)
def __load_properties_to_dict(json_file_path: pathlib.Path) -> dict:
    return decoding.load_entities_to_dict(json_file_path, main_logger, ul.PROPERTIES_PROGRESS_STEP)

@timed(main_logger)
def __write_classes_to_file(classes_dict: dict):
    decoding.write_mapped_entities_to_file(classes_dict, CLASSES_OUTPUT_FILE)

@timed(main_logger)
def __write_properties_to_file(properties_dict: dict):
    decoding.write_mapped_entities_to_file(properties_dict, PROPERTIES_OUTPUT_FILE)

@timed(main_logger)
def __merge_constraints_with_statistics_usage(classes_dict: dict, properties_dict :dict):
    merge_property_constraints_with_usage_statistics(classes_dict, properties_dict)

@timed(main_logger)
def __boost_properties_for_this_type(classes_dict: dict, properties:dict):
    pass

@timed(main_logger)
def __store_results(classes_dict: dict, properties_dict: dict):
    __write_properties_to_file(properties_dict)
    __write_classes_to_file(classes_dict)

@timed(main_logger)
def compute_recommendations(classes_json_file_path: pathlib.Path, properties_json_file_path: pathlib.Path):
    properties_dict = __load_properties_to_dict(properties_json_file_path)
    classes_dict = __load_classes_to_dict(classes_json_file_path)
    __merge_constraints_with_statistics_usage(classes_dict, properties_dict)
    __boost_properties_for_this_type(classes_dict, properties_dict)
    __store_results(classes_dict, properties_dict)

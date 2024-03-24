import pathlib
import logging
import core.utils.logging as ul
import core.utils.decoding as decoding
from core.utils.timer import timed
from phases.modification.modifiers.context import Context

main_logger = logging.getLogger("recommendations").getChild("p5_property_recommendations")

CLASSES_OUTPUT_FILE = "classes-recs.json"
PROPERTIES_OUTPUT_FILE = "properties-recs.json"

@timed(main_logger)
def __load_classes_to_map(json_file_path: pathlib.Path) -> dict:
    return decoding.load_entities_to_map(json_file_path, main_logger, ul.CLASSES_PROGRESS_STEP)

@timed(main_logger)
def __load_properties_to_map(json_file_path: pathlib.Path) -> dict:
    return decoding.load_entities_to_map(json_file_path, main_logger, ul.PROPERTIES_PROGRESS_STEP)

@timed(main_logger)
def __write_classes_to_file(class_map: dict):
    decoding.write_mapped_entities_to_file(class_map, CLASSES_OUTPUT_FILE)

@timed(main_logger)
def __write_properties_to_file(property_map: dict):
    decoding.write_mapped_entities_to_file(property_map, PROPERTIES_OUTPUT_FILE)

@timed(main_logger)
def __merge_constraints_with_statistics_usage(context: Context):
    pass

@timed(main_logger)
def __boost_properties_for_this_type(context: Context):
    pass

@timed(main_logger)
def __store_results(context: Context):
    __write_properties_to_file(context.property_map)
    __write_classes_to_file(context.class_map)

@timed(main_logger)
def compute_recommendations(classes_json_file_path: pathlib.Path, properties_json_file_path: pathlib.Path):
    properties = __load_properties_to_map(properties_json_file_path)
    classes = __load_classes_to_map(classes_json_file_path)
    context = Context(classes, properties)
    __merge_constraints_with_statistics_usage(context)
    __boost_properties_for_this_type(context)
    __store_results(context)

import pathlib
import utils.property_recommender as pr
import logging
import utils.logging as ul
import utils.decoding as decoding
from utils.timer import timed
from wikidata.modifications.context import RecommendationContext
from wikidata.modifications.recommendations.subject_of_sorting import SubjectOfSorting
from wikidata.modifications.recommendations.value_of_sorting import ValueOfSorting

main_logger = logging.getLogger("recommendations").getChild("p5_property_recommendations")

GLOBAL_REC_SUBJECT_OUTPUT_FILE = "global-recs-subject.json"
GLOBAL_REC_VALUE_OUTPUT_FILE = "global-recs-value.json"
CLASSES_OUTPUT_FILE = "classes-recs"
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
def __store_global_recs(global_recs, output_file):
    with open(output_file, "wb") as global_recs_file:
        decoding.write_json_to_file(global_recs, global_recs_file)

@timed(main_logger)
def __compute_local_recs(context: RecommendationContext):
    subject_of_sorting = SubjectOfSorting(main_logger, context)
    subject_of_sorting.modify_all()
    value_of_sorting = ValueOfSorting(main_logger, context)
    value_of_sorting.modify_all()

def __load_global_recs_subject(properties: dict):
    global_recs = pr.get_global_recs()
    global_recs_map = pr.create_map_from_recs(global_recs)
    pr.fill_missing_global_recs_props(global_recs, global_recs_map, properties)
    return global_recs, global_recs_map

def __store_results(global_recs_subject: list, context: RecommendationContext):
    __store_global_recs(global_recs_subject, GLOBAL_REC_SUBJECT_OUTPUT_FILE)
    __store_global_recs(pr.flatten_global_recs_map(context.global_recs_value_map, context.property_map), GLOBAL_REC_VALUE_OUTPUT_FILE)
    __write_properties_to_file(context.property_map)
    __write_classes_to_file(context.class_map)

@timed(main_logger)
def compute_recommendations(classes_json_file_path: pathlib.Path, properties_json_file_path: pathlib.Path):
    properties = __load_properties_to_map(properties_json_file_path)
    classes = __load_classes_to_map(classes_json_file_path)
    global_recs_subject, global_recs_subject_map = __load_global_recs_subject(properties)
    context = RecommendationContext(classes, properties, global_recs_subject_map)
    __compute_local_recs(context)
    __store_results(global_recs_subject, context)

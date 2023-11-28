import pathlib
import utils.property_recommender as pr
import logging
import utils.logging as ul
import utils.decoding as decoding
from utils.timer import timed
from wikidata.modifications.context import RecommendationContext

main_logger = logging.getLogger("recommendations").getChild("p5_property_recommendations")

GLOBAL_REC_OUTPUT_FILE = "global-recs.json"
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
def __load_global_recs() -> list:
    return pr.get_global_recs()

def __create_map_from_recs(recs) -> dict:
    recs_map = dict()
    for rec_hit in recs:
        prop_num_id = int(rec_hit["property"][1:])
        recs_map[prop_num_id] = rec_hit["probability"] 
    return recs_map

@timed(main_logger)
def __store_global_recs(global_recs):
    with open(GLOBAL_REC_OUTPUT_FILE, "wb") as global_recs_file:
        decoding.write_json_to_file(global_recs, global_recs_file)

@timed(main_logger)
def __compute_local_recs(context: RecommendationContext):
    
    
    pass

@timed(main_logger)
def compute_recommendations(classes_json_file_path: pathlib.Path, properties_json_file_path: pathlib.Path):
    global_recs = __load_global_recs()
    global_recs_map = __create_map_from_recs(global_recs)
    classes = __load_classes_to_map(classes_json_file_path)
    properties = __load_properties_to_map(properties_json_file_path)
    context = RecommendationContext(classes, properties, global_recs_map)
    __compute_local_recs(context)
    __store_global_recs(global_recs)
    __write_classes_to_file(context.class_map)
    __write_properties_to_file(context.property_map)

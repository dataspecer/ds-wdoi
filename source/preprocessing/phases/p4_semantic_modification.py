import pathlib
import logging 
import utils.decoding as decoding
import utils.logging as ul
from utils.timer import timed
from wikidata.modifications.properties.remove_unexisting_references_main import *
from wikidata.modifications.properties.remove_unexisting_references_general_constraints import *
from wikidata.modifications.properties.remove_unexisting_references_item_constraints import *
from wikidata.modifications.modifier import *
from wikidata.modifications.classes.all_classes_are_rooted import *
from wikidata.modifications.classes.remove_unexisting_references import *
from wikidata.modifications.classes.mark_children_to_parents import *

main_logger = logging.getLogger("modification")
classes_logger = main_logger.getChild("p4_modify_classes")
properties_logger = main_logger.getChild("p4_modify_properties")

CLASSES_OUTPUT_FILE = 'classes-final.json'
PROPERTIES_OUTPUT_FILE = 'properties-final.json'

def __log_sum_status(logger, entity_map: dict):
    logger.info(f"Loaded {len(entity_map)} entities")

def __load_entities(json_file_path: pathlib.Path, logger, logging_step): 
    entity_map = dict()
    with open(json_file_path, "rb") as input_json_file:
        for wd_entity in decoding.entities_generator(input_json_file, logger, logging_step):
            entity_map[wd_entity['id']] = wd_entity
        __log_sum_status(logger, entity_map)
    return entity_map
    
@timed(classes_logger)
def load_classes(json_file_path: pathlib.Path) -> dict:
    return __load_entities(json_file_path, classes_logger, ul.CLASSES_PROGRESS_STEP)

@timed(properties_logger)
def load_properties(json_file_path: pathlib.Path) -> dict:
    return __load_entities(json_file_path, properties_logger, ul.PROPERTIES_PROGRESS_STEP)


def __modify_entities(modifiers, entity_map: dict, context: mods.Context, logger, logging_step):
    for idx, entity in enumerate(entity_map.values()):
        for modifier_func in modifiers:
            modifier_func(entity, context)
        ul.try_log_progress(logger, idx, logging_step)

@timed(classes_logger)
def modify_classes(context: mods.Context):
    modifiers = [RemoveUnexistingReferencesClasses(classes_logger), AllClassesAreRooted(classes_logger), MarkChildrenToParents(classes_logger)]
    __modify_entities(modifiers, context.class_map, context, classes_logger, ul.CLASSES_PROGRESS_STEP)
    for mod in modifiers:
        mod.report_status()

@timed(properties_logger)
def modify_properties(context: mods.Context):
    modifiers = [RemoveUnexistingReferencesMainProperties(properties_logger), RemoveUnexistingReferencesGeneralConstraintsProperties(properties_logger), RemoveUnexistingReferencesItemConstraintsProperties(properties_logger)]
    __modify_entities(modifiers, context.property_map, context, properties_logger, ul.PROPERTIES_PROGRESS_STEP)
    for mod in modifiers:
        mod.report_status()
    
def __write_entities_to_file(entity_map: dict, file_name: pathlib.Path):
    with open(file_name, "wb") as output_file:
        decoding.init_json_array_in_files([output_file])
        for wd_entity in entity_map.values():
            decoding.write_wd_entity_to_file(wd_entity, output_file)
        decoding.close_json_array_in_files([output_file])
    
@timed(classes_logger)
def write_classes_to_file(class_map: dict):
    __write_entities_to_file(class_map, CLASSES_OUTPUT_FILE)

@timed(properties_logger)
def write_properties_to_file(property_map: dict):
    __write_entities_to_file(property_map, PROPERTIES_OUTPUT_FILE)
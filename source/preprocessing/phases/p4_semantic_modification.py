import pathlib
import logging 
import utils.decoding as decoding
import utils.logging as ul
from utils.timer import timed
from wikidata.modifications.modifiers.properties.remove_unexisting_references_main import *
from wikidata.modifications.modifiers.properties.remove_unexisting_references_general_constraints import *
from wikidata.modifications.modifiers.properties.remove_unexisting_references_item_constraints import *
from wikidata.modifications.modifiers.properties.remove_self_cycles import *
from wikidata.modifications.modifiers.properties.assign_subject_object_values_to_classes import *
from wikidata.modifications.context import Context
from wikidata.modifications.modifiers.classes.all_classes_are_rooted import *
from wikidata.modifications.modifiers.classes.remove_unexisting_references import *
from wikidata.modifications.modifiers.classes.mark_children_to_parents import *
from wikidata.modifications.modifiers.classes.remove_self_cycles import *
from wikidata.modifications.modifiers.classes.add_fields import *
from wikidata.modifications.removers.remove_entities_with_no_label import *
from wikidata.modifications.removers.remove_classes_with_no_parent import *

main_logger = logging.getLogger("modification")
classes_logger = main_logger.getChild("p4_modify_classes")
properties_logger = main_logger.getChild("p4_modify_properties")

CLASSES_OUTPUT_FILE = 'classes-mod.json'
PROPERTIES_OUTPUT_FILE = 'properties-mod.json'

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
def __load_classes(json_file_path: pathlib.Path) -> dict:
    return __load_entities(json_file_path, classes_logger, ul.CLASSES_PROGRESS_STEP)

@timed(properties_logger)
def __load_properties(json_file_path: pathlib.Path) -> dict:
    return __load_entities(json_file_path, properties_logger, ul.PROPERTIES_PROGRESS_STEP)


def __write_entities_to_file(entity_map: dict, file_name: pathlib.Path):
    with open(file_name, "wb") as output_file:
        decoding.init_json_array_in_files([output_file])
        for wd_entity in entity_map.values():
            decoding.write_wd_entity_to_file(wd_entity, output_file)
        decoding.close_json_array_in_files([output_file])
    
@timed(classes_logger)
def __write_classes_to_file(class_map: dict):
    __write_entities_to_file(class_map, CLASSES_OUTPUT_FILE)

@timed(properties_logger)
def __write_properties_to_file(property_map: dict):
    __write_entities_to_file(property_map, PROPERTIES_OUTPUT_FILE)


def __modify_entities(modifiers, entity_map: dict, context: Context, logger, logging_step):
    for idx, entity in enumerate(entity_map.values()):
        for modifier_func in modifiers:
            modifier_func(entity, context)
        ul.try_log_progress(logger, idx, logging_step)

def __report_status_of_modifiers(modifiers):
    for mod in modifiers:
        mod.report_status()


@timed(main_logger)
def __remove_entities_with_empty_labels(context: Context):
    remover = RemoveEntitiesWithNoLabel(main_logger, context)
    remover.remove_all()

@timed(classes_logger)
def __pre_unrooted_classes_removal(context: Context):
    logger = classes_logger.getChild("pre-unrooted-classes-removal")
    modifiers = [
        AddFields(logger), 
        RemoveUnexistingReferencesClasses(logger), 
        RemoveSelfCyclesClass(logger), 
        MarkChildrenToParents(logger)
    ]
    __modify_entities(modifiers, context.class_map, context, logger, ul.CLASSES_PROGRESS_STEP)
    __report_status_of_modifiers(modifiers)

@timed(classes_logger)
def __remove_unrooted_classes(context: Context):
    remover = RemoveClassesWithNoParent(classes_logger, context)
    remover.remove_all()
    
@timed(classes_logger)
def __post_unrooted_classes_removal(context: Context):
    logger = classes_logger.getChild("post-unrooted-classes-removal")
    modifiers = [
        RemoveUnexistingReferencesClasses(logger),
        AllClassesAreRooted(logger) # as a check
    ]
    __modify_entities(modifiers, context.class_map, context, logger, ul.CLASSES_PROGRESS_STEP)
    __report_status_of_modifiers(modifiers)

@timed(properties_logger)
def __modify_properties(context: Context):
    modifiers = [
        RemoveUnexistingReferencesMainProperties(properties_logger), 
        RemoveUnexistingReferencesGeneralConstraintsProperties(properties_logger),
        RemoveUnexistingReferencesItemConstraintsProperties(properties_logger),
        RemoveSelfCyclesProperty(properties_logger),
        AssignSubjectValueToClasses(properties_logger)
    ]
    __modify_entities(modifiers, context.property_map, context, properties_logger, ul.PROPERTIES_PROGRESS_STEP)
    __report_status_of_modifiers(modifiers)

"""
The order matters here.
First we remove entities that has no label.
After that we prepare ground for removing unrooted classes by removing unexisting references, adding fields and marking children to parents.
After the unrooted classes removal, we remove any hanging references to the removed classes. The all classes are rooted is just a check.
After we can safely modify properties.
"""
@timed(main_logger)
def __modify_context(context: Context):
    __remove_entities_with_empty_labels(context)
    __pre_unrooted_classes_removal(context)
    __remove_unrooted_classes(context)
    __post_unrooted_classes_removal(context)
    __modify_properties(context)

@timed(main_logger)
def modify(classes_json_file_path: pathlib.Path, properties_json_file_path: pathlib.Path):
    classes = __load_classes(classes_json_file_path)
    properties = __load_properties(properties_json_file_path)
    context = Context(classes, properties)
    __modify_context(context)
    __write_classes_to_file(context.class_map)
    __write_properties_to_file(context.property_map)
    
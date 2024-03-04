import pathlib
import logging 
import utils.decoding as decoding
import utils.logging as ul
from utils.timer import timed
from wikidata.modifications.modifiers.properties.remove_unexisting_references_main import *
from wikidata.modifications.modifiers.properties.remove_unexisting_references_general_constraints import *
from wikidata.modifications.modifiers.properties.remove_unexisting_references_item_constraints import *
from wikidata.modifications.modifiers.properties.remove_self_cycles import *
from wikidata.modifications.modifiers.properties.mark_subproperties_to_parents import *
from wikidata.modifications.modifiers.properties.assign_subject_object_values_to_classes import *
from wikidata.modifications.mergers.classes_property_usage_stats_merger import *
from wikidata.modifications.mergers.properties_domain_range_usage_stats_merger import *
from wikidata.modifications.context import Context
from wikidata.modifications.modifiers.classes.all_classes_are_rooted import *
from wikidata.modifications.modifiers.classes.remove_unexisting_references import *
from wikidata.modifications.modifiers.classes.mark_children_to_parents import *
from wikidata.modifications.modifiers.classes.mark_instances_to_parents import *
from wikidata.modifications.modifiers.classes.remove_self_cycles import *
from wikidata.modifications.modifiers.classes.add_fields import *
from wikidata.modifications.removers.remove_entities_with_no_label import *
from wikidata.modifications.removers.remove_classes_with_no_parent import *

main_logger = logging.getLogger("modification")
classes_logger = main_logger.getChild("p4_modify_classes")
properties_logger = main_logger.getChild("p4_modify_properties")

CLASSES_OUTPUT_FILE = 'classes-mod.json'
PROPERTIES_OUTPUT_FILE = 'properties-mod.json'

@timed(classes_logger)
def __load_classes_to_map(json_file_path: pathlib.Path) -> dict:
    return decoding.load_entities_to_map(json_file_path, classes_logger, ul.CLASSES_PROGRESS_STEP)

@timed(properties_logger)
def __load_properties_to_map(json_file_path: pathlib.Path) -> dict:
    return decoding.load_entities_to_map(json_file_path, properties_logger, ul.PROPERTIES_PROGRESS_STEP)
    
@timed(classes_logger)
def __write_classes_to_file(class_map: dict):
    decoding.write_mapped_entities_to_file(class_map, CLASSES_OUTPUT_FILE)

@timed(properties_logger)
def __write_properties_to_file(property_map: dict):
    decoding.write_mapped_entities_to_file(property_map, PROPERTIES_OUTPUT_FILE)

def __modify_entities(modifiers, entity_map: dict, logger, logging_step):
    for idx, entity in enumerate(entity_map.values()):
        for modifier_func in modifiers:
            modifier_func(entity)
        ul.try_log_progress(logger, idx, logging_step)

def __report_status_of_modifiers(modifiers):
    for mod in modifiers:
        mod.report_status()

@timed(main_logger)
def __merge_property_usage_stats(context: Context, classes_property_usage_stats_filename: pathlib.Path, properties_domain_range_usage_stats_filename: pathlib.Path):
    cls_merger = ClassesPropertyUsageStatsMerger(classes_logger, context, classes_property_usage_stats_filename)
    cls_merger.modify_all()
    cls_merger.report_status()
    
    props_merger = PropertiesDomainRangeUsageStatsMerger(properties_logger, context, properties_domain_range_usage_stats_filename)
    props_merger.modify_all()
    props_merger.report_status()

@timed(main_logger)
def __remove_entities_with_empty_labels(context: Context):
    remover = RemoveEntitiesWithNoLabel(main_logger, context)
    remover.modify_all()

@timed(classes_logger)
def __pre_unrooted_classes_removal(context: Context):
    logger = classes_logger.getChild("pre-unrooted-classes-removal")
    modifiers = [
        AddFields(logger, context), 
        RemoveUnexistingReferencesClasses(logger, context), 
        RemoveSelfCyclesClass(logger, context), 
        MarkChildrenToParents(logger, context),
        MarkInstancesToParents(logger, context),
    ]
    __modify_entities(modifiers, context.class_map, logger, ul.CLASSES_PROGRESS_STEP)
    __report_status_of_modifiers(modifiers)

@timed(classes_logger)
def __remove_unrooted_classes(context: Context):
    logger = classes_logger.getChild("unrooted-classes-removal")
    remover = RemoveClassesWithNoParent(logger, context)
    remover.modify_all()
    
@timed(classes_logger)
def __post_unrooted_classes_removal(context: Context):
    logger = classes_logger.getChild("post-unrooted-classes-removal")
    modifiers = [
        RemoveUnexistingReferencesClasses(logger, context),
        AllClassesAreRooted(logger, context) # as a check
    ]
    __modify_entities(modifiers, context.class_map, logger, ul.CLASSES_PROGRESS_STEP)
    __report_status_of_modifiers(modifiers)

@timed(properties_logger)
def __modify_properties(context: Context):
    modifiers = [
        RemoveUnexistingReferencesMainProperties(properties_logger, context), 
        RemoveUnexistingReferencesGeneralConstraintsProperties(properties_logger, context),
        RemoveUnexistingReferencesItemConstraintsProperties(properties_logger, context),
        RemoveSelfCyclesProperty(properties_logger, context),
        AssignSubjectValueToClasses(properties_logger, context),
        MarkSubpropertiesToParents(properties_logger, context)
    ]
    __modify_entities(modifiers, context.property_map, properties_logger, ul.PROPERTIES_PROGRESS_STEP)
    __report_status_of_modifiers(modifiers)

"""
The order matters here.
First we remove entities that has no label.
After that we prepare ground for removing unrooted classes by removing unexisting references, adding fields and marking children to parents.
After the unrooted classes removal, we remove any hanging references to the removed classes. The all classes are rooted is just a check.
After we can safely modify properties.
"""
@timed(main_logger)
def __modify_context(context: Context, classes_property_usage_stats_filename: pathlib.Path, properties_domain_range_usage_stats_filename: pathlib.Path):
    __merge_property_usage_stats(classes_property_usage_stats_filename, properties_domain_range_usage_stats_filename)
    __remove_entities_with_empty_labels(context)
    __pre_unrooted_classes_removal(context)
    __remove_unrooted_classes(context)
    __post_unrooted_classes_removal(context)
    __modify_properties(context)

@timed(main_logger)
def modify(classes_json_file_path: pathlib.Path, properties_json_file_path: pathlib.Path, classes_property_usage_stats_filename: pathlib.Path, properties_domain_range_usage_stats_filename: pathlib.Path):
    classes = __load_classes_to_map(classes_json_file_path)
    properties = __load_properties_to_map(properties_json_file_path)
    context = Context(classes, properties)
    __modify_context(context, classes_property_usage_stats_filename, properties_domain_range_usage_stats_filename)
    __write_classes_to_file(context.class_map)
    __write_properties_to_file(context.property_map)
    
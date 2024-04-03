import pathlib
import sys 
import core.utils.decoding as decoding
import core.utils.logging as ul
from core.utils.timer import timed
from phases.modification.modifiers.properties.remove_unexisting_references_main import *
from phases.modification.modifiers.properties.remove_unexisting_references_general_constraints import *
from phases.modification.modifiers.properties.remove_unexisting_references_item_constraints import *
from phases.modification.modifiers.properties.remove_self_cycles import *
from phases.modification.modifiers.properties.mark_subproperties_to_parents import *
from phases.modification.modifiers.properties.assign_subject_object_values_to_classes import *
from phases.modification.modifiers.mergers.classes_property_usage_stats_merger import *
from phases.modification.modifiers.mergers.properties_domain_range_usage_stats_merger import *
from phases.modification.modifiers.context import Context
from phases.modification.modifiers.classes.all_classes_are_rooted import *
from phases.modification.modifiers.classes.remove_unexisting_references import *
from phases.modification.modifiers.classes.mark_children_to_parents import *
from phases.modification.modifiers.classes.mark_instances_to_parents import *
from phases.modification.modifiers.classes.remove_self_cycles import *
from phases.modification.modifiers.classes.add_fields import *
from phases.modification.modifiers.removers.remove_entities_with_no_label import *
from phases.modification.modifiers.removers.remove_classes_with_no_parent import *

main_logger = ul.root_logger.getChild("modification")
classes_logger = main_logger.getChild("classes")
properties_logger = main_logger.getChild("properties")

CLASSES_OUTPUT_FILE = 'classes-mod.json'
PROPERTIES_OUTPUT_FILE = 'properties-mod.json'

@timed(classes_logger)
def __load_classes_to_dict(json_file_path: pathlib.Path) -> dict:
    return decoding.load_entities_to_dict(json_file_path, classes_logger, ul.CLASSES_PROGRESS_STEP)

@timed(properties_logger)
def __load_properties_to_dict(json_file_path: pathlib.Path) -> dict:
    return decoding.load_entities_to_dict(json_file_path, properties_logger, ul.PROPERTIES_PROGRESS_STEP)
    
@timed(classes_logger)
def __write_classes_to_file(classes_dict: dict):
    decoding.write_mapped_entities_to_file(classes_dict, CLASSES_OUTPUT_FILE)

@timed(properties_logger)
def __write_properties_to_file(properties_dict: dict):
    decoding.write_mapped_entities_to_file(properties_dict, PROPERTIES_OUTPUT_FILE)

def __modify_entities(modifiers, entities_dict: dict, logger, logging_step):
    for idx, entity in enumerate(entities_dict.values()):
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
    __modify_entities(modifiers, context.classes_dict, logger, ul.CLASSES_PROGRESS_STEP)
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
    __modify_entities(modifiers, context.classes_dict, logger, ul.CLASSES_PROGRESS_STEP)
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
    __modify_entities(modifiers, context.properties_dict, properties_logger, ul.PROPERTIES_PROGRESS_STEP)
    __report_status_of_modifiers(modifiers)

@timed(classes_logger)
def __post_properties_mod_on_stats_references(context: Context):
    logger = classes_logger.getChild("post-properties_mod_on_stats_references")
    modifiers = [
        # As a final check on property usage statistics in case previous step removed properties
        RemoveUnexistingReferencesClasses(logger, context)
    ]
    __modify_entities(modifiers, context.classes_dict, logger, ul.CLASSES_PROGRESS_STEP)
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
    __merge_property_usage_stats(context, classes_property_usage_stats_filename, properties_domain_range_usage_stats_filename)
    __remove_entities_with_empty_labels(context)
    __pre_unrooted_classes_removal(context)
    __remove_unrooted_classes(context)
    __post_unrooted_classes_removal(context)
    __modify_properties(context)
    __post_properties_mod_on_stats_references(context)

@timed(main_logger)
def __modify(classes_json_file_path: pathlib.Path, properties_json_file_path: pathlib.Path, classes_property_usage_stats_filename: pathlib.Path, properties_domain_range_usage_stats_filename: pathlib.Path):
    classes = __load_classes_to_dict(classes_json_file_path)
    properties = __load_properties_to_dict(properties_json_file_path)
    context = Context(classes, properties)
    __modify_context(context, classes_property_usage_stats_filename, properties_domain_range_usage_stats_filename)
    __write_classes_to_file(context.classes_dict)
    __write_properties_to_file(context.properties_dict)
    
@timed(main_logger)
def main_modification(classes_json_file: pathlib.Path, properties_json_file: pathlib.Path, classes_property_stats_json_file: pathlib.Path, properties_stats_json_file: pathlib.Path):
    try:
        __modify(classes_json_file, properties_json_file, classes_property_stats_json_file, properties_stats_json_file)
    except Exception as e:
        main_logger.exception("There was an error that cannot be handled")
        main_logger.error("Exiting...")
        sys.exit(1)
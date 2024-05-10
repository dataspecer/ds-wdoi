from pathlib import Path
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
from phases.modification.modifiers.classes.root_all_classes import *
from phases.modification.modifiers.classes.remove_unexisting_references import *
from phases.modification.modifiers.classes.mark_children_to_parents import *
from phases.modification.modifiers.classes.mark_instances_to_parents import *
from phases.modification.modifiers.classes.remove_self_cycles import *
from phases.modification.modifiers.classes.add_fields import *
from phases.modification.modifiers.removers.remove_entities_with_no_label import *
from phases.modification.modifiers.removers.remove_classes_with_no_parent import *
from phases.modification.modifiers.removers.remove_classes_instances import *

main_logger = ul.root_logger.getChild("modification")
classes_logger = main_logger.getChild("classes")
properties_logger = main_logger.getChild("properties")

CLASSES_OUTPUT_FILE_PATH = Path(".") / 'classes-mod.json'
PROPERTIES_OUTPUT_FILE_PATH = Path(".") / 'properties-mod.json'

VERBOSE = False

@timed(classes_logger)
def __load_classes_to_dict(json_file_path: Path) -> dict:
    return decoding.load_entities_to_dict(json_file_path, classes_logger, ul.CLASSES_PROGRESS_STEP)

@timed(properties_logger)
def __load_properties_to_dict(json_file_path: Path) -> dict:
    return decoding.load_entities_to_dict(json_file_path, properties_logger, ul.PROPERTIES_PROGRESS_STEP)
    
@timed(classes_logger)
def __write_classes_to_file(classes_dict: dict):
    decoding.write_mapped_entities_to_file(classes_dict, CLASSES_OUTPUT_FILE_PATH)

@timed(properties_logger)
def __write_properties_to_file(properties_dict: dict):
    decoding.write_mapped_entities_to_file(properties_dict, PROPERTIES_OUTPUT_FILE_PATH)

def __modify_entities(modifiers, entities_dict: dict, logger, logging_step):
    for idx, entity in enumerate(entities_dict.values()):
        for modifier_func in modifiers:
            modifier_func(entity)
        ul.try_log_progress(logger, idx, logging_step)

def __report_status_of_modifiers(modifiers):
    for mod in modifiers:
        mod.report_status()

@timed(main_logger)
def __merge_property_usage_stats(context: Context, classes_property_usage_stats_filename: Path, properties_domain_range_usage_stats_filename: Path):
    cls_merger = ClassesPropertyUsageStatsMerger(classes_logger, context, classes_property_usage_stats_filename, VERBOSE)
    cls_merger.modify_all()
    cls_merger.report_status()
    
    props_merger = PropertiesDomainRangeUsageStatsMerger(properties_logger, context, properties_domain_range_usage_stats_filename, VERBOSE)
    props_merger.modify_all()
    props_merger.report_status()

@timed(main_logger)
def __remove_entities_with_empty_labels(context: Context):
    remover = RemoveEntitiesWithNoLabel(main_logger, context, VERBOSE)
    remover.modify_all()
    remover.report_status()

@timed(classes_logger)
def __modify_classes_general(context: Context):
    logger = classes_logger.getChild("modify_classes_general")
    modifiers = [
        AddFields(logger, context, VERBOSE), 
        RemoveUnexistingReferencesClasses(logger, context, VERBOSE), 
        RemoveSelfCyclesClass(logger, context, VERBOSE), 
        MarkChildrenToParents(logger, context, VERBOSE),
        MarkInstancesToParents(logger, context, VERBOSE),
        RootAllClasses(logger, context, VERBOSE)
    ]
    __modify_entities(modifiers, context.classes_dict, logger, ul.CLASSES_PROGRESS_STEP)
    __report_status_of_modifiers(modifiers)

@timed(properties_logger)
def __modify_properties_general(context: Context):
    modifiers = [
        RemoveUnexistingReferencesMainProperties(properties_logger, context, VERBOSE), 
        RemoveUnexistingReferencesGeneralConstraintsProperties(properties_logger, context, VERBOSE),
        RemoveUnexistingReferencesItemConstraintsProperties(properties_logger, context, VERBOSE),
        RemoveSelfCyclesProperty(properties_logger, context, VERBOSE),
        AssignSubjectValueConstsToClasses(properties_logger, context, VERBOSE),
        MarkSubpropertiesToParents(properties_logger, context, VERBOSE)
    ]
    __modify_entities(modifiers, context.properties_dict, properties_logger, ul.PROPERTIES_PROGRESS_STEP)
    __report_status_of_modifiers(modifiers)

@timed(classes_logger)
def __remove_selected_class_instances(context: Context):
    logger = classes_logger.getChild("remove-instances") 
    
    # type of chemical entity, gene, protein, a group of stereoisomers
    classes_ids = [113145171, 7187, 8054, 59199015]
    
    logger.info("Removing instances")
    class_instance_remover = RemoveClassInstances(classes_ids, logger, context, VERBOSE)
    class_instance_remover.modify_all()
    class_instance_remover.report_status()
    
    # Update references of the existing classes.
    logger.info("Starting to update references")
    remove_refs = [
        RemoveUnexistingReferencesClasses(logger, context, VERBOSE),
    ]
    __modify_entities(remove_refs, context.classes_dict, logger, ul.CLASSES_PROGRESS_STEP)
    __report_status_of_modifiers(remove_refs)
    
    # Remove all classes that got detached from the tree after the instance removal.
    logger.info("Removing classes with no parent")
    no_parent_class_remover = RemoveClassesWithNoParent(logger, context, VERBOSE)
    no_parent_class_remover.modify_all()
    no_parent_class_remover.report_status()
    
    # Sanity check that everything is rooted
    logger.info("Removing references and sanity check that everything is rooted")
    root_all_classes = [
        RemoveUnexistingReferencesClasses(logger, context, VERBOSE),
        RootAllClasses(logger, context, VERBOSE),
    ]
    __modify_entities(root_all_classes, context.classes_dict, logger, ul.CLASSES_PROGRESS_STEP)
    __report_status_of_modifiers(root_all_classes)

@timed(main_logger)
def __modify_context(context: Context, classes_property_usage_stats_filename: Path, properties_domain_range_usage_stats_filename: Path):
    __merge_property_usage_stats(context, classes_property_usage_stats_filename, properties_domain_range_usage_stats_filename)
    __remove_entities_with_empty_labels(context)
    __modify_classes_general(context)
    __remove_selected_class_instances(context)
    __modify_properties_general(context)

@timed(main_logger)
def __modify(classes_json_file_path: Path, properties_json_file_path: Path, classes_property_usage_stats_filename: Path, properties_domain_range_usage_stats_filename: Path):
    classes = __load_classes_to_dict(classes_json_file_path)
    properties = __load_properties_to_dict(properties_json_file_path)
    context = Context(classes, properties)
    __modify_context(context, classes_property_usage_stats_filename, properties_domain_range_usage_stats_filename)
    __write_classes_to_file(context.classes_dict)
    __write_properties_to_file(context.properties_dict)
    
@timed(main_logger)
def main_modification(classes_json_file: Path, properties_json_file: Path, classes_property_stats_json_file: Path, properties_stats_json_file: Path):
    try:
        __modify(classes_json_file, properties_json_file, classes_property_stats_json_file, properties_stats_json_file)
        return True
    except Exception as e:
        main_logger.exception("There was an error that cannot be handled")
        main_logger.critical("Exiting phase...")
        return False
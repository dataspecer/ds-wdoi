from collections import deque
from phases.experimental_search_engine_data_preperation.main_logger import main_logger
from core.utils.timer import timed
from phases.experimental_search_engine_data_preperation.data_entities.data_class import DataClassFields
from phases.experimental_search_engine_data_preperation.data_entities.data_property import DataPropertyFields
import core.utils.logging as ul
import core.utils.decoding as decoding
from core.output_directory import OUTPUT_DIR_PATH

logger = main_logger.getChild("reduce_property_usage")

CLASSE_OUTPUT_FILE_PATH = OUTPUT_DIR_PATH / "classes-experimental-prep-1-reduction.json" 
PROPERTIES_OUTPUT_FILE_PATH = OUTPUT_DIR_PATH / "properties-experimental-prep-1-reduction.json" 

def __ancestors_of(wd_data_class, classes_dict: dict):
        visited_ids = set()
        queue = deque()
        
        # Init tranversal
        visited_ids.add(wd_data_class[DataClassFields.ID.value])
        queue.append(wd_data_class[DataClassFields.SUBCLASS_OF.value])
        
        while (len(queue) != 0):
            next_ids = queue.popleft()
            for next_class_id in next_ids:
                if next_class_id not in visited_ids:
                    visited_ids.add(next_class_id)
                    next_cls = classes_dict[next_class_id]
                    queue.append(next_cls[DataClassFields.SUBCLASS_OF.value])
                    yield next_cls

# Reduction

@timed(logger)
def __reduce_property_usage_on_classes(classes_dict):
    for i, [wd_data_class_id, wd_data_class] in enumerate(classes_dict.items()):
        class_properties = wd_data_class[DataClassFields.OWN_PROPERTIES.value]
        for ancestor in __ancestors_of(wd_data_class, classes_dict):
            if wd_data_class_id != ancestor[DataClassFields.ID.value]:
                class_properties = class_properties - ancestor[DataClassFields.OWN_PROPERTIES.value]
        # Still as a set to by used by other classes.
        wd_data_class[DataClassFields.OWN_PROPERTIES.value] = class_properties
        ul.try_log_progress(logger, i, ul.CLASSES_PROGRESS_STEP)
    
    # Reassign properties as list.
    for wd_data_class_id, wd_data_class in classes_dict.items():
        wd_data_class[DataClassFields.OWN_PROPERTIES.value] = list(wd_data_class[DataClassFields.OWN_PROPERTIES.value])

# Assign ancestors.    
    
@timed(logger)
def __assign_ancestors_to_classes(classes_dict):
    for i, [wd_data_class_id, wd_data_class] in enumerate(classes_dict.items()):
        property_count = len(wd_data_class[DataClassFields.OWN_PROPERTIES.value])
        ancestors_defining_property = set([wd_data_class_id] if property_count != 0 else [])
        for ancestor in __ancestors_of(wd_data_class, classes_dict):
            if len(ancestor[DataClassFields.OWN_PROPERTIES.value]) != 0:
                ancestors_defining_property.add(ancestor[DataClassFields.ID.value])
        wd_data_class[DataClassFields.ANCESTORS_DEFINING_PROPERTIES.value] = list(ancestors_defining_property)
        ul.try_log_progress(logger, i, ul.CLASSES_PROGRESS_STEP)

# Assign classes to properties.

@timed(logger)
def __assign_classes_to_properties(classes_dict, properties_dict):
    for i, [wd_data_class_id, wd_data_class] in enumerate(classes_dict.items()):
        for wd_data_property_id in wd_data_class[DataClassFields.OWN_PROPERTIES.value]:
            wd_data_property = properties_dict[wd_data_property_id]
            if wd_data_class_id not in wd_data_property[DataPropertyFields.CLASSES_DEFINING_USAGE.value]:
                wd_data_property[DataPropertyFields.CLASSES_DEFINING_USAGE.value].append(wd_data_class_id)
        ul.try_log_progress(logger, i, ul.CLASSES_PROGRESS_STEP)

# Remove properties with no usage.

def __mark_properties_with_no_usage(properties_dict):
    properties_to_remove = set()
    for wd_data_property_id, wd_data_property in properties_dict.items():
        if len(wd_data_property[DataPropertyFields.CLASSES_DEFINING_USAGE]) == 0:
            properties_to_remove.add(wd_data_property_id)
    return properties_to_remove

def __remove_properties_from_dict(properties_dict, properties_to_remove):
    for wd_data_property_id in properties_to_remove:
        del properties_dict[wd_data_property_id]
        logger.info(f"Removing property {wd_data_property_id} with no usage")

@timed(logger)
def __remove_properties_with_no_usage(properties_dict):
    properties_to_remove = __mark_properties_with_no_usage(properties_dict)
    __remove_properties_from_dict(properties_dict, properties_to_remove)

@timed(logger)
def __write_dicts_to_files(classes_dict, properties_dict):
    decoding.write_entities_dict_to_file(classes_dict, CLASSE_OUTPUT_FILE_PATH)
    decoding.write_entities_dict_to_file(properties_dict, PROPERTIES_OUTPUT_FILE_PATH)

@timed(logger)
def reduce_property_usage(classes_dict: dict, properties_dict: dict):
    __reduce_property_usage_on_classes(classes_dict)
    __assign_ancestors_to_classes(classes_dict)
    __assign_classes_to_properties(classes_dict, properties_dict)
    __remove_properties_with_no_usage(properties_dict)
    __write_dicts_to_files(classes_dict, properties_dict)
    
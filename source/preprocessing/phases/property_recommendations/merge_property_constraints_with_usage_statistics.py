import core.utils.logging as ul
from core.model_simplified.classes import ClassFields
from core.model_simplified.constraints import GenConstFields, ItemConstFields, TypeConstFields
from core.model_simplified.properties import PropertyFields
from core.model_simplified.scores import ScoresFields
from core.model_wikidata.properties import UnderlyingTypes
from phases.property_recommendations.main_logger import main_logger

logger = main_logger.getChild("merging")

def merge_property_subject_object_type_constraints_into_usage_statistics(classes_dict: dict, properties_dict: dict):
    for i, [property_id, property] in enumerate(properties_dict.items()):
        subject_types = __get_subject_classes_by_constraint(property)
        value_types = __get_value_classes_by_constraint(property)
        if property[PropertyFields.UNDERLYING_TYPE.value] == UnderlyingTypes.ENTITY:
            logger.info(f"Merging item property {property_id}")
            __merge_item_property(property_id, property, classes_dict, subject_types, value_types)
        else:
            logger.info(f"Merging literal property {property_id}")
            __merge_literal_property(property_id, property, classes_dict, subject_types)
        ul.try_log_progress(logger, i, ul.PROPERTIES_PROGRESS_STEP)
          
def __get_subject_classes_by_constraint(property):
    subjectTypeConstraints = property[PropertyFields.CONSTRAINTS.value][GenConstFields.SUBJECT_TYPE.value]
    return subjectTypeConstraints[TypeConstFields.INSTANCE_OF.value] + subjectTypeConstraints[TypeConstFields.INSTANCE_OF_SUBCLASS_OF.value] 

def __get_value_classes_by_constraint(property):
    if property[PropertyFields.UNDERLYING_TYPE.value] == UnderlyingTypes.ENTITY:
        valueTypeConstraints = property[PropertyFields.CONSTRAINTS.value][GenConstFields.TYPE_DEPENDENT.value][ItemConstFields.VALUE_TYPE.value]
        return valueTypeConstraints[TypeConstFields.INSTANCE_OF.value] + valueTypeConstraints[TypeConstFields.INSTANCE_OF_SUBCLASS_OF.value] 
    return []

def __add_to_subject_types_stats_of_property_if_missing(property, new_subject_types):
    property_subject_types_stats = property[PropertyFields.CONSTRAINTS.value][GenConstFields.SUBJECT_TYPE_STATS]
    __add_to_types_if_missing(property_subject_types_stats, new_subject_types)

def __add_to_value_types_stats_of_property_if_missing(property, new_value_types):
    property_value_types_stats = property[PropertyFields.CONSTRAINTS.value][GenConstFields.TYPE_DEPENDENT.value][ItemConstFields.VALUE_TYPE_STATS.value]
    __add_to_types_if_missing(property_value_types_stats, new_value_types)

def __add_to_types_if_missing(types, new_types):
    for new_type in new_types:
        if new_type not in types:
            types.append(new_type)

def __add_properties_to_classes_stats_if_missing(property_id, classes_dict: dict, prop_ids_field, prop_scores_field, types):    
    for cls_id in types:
        cls = classes_dict[cls_id]
        if property_id not in cls[prop_ids_field]:
            logger.info(f"Adding property {property_id} to class {cls_id} as {prop_ids_field}")
            cls[prop_ids_field].append(property_id)
            cls[prop_scores_field].append(__create_new_property_score_record(property_id))
            
def __create_new_property_score_record(property_id):
    return {
        ScoresFields.PROPERTY.value: property_id,
        ScoresFields.SCORE.value: float(0),
        ScoresFields.RANGE.value: [],
        ScoresFields.RANGE_SCORES.value: []
    }  
         
def __merge_literal_property(property_id, property, classes_dict: dict, subject_types):
    __add_to_subject_types_stats_of_property_if_missing(property, subject_types)
    __add_properties_to_classes_stats_if_missing(property_id, classes_dict, ClassFields.SUBJECT_OF_STATS.value, ClassFields.SUBJECT_OF_STATS_SCORES.value, subject_types)
            
def __merge_item_property(property_id, property, classes_dict: dict, subject_types_consts, value_types_consts):
    subject_types_stats = property[PropertyFields.CONSTRAINTS.value][GenConstFields.SUBJECT_TYPE_STATS.value]
    value_types_stats = property[PropertyFields.CONSTRAINTS.value][GenConstFields.TYPE_DEPENDENT.value][ItemConstFields.VALUE_TYPE_STATS.value]
    
    # Assign domains if the the property points somewhere.
    if len(value_types_stats) != 0 or len(value_types_consts) != 0:
        logger.info(f"Merging subject type constraints of property {property_id}")
        __add_to_subject_types_stats_of_property_if_missing(property, subject_types_consts)
        __add_properties_to_classes_stats_if_missing(property_id, classes_dict, ClassFields.SUBJECT_OF_STATS.value, ClassFields.SUBJECT_OF_STATS_SCORES.value, subject_types_consts)
    else:
        logger.info(f"Cannot merge subject type constraints of property {property_id}")
    
    # Assign ranges if the the property points somewhere in reverse.
    if len(subject_types_stats) != 0 or len(subject_types_consts) != 0:
        logger.info(f"Merging value type constraints of property {property_id}")
        __add_to_value_types_stats_of_property_if_missing(property, value_types_consts)
        __add_properties_to_classes_stats_if_missing(property_id, classes_dict, ClassFields.VALUE_OF_STATS.value, ClassFields.VALUE_OF_STATS_SCORES.value, value_types_consts)
    else:
        logger.info(f"Cannot merge value type constraints of property {property_id}")
 

            
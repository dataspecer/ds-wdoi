import logging
import core.utils.logging as ul
from core.model_simplified.classes import ClassFields
from core.model_simplified.constraints import GenConstFields, ItemConstFields, TypeConstFields
from core.model_simplified.properties import PropertyFields
from core.model_simplified.scores import ScoresFields
from core.model_wikidata.properties import UnderlyingTypes

logger = logging.getLogger("recommendations").getChild("p5_property_recommendations").getChild("merging")

def merge_property_subject_object_type_constraints_with_usage_statistics(classes_dict: dict, properties_dict: dict):
    i = 0
    for property_id, property in properties_dict.items():
        subject_types = __get_subject_classes_by_constraint(property)
        value_types = __get_value_classes_by_constraint(property)
        if property[PropertyFields.UNDERLYING_TYPE.value] == UnderlyingTypes.ENTITY:
            __merge_item_property(property_id, property, classes_dict, subject_types, value_types)
        else:
            __merge_literal_property(property_id, property, classes_dict, subject_types)
        i += 1
        ul.try_log_progress(logger, i, ul.PROPERTIES_PROGRESS_STEP)
          
def __get_subject_classes_by_constraint(property):
    subjectTypeConstraints = property[PropertyFields.CONSTRAINTS.value][GenConstFields.SUBJECT_TYPE.value]
    return subjectTypeConstraints[TypeConstFields.INSTANCE_OF.value] + subjectTypeConstraints[TypeConstFields.INSTANCE_OF_SUBCLASS_OF.value] 

def __get_value_classes_by_constraint(property):
    if property[PropertyFields.UNDERLYING_TYPE.value] == UnderlyingTypes.ENTITY:
        valueTypeConstraints = property[PropertyFields.CONSTRAINTS.value][GenConstFields.TYPE_DEPENDENT.value][ItemConstFields.VALUE_TYPE.value]
        return valueTypeConstraints[TypeConstFields.INSTANCE_OF.value] + valueTypeConstraints[TypeConstFields.INSTANCE_OF_SUBCLASS_OF.value] 
    return []

# Literal

def __merge_literal_property(property_id, property, classes_dict: dict, subject_types):
    __merge_if_missing(property_id, property, classes_dict, ClassFields.SUBJECT_OF_STATS.value, ClassFields.SUBJECT_OF_STATS_SCORES.value, subject_types)
    
def __merge_if_missing(property_id, property, classes_dict: dict, prop_ids_field, prop_scores_field, subject_types, value_types = []):    
    for cls_id in subject_types:
        cls = classes_dict[cls_id]
        if property_id not in cls[prop_ids_field]:
            cls[prop_ids_field].append(property_id)
            cls[prop_scores_field].append(__create_new_property_score_record(property_id, value_types))
            
            
def __create_new_property_score_record(property_id, value_types = []):
    rng = []
    rng_scores = []
    if value_types != 0:
        for cls_id in value_types:
            rng.append(cls_id)
            rng_scores.append(__create_new_range_score_record(cls_id))
    return {
        ScoresFields.PROPERTY.value: property_id,
        ScoresFields.SCORE.value: float(0),
        ScoresFields.RANGE.value: rng,
        ScoresFields.RANGE_SCORES.value: rng_scores
    }           
            
def __create_new_range_score_record(cls_id):
    return {
        ScoresFields.CLASS.value: cls_id,
        ScoresFields.SCORE.value: float(0)
    }         
            
# Item

def __merge_item_property(property_id, property, classes_dict: dict, subject_types, value_types):
    if len(subject_types) != 0 and len(value_types) != 0:
        # Add missing property to the subject types with entire range of value types
        __merge_if_missing(property_id, property, classes_dict, ClassFields.SUBJECT_OF_STATS.value, ClassFields.SUBJECT_OF_STATS_SCORES.value, subject_types, value_types)
        # Add missing property to the value types with entire range of subject types
        __merge_if_missing(property_id, property, classes_dict, ClassFields.VALUE_OF_STATS.value, ClassFields.VALUE_OF_STATS_SCORES.value, value_types, subject_types)
    
        # Add missing range value types to the classes in subject types
        __merge_if_exists(property_id, property, classes_dict, ClassFields.SUBJECT_OF_STATS_SCORES.value, subject_types, value_types)
        # Add missing range subject types to the classes in value types
        __merge_if_exists(property_id, property, classes_dict, ClassFields.VALUE_OF_STATS_SCORES.value, value_types, subject_types)

    # Be careful
    # This would again assign a lot of properties to classes, and thus they would have enourmous range (in thousands).
    
    # subject_types_stats = property[PropertyFields.CONSTRAINTS.value][GenConstFields.SUBJECT_TYPE_STATS.value]
    # value_types_stats = property[PropertyFields.CONSTRAINTS.value][GenConstFields.TYPE_DEPENDENT.value][ItemConstFields.VALUE_TYPE_STATS.value]
    #
    # __merge_if_exists(property_id, property, classes_dict, ClassFields.SUBJECT_OF_STATS_SCORES.value, subject_types_stats, value_types)
    # __merge_if_exists(property_id, property, classes_dict, ClassFields.SUBJECT_OF_STATS_SCORES.value, value_types, subject_types_stats)
    # 
    # __merge_if_exists(property_id, property, classes_dict, ClassFields.VALUE_OF_STATS_SCORES.value, value_types_stats, subject_types)
    # __merge_if_exists(property_id, property, classes_dict, ClassFields.VALUE_OF_STATS_SCORES.value, subject_types, value_types_stats)
    
def __merge_if_exists(property_id, property, classes_dict, prop_scores_field, domain_classes, range_classes):
    for cls_id in domain_classes:
        cls = classes_dict[cls_id]
        for property_score_record in cls[prop_scores_field]:
            if property_score_record[ScoresFields.PROPERTY.value] == property_id:
                for range_cls_id in range_classes:
                    if range_cls_id not in property_score_record[ScoresFields.RANGE.value]:
                        property_score_record[ScoresFields.RANGE.value].append(range_cls_id)
                        property_score_record[ScoresFields.RANGE_SCORES.value].append(__create_new_range_score_record(range_cls_id))
                break
            
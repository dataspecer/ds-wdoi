
import wikidata.json_extractors.wd_statements as wd_json_stmts_ex
from wikidata.model.constraints import *
from wikidata.model.properties import Properties
from wikidata.model.entity_json_fields import RootFields
from typing import Literal

def __contains_novalue(collection):
    if wd_json_stmts_ex.NO_VALUE in collection:
        return True
    else:
        return False

def __is_statement_value_empty(value):
    if __contains_novalue(value) or len(value) == 0:
        return True
    else:
        return False
    
def __get_unique_values(collection):
    return list(set(collection))

def __make_map_values_unique(map):
    new_map = {}
    for key, values in map.items():
        new_map[key] = __get_unique_values(values)
    return new_map

def __map_to_default_on_error(external_map_func, default):
    def map_func(value):
        try:
            return external_map_func(value)
        except:
            return default  
    return map_func

def __is_valid_novalue_usage(values) -> bool:
    if __contains_novalue(values) and len(values) != 1:
        return False
    else:
        return True 
    
def __get_filter_selected_constraint(constraint):
    def filter_func(statement):
        stmt_value = wd_json_stmts_ex._stmt_value_extractor(wd_json_stmts_ex._entityids_value_extractor, statement)
        if stmt_value == constraint:
            return True
        else:
            return False
    return filter_func

def __extract_wd_constraint_statements(wd_entity_json, constraint):
    constraint_stmts = wd_json_stmts_ex._extract_wd_statements_from_field(wd_entity_json, RootFields.CLAIMS, Properties.PROPERTY_CONSTRAINT)
    return list(filter(__get_filter_selected_constraint(constraint), constraint_stmts))


def __extract_constraint_values_with_one_qualifier(wd_entity_json, constraint, qualifier_property: Properties, value_mapping_func = None, include_no_value: bool = False):
    constraint_stmts = __extract_wd_constraint_statements(wd_entity_json, constraint)
    constraint_qualifier_values = []
    for stmt in constraint_stmts:
        values = wd_json_stmts_ex.extract_wd_statement_values(stmt, qualifier_property, field="qualifiers", is_qualifier=True, include_no_value=include_no_value)
        constraint_qualifier_values += values
    constraint_qualifier_values = __get_unique_values(constraint_qualifier_values)
    if value_mapping_func != None:
        return list(map(value_mapping_func, constraint_qualifier_values))
    return constraint_qualifier_values


def __create_allowance_statement_value_tuples(allowance_key_property_values, allowance_value_property_values):
    if __is_statement_value_empty(allowance_key_property_values):
        return None, None
    elif __is_statement_value_empty(allowance_value_property_values):
        return allowance_key_property_values[0], [wd_json_stmts_ex.NO_VALUE]
    else:
        return allowance_key_property_values[0], allowance_value_property_values
        
def __add_to_statement_allowance_map(map, key, values):
    if key == None:
        return
    if key in map:
        if __contains_novalue(values) or __contains_novalue(map[key]):
            map[key] = [wd_json_stmts_ex.NO_VALUE]
        else:
            map[key] += values
    else:
        map[key] = values
        
def __process_allowance_values(map, allowance_key_property_values, allowance_value_property_values):
    key, values = __create_allowance_statement_value_tuples(allowance_key_property_values, allowance_value_property_values)
    __add_to_statement_allowance_map(map, key, values)
        
        
def __add_to_statement_relation_map(constraint_statement_relation_map, relations, classes):
    if len(classes) == 0 or len(relations) == 0:
        return
    rel = relations[0]
    if rel == SubjectValueRelationsValues.SUBCLASS_OF:
        constraint_statement_relation_map["subclassOf"] += classes
    elif rel == SubjectValueRelationsValues.SUBCLASS_OF_INSTANCE_OF:
        constraint_statement_relation_map["subclassOfInstanceOf"] += classes
    else:
        constraint_statement_relation_map["instanceOf"] += classes

def __extract_constraint_values_for_statement_pairs_map(wd_entity_json, constraint, key_property: Properties, value_property: Properties, init_map: dict, process_func, values_include_novalue: bool):
    constraint_stmts = __extract_wd_constraint_statements(wd_entity_json, constraint)
    constraint_statement_value_map = init_map
    for stmt in constraint_stmts:
        keys = wd_json_stmts_ex.extract_wd_statement_values(stmt, key_property, field="qualifiers", is_qualifier=True, include_no_value=False)
        values = wd_json_stmts_ex.extract_wd_statement_values(stmt, value_property, field="qualifiers", is_qualifier=True, include_no_value=values_include_novalue)
        process_func(constraint_statement_value_map, keys, values)
    return __make_map_values_unique(constraint_statement_value_map)


def __constraint_exists(wd_entity_json, constraint):
    return len(__extract_wd_constraint_statements(wd_entity_json, constraint)) != 0

# API


"""
    The property scope contains a list of Enum values.
    Each representing a valid property placement usage.
    Mostly we care about properties that can be used as a main value.
    If there is invalid value, it maps it to as main by default.
"""
def extract_wd_property_scope_values(wd_entity_json):
    map_func_with_default = __map_to_default_on_error(PropertyScopeValues.index_of, PropertyScopeValues.AS_MAIN)
    return __extract_constraint_values_with_one_qualifier(wd_entity_json, GeneralConstraints.PROPERTY_SCOPE, Properties.PROPERTY_SCOPE, map_func_with_default)

"""
    The entity types list contains a list of Enum values.
    Each representing a valid entity usage for the property.
    Mostly we care about items.
    If there is invalid value, it maps it to item by default.
"""
def extract_wd_allowed_entity_types_values(wd_entity_json):
    map_func_with_default = __map_to_default_on_error(AllowedEntityTypesValues.index_of, AllowedEntityTypesValues.ITEM)
    return __extract_constraint_values_with_one_qualifier(wd_entity_json, GeneralConstraints.ALLOWED_ENTITY_TYPES, Properties.ITEM_OF_PROPERTY_CONSTRAINT, map_func_with_default)

"""
    The allowed qualifiers for a property can contain novalue, with the meaning as a negation -> no qualifier can be used.
"""
def extract_wd_allowed_qualifiers_values(wd_entity_json):
    values = __extract_constraint_values_with_one_qualifier(wd_entity_json, GeneralConstraints.ALLOWED_QUALIFIERS, Properties.PROPERTY, include_no_value=True)
    if not __is_valid_novalue_usage(values):
        return [wd_json_stmts_ex.NO_VALUE]
    else:
        return values
    
def extract_wd_required_qualifiers_values(wd_entity_json):
    return __extract_constraint_values_with_one_qualifier(wd_entity_json, GeneralConstraints.REQUIRED_QUALIFIERS, Properties.PROPERTY)
    
    
"""
    The functions extracts a map of (property_id: [ids]*)
    For each listed property withing Properties.Property, the constraint can define allowed/disallowed values.
    There can be novalue inside [ids] in that case it is the only value present, with the meaning the property can be used with anything/nothing.
"""
def extract_wd_allowance_statement_values(wd_entity_json, constraint: Literal[GeneralConstraints.CONFLICTS_WITH, GeneralConstraints.ITEM_REQUIRES_STATEMENT, ItemDatatypeConstraints.VALUE_REQUIRES_STATEMENT]):
    init_map = {}
    return __extract_constraint_values_for_statement_pairs_map(wd_entity_json, constraint, Properties.PROPERTY, Properties.ITEM_OF_PROPERTY_CONSTRAINT, init_map, __process_allowance_values, True)

"""
    The function extracts and assignes ids to allowed buckets for the subject and value constraints.
    The values are always unique in the appropriate lists.
    There can be no novalue for this constraint.
"""    
def extract_wd_subject_value_class_values(wd_entity_json, constraint: Literal[GeneralConstraints.SUBJECT_TYPE, ItemDatatypeConstraints.VALUE_TYPE]):
    init_map = {
        "subclassOf": [],
        "instanceOf": [],
        "subclassOfInstanceOf": []
    }
    return __extract_constraint_values_for_statement_pairs_map(wd_entity_json, constraint, Properties.RELATION, Properties.CLASS, init_map, __add_to_statement_relation_map, False)

def constraint_exists(wd_entity_json, constraint):
    return __constraint_exists(wd_entity_json, constraint)
    
"""
    Codelists contain allowed or disallowed values of properties.
    The codelist contain any items from the Wikidata.
    This means it does not have to be in the ontology.
    There can be no novalue for this constraint. 
"""
def extract_codelists(wd_entity_json, constraint: Literal[ItemDatatypeConstraints.NONE_OF, ItemDatatypeConstraints.ONE_OF]):
    return __extract_constraint_values_with_one_qualifier(wd_entity_json, constraint, Properties.ITEM_OF_PROPERTY_CONSTRAINT, include_no_value=False)
    
"""
    The inverse constraint can contain only one property.
    In case it contained multiple values, choose only the first one.
    There can be no novalue for this constraint.
"""
def extract_inverse(wd_entity_json):
    inverse = __extract_constraint_values_with_one_qualifier(wd_entity_json, ItemDatatypeConstraints.INVERSE, Properties.PROPERTY, include_no_value=False)
    if len(inverse) != 0:
        return inverse[0]
    else:
        return None
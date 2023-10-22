
import wikidata.json_extractors.wd_statements as wd_statements_ex
import wikidata.model.constraints as constraints
from wikidata.model.properties import Properties
from wikidata.model.entity_json_fields import RootFields
import wikidata.transformations.wd_fields as wd_fields_trans

def __filter_non_depracated_rank(statement):
    if "deprecated" == statement['rank']:
        return False
    else:
        return True

def __contains_novalue(collection):
    if wd_statements_ex.NO_VALUE in collection:
        return True
    else:
        return False

def __is_statement_value_empty(value):
    if __contains_novalue(value) or len(value) == 0:
        return True
    else:
        return False
    
def __get_unique_values(arr):
    return list(set(arr))

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
        stmt_value = wd_statements_ex._statement_value_extractor(wd_statements_ex._entityids_value_extractor, statement)
        if stmt_value == constraint:
            return True
        else:
            return False
    return filter_func

def __extract_wd_constraint_statements(wd_entity_json, constraint):
    constraint_stmts = wd_statements_ex._extract_wd_statements_from_field(wd_entity_json, RootFields.CLAIMS, Properties.PROPERTY_CONSTRAINT)
    non_deprecated_constraint_stmts = filter(__filter_non_depracated_rank, constraint_stmts)
    return list(filter(__get_filter_selected_constraint(constraint), non_deprecated_constraint_stmts))


def __extract_constraint_values_with_one_qualifier(wd_entity_json, constraint, qualifier_property, typed_extractor, value_mapping_func = None, include_no_value: bool = False):
    constraint_stmts = __extract_wd_constraint_statements(wd_entity_json, constraint)
    constraint_qualifier_values = []
    for stmt in constraint_stmts:
        values = wd_statements_ex._extract_wd_statement_values_for_property(stmt, "qualifiers", qualifier_property, typed_extractor, is_qualifier=True, include_no_value=include_no_value)
        constraint_qualifier_values += values
    constraint_qualifier_values = __get_unique_values(constraint_qualifier_values)
    if value_mapping_func != None:
        return list(map(value_mapping_func, constraint_qualifier_values))
    return constraint_qualifier_values


def __create_allowed_statement_value_tuples(allowance_property, allowance_values):
    if __is_statement_value_empty(allowance_property):
        return None, None
    elif __is_statement_value_empty(allowance_values):
        return allowance_property[0], [wd_statements_ex.NO_VALUE]
    else:
        return allowance_property[0], allowance_values
        
def __add_to_statement_allowance_map(map, prop, values):
    if prop == None:
        return
    
    if prop in map:
        if __contains_novalue(values) or __contains_novalue(map[prop]):
            map[prop] = [wd_statements_ex.NO_VALUE]
        else:
            map[prop] += values
    else:
        map[prop] = values
        
def __extract_constraint_values_for_statement_allowance(wd_entity_json, constraint):
    constraint_stmts = __extract_wd_constraint_statements(wd_entity_json, constraint)
    constraint_statement_value_map = {}
    for stmt in constraint_stmts:
        allowance_property = wd_statements_ex._extract_wd_statement_values_for_property(stmt, "qualifiers", Properties.PROPERTY, wd_statements_ex._entityids_value_extractor, is_qualifier=True, include_no_value=False)
        allowance_values = wd_statements_ex._extract_wd_statement_values_for_property(stmt, "qualifiers", Properties.ITEM_OF_PROPERTY_CONSTRAINT, wd_statements_ex._entityids_value_extractor, is_qualifier=True, include_no_value=True)
        prop, values = __create_allowed_statement_value_tuples(allowance_property, allowance_values)
        __add_to_statement_allowance_map(constraint_statement_value_map, prop, values)
    return __make_map_values_unique(constraint_statement_value_map)

def __add_to_statement_relation_map(constraint_statement_relation_map, relations, classes):
    if len(classes) == 0 or len(relations) == 0:
        return
    rel = relations[0]
    if rel == constraints.SubjectValueRelationsValues.SUBCLASS_OF:
        constraint_statement_relation_map["subclassOf"] += classes
    elif rel == constraints.SubjectValueRelationsValues.SUBCLASS_OF_INSTANCE_OF:
        constraint_statement_relation_map["subclassOfInstanceOf"] += classes
    else:
        constraint_statement_relation_map["instanceOf"] += classes
    
def __extract_constraint_values_for_subject_value_constrainsts(wd_entity_json, constraint):
    constraint_stmts = __extract_wd_constraint_statements(wd_entity_json, constraint)
    constraint_statement_relation_map = {
        "subclassOf": [],
        "instanceOf": [],
        "subclassOfInstanceOf": []
    }
    for stmt in constraint_stmts:
        relation = wd_statements_ex._extract_wd_statement_values_for_property(stmt, "qualifiers", Properties.RELATION, wd_statements_ex._entityids_value_extractor, is_qualifier=True, include_no_value=False)
        classes = wd_statements_ex._extract_wd_statement_values_for_property(stmt, "qualifiers", Properties.CLASS, wd_statements_ex._entityids_value_extractor, is_qualifier=True, include_no_value=False)
        __add_to_statement_relation_map(constraint_statement_relation_map, relation, classes)
    return __make_map_values_unique(constraint_statement_relation_map)

def extract_wd_property_scope_values(wd_entity_json):
    map_func_with_default = __map_to_default_on_error(constraints.PropertyScopeValues.index_of, constraints.PropertyScopeValues.AS_MAIN)
    return __extract_constraint_values_with_one_qualifier(wd_entity_json, constraints.GeneralConstraints.PROPERTY_SCOPE, Properties.PROPERTY_SCOPE, wd_statements_ex._entityids_value_extractor, map_func_with_default)

def extract_wd_allowed_entity_types_values(wd_entity_json):
    map_func_with_default = __map_to_default_on_error(constraints.AllowedEntityTypesValues.index_of, constraints.AllowedEntityTypesValues.ITEM)
    return __extract_constraint_values_with_one_qualifier(wd_entity_json, constraints.GeneralConstraints.ALLOWED_ENTITY_TYPES, Properties.ITEM_OF_PROPERTY_CONSTRAINT, wd_statements_ex._entityids_value_extractor, map_func_with_default)

def extract_wd_allowed_qualifiers_values(wd_entity_json):
    values = __extract_constraint_values_with_one_qualifier(wd_entity_json, constraints.GeneralConstraints.ALLOWED_QUALIFIERS, Properties.PROPERTY, wd_statements_ex._entityids_value_extractor, include_no_value=True)
    if not __is_valid_novalue_usage(values):
        return [wd_statements_ex.NO_VALUE]
    else:
        return values
    
def extract_wd_required_qualifiers_values(wd_entity_json):
    return __extract_constraint_values_with_one_qualifier(wd_entity_json, constraints.GeneralConstraints.REQUIRED_QUALIFIERS, Properties.PROPERTY, wd_statements_ex._entityids_value_extractor)
    
def extract_wd_conflicts_with_values(wd_entity_json):
    return __extract_constraint_values_for_statement_allowance(wd_entity_json, constraints.GeneralConstraints.CONFLICTS_WITH)
    
def extract_wd_item_requires_statement_values(wd_entity_json):
    return __extract_constraint_values_for_statement_allowance(wd_entity_json, constraints.GeneralConstraints.ITEM_REQUIRES_STATEMENT)
    
def extract_wd_subject_value_class_values(wd_entity_json):
    return __extract_constraint_values_for_subject_value_constrainsts(wd_entity_json, constraints.GeneralConstraints.SUBJECT_TYPE)


import wikidata.json_extractors.wd_fields as wd_fields_ex
import wikidata.json_extractors.wd_statements as wd_statements_ex
import wikidata.transformations.wd_fields as wd_fields_tran
import wikidata.transformations.wd_languages as wd_languages_tran 
import wikidata.json_extractors.wd_constraints as wd_constraints_ex
from wikidata.model.properties import Datatypes as wd_property_datatypes

def __num_ids(str_ids_arr):
    return wd_fields_tran.transform_wd_str_ids_to_num_ids(str_ids_arr)

def __num_id(str_id):
    return wd_fields_tran.transform_wd_str_id_to_num_id(str_id)

def __make_map_values_num_ids(map):
    new_map = {}
    for key, values in map.items():
        new_map[key] = __num_ids(values)
    return new_map

def __get_num_ids_map(map):
    new_map = {}
    for str_prop, str_values in map.items():
        new_map[str(__num_id(str_prop))] = __num_ids(str_values)
    return new_map

def __transform_wd_constraints(wd_property, underlying_type):    
    property_scope = wd_constraints_ex.extract_wd_property_scope_values(wd_property)
    allowed_entity_types = wd_constraints_ex.extract_wd_allowed_entity_types_values(wd_property)
    allowed_qualifiers = __num_ids(wd_constraints_ex.extract_wd_allowed_qualifiers_values(wd_property))
    required_qualifiers = __num_ids(wd_constraints_ex.extract_wd_required_qualifiers_values(wd_property))
    conflicts_with = __get_num_ids_map(wd_constraints_ex.extract_wd_conflicts_with_values(wd_property))
    item_requires_statement = __get_num_ids_map(wd_constraints_ex.extract_wd_item_requires_statement_values(wd_property))
    subject_types = __make_map_values_num_ids(wd_constraints_ex.extract_wd_subject_value_class_values(wd_property))
    
    return {
        "propertyScope": property_scope,
        "allowedEntityTypes": allowed_entity_types,
        "allowedQualifiers": allowed_qualifiers,
        "requiredQualifiers": required_qualifiers,
        "conflictsWith": conflicts_with,
        "itemRequiresStatement": item_requires_statement,
        "subjectType": subject_types
    }
    
def transform_wd_property(str_property_id, wd_property):
    prop_datatype = wd_fields_ex.extract_wd_datatype(wd_property)
    
    num_id = wd_fields_ex.extract_wd_numeric_id_part(str_property_id)
    datatype = wd_property_datatypes.index_of(prop_datatype)
    underlying_type = wd_property_datatypes.type_of(prop_datatype)
    instance_of_num_ids = __num_ids(wd_statements_ex.extract_wd_instance_of_values(wd_property)) 
    subproperty_of_num_ids = __num_ids(wd_statements_ex.extract_wd_subproperty_of_values(wd_property))
    related_property_num_ids = __num_ids(wd_statements_ex.extract_wd_related_property_values(wd_property))
    equivalent_property_urls = wd_statements_ex.extract_wd_equivalent_property_values(wd_property)
    labels = wd_languages_tran.transform_wd_language_map(wd_fields_ex.extract_wd_labels(wd_property))
    descriptions = wd_languages_tran.transform_wd_language_map(wd_fields_ex.extract_wd_descriptions(wd_property))
    constraints = __transform_wd_constraints(wd_property, underlying_type)
    
    return {
        "id": num_id,
        "datatype": datatype,
        "underlyingType": underlying_type,
        "instanceOf": instance_of_num_ids,
        "subpropertyOf": subproperty_of_num_ids,
        "relatedProperty": related_property_num_ids,
        "equivalentProperty": equivalent_property_urls,
        "labels": labels,
        "descriptions": descriptions,
        "constraints": constraints
    }
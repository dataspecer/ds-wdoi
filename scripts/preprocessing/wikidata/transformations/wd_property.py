import wikidata.json_extractors.wd_fields as wd_fields_ex
import wikidata.json_extractors.wd_statements as wd_smts_ex
import wikidata.transformations.wd_fields as wd_fields_tran
import wikidata.transformations.wd_languages as wd_languages_tran 
import wikidata.json_extractors.wd_constraints as wd_constraints_ex
from wikidata.model.properties import Datatypes as wd_property_datatypes
from wikidata.model.properties import Properties

def __str_to_num_ids(str_ids_arr):
    return wd_fields_tran.transform_wd_str_ids_to_num_ids(str_ids_arr)

def __str_to_num_id(str_id):
    return wd_fields_tran.transform_wd_str_id_to_num_id(str_id)

def __map_str_values_to_num_ids(map):
    new_map = {}
    for key, values in map.items():
        new_map[key] = __str_to_num_ids(values)
    return new_map

def __str_map_to_num_ids_map(map):
    new_map = {}
    for str_prop, str_values in map.items():
        new_map[str(__str_to_num_id(str_prop))] = __str_to_num_ids(str_values)
    return new_map

def __transform_wd_constraints(wd_property, underlying_type):    
    property_scope = wd_constraints_ex.extract_wd_property_scope_values(wd_property)
    allowed_entity_types = wd_constraints_ex.extract_wd_allowed_entity_types_values(wd_property)
    allowed_qualifiers_str_ids = wd_constraints_ex.extract_wd_allowed_qualifiers_values(wd_property)
    required_qualifiers_str_ids = wd_constraints_ex.extract_wd_required_qualifiers_values(wd_property)
    conflicts_with_map = wd_constraints_ex.extract_wd_conflicts_with_values(wd_property)
    item_requires_statement_map = wd_constraints_ex.extract_wd_item_requires_statement_values(wd_property)
    subject_types_map = wd_constraints_ex.extract_wd_subject_value_class_values(wd_property)
    
    return {
        "propertyScope": property_scope,
        "allowedEntityTypes": allowed_entity_types,
        "allowedQualifiers": __str_to_num_ids(allowed_qualifiers_str_ids),
        "requiredQualifiers": __str_to_num_ids(required_qualifiers_str_ids),
        "conflictsWith": __str_map_to_num_ids_map(conflicts_with_map),
        "itemRequiresStatement": __str_map_to_num_ids_map(item_requires_statement_map),
        "subjectType": __map_str_values_to_num_ids(subject_types_map)
    }
    
def transform_wd_property(str_property_id, wd_property):
    prop_datatype = wd_fields_ex.extract_wd_datatype(wd_property)
    
    num_id = wd_fields_ex.extract_wd_numeric_id_part(str_property_id)
    datatype = wd_property_datatypes.index_of(prop_datatype)
    underlying_type = wd_property_datatypes.type_of(prop_datatype)

    # Descriptions
    labels = wd_languages_tran.transform_wd_language_map(wd_fields_ex.extract_wd_labels(wd_property))
    descriptions = wd_languages_tran.transform_wd_language_map(wd_fields_ex.extract_wd_descriptions(wd_property))
    
    # Statements
    instance_of_str_ids = wd_smts_ex.extract_wd_statement_values(wd_property, Properties.INSTANCE_OF) 
    subproperty_of_str_ids = wd_smts_ex.extract_wd_statement_values(wd_property, Properties.SUBCLASS_OF)
    related_property_str_ids = wd_smts_ex.extract_wd_statement_values(wd_property, Properties.RELATED_PROPERTY)
    equivalent_property_urls = wd_smts_ex.extract_wd_statement_values(wd_property, Properties.EQUIVALENT_PROPERTY)
    
    constraints = __transform_wd_constraints(wd_property, underlying_type)
    
    return {
        "id": num_id,
        "datatype": datatype,
        "underlyingType": underlying_type,
        "instanceOf": __str_to_num_ids(instance_of_str_ids),
        "subpropertyOf": __str_to_num_ids(subproperty_of_str_ids),
        "relatedProperty": __str_to_num_ids(related_property_str_ids),
        "equivalentProperty": equivalent_property_urls,
        "labels": labels,
        "descriptions": descriptions,
        "constraints": constraints
    }
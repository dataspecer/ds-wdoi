import wikidata.json_extractors.wd_fields as wd_json_fields_ex
import wikidata.json_extractors.wd_statements as wd_json_smts_ex
import wikidata.json_extractors.wd_constraints as wd_json_const_ex
import wikidata.extraction.wd_fields as wd_fields_tran
import wikidata.extraction.wd_languages as wd_languages_tran 
from wikidata.model.properties import Datatypes as PropertyDatatypes
from wikidata.model.properties import UnderlyingTypes as PropertyUnderlyingTypes
from wikidata.model.properties import Properties
from wikidata.model.constraints import GeneralConstraints
from wikidata.model.constraints import ItemDatatypeConstraints
from wikidata.iri import construct_wd_iri
from wikidata.model_simplified.properties import PropertyFields
from wikidata.model_simplified.constraints import GenConstFields, ItemConstFields

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


def __extract_entity_type_constraints(wd_property):
    values_types_map = wd_json_const_ex.extract_wd_subject_value_class_values(wd_property, ItemDatatypeConstraints.VALUE_TYPE)
    value_requires_statement = wd_json_const_ex.extract_wd_allowance_statement_values(wd_property, ItemDatatypeConstraints.VALUE_REQUIRES_STATEMENT)
    is_symetric = wd_json_const_ex.constraint_exists(wd_property, ItemDatatypeConstraints.SYMMETRIC)
    one_of = wd_json_const_ex.extract_codelists(wd_property, ItemDatatypeConstraints.ONE_OF)
    none_of = wd_json_const_ex.extract_codelists(wd_property, ItemDatatypeConstraints.NONE_OF)
    inverse = wd_json_const_ex.extract_inverse(wd_property)
    
    return {
        ItemConstFields.VALUE_TYPE.value: __map_str_values_to_num_ids(values_types_map),
        ItemConstFields.VALUE_REQUIRES_STATEMENT.value: __str_map_to_num_ids_map(value_requires_statement),
        ItemConstFields.IS_SYMETRIC.value: is_symetric,
        ItemConstFields.ONE_OF.value: __str_to_num_ids(one_of),
        ItemConstFields.NONE_OF.value: __str_to_num_ids(none_of),
        ItemConstFields.INVERSE.value: __str_to_num_id(inverse)
    }

def __extract_type_dependent_constraints(wd_property, underlying_type):
    if underlying_type == PropertyUnderlyingTypes.ENTITY:
        return __extract_entity_type_constraints(wd_property)
    else:
        return {}

def __extract_wd_constraints(wd_property, underlying_type):    
    
    # General constraints
    property_scope = wd_json_const_ex.extract_wd_property_scope_values(wd_property)
    allowed_entity_types = wd_json_const_ex.extract_wd_allowed_entity_types_values(wd_property)
    allowed_qualifiers_str_ids = wd_json_const_ex.extract_wd_allowed_qualifiers_values(wd_property)
    required_qualifiers_str_ids = wd_json_const_ex.extract_wd_required_qualifiers_values(wd_property)
    
    conflicts_with_map = wd_json_const_ex.extract_wd_allowance_statement_values(wd_property, GeneralConstraints.CONFLICTS_WITH)
    item_requires_statement_map = wd_json_const_ex.extract_wd_allowance_statement_values(wd_property, GeneralConstraints.ITEM_REQUIRES_STATEMENT)
    subject_types_map = wd_json_const_ex.extract_wd_subject_value_class_values(wd_property, GeneralConstraints.SUBJECT_TYPE)
    
    type_dependent_constraints = __extract_type_dependent_constraints(wd_property, underlying_type)
    
    return {
        GenConstFields.PROPERTY_SCOPE.value: property_scope,
        GenConstFields.ALLOWED_ENTITY_TYPES.value: allowed_entity_types,
        GenConstFields.ALLOWED_QUALIFIERS.value: __str_to_num_ids(allowed_qualifiers_str_ids),
        GenConstFields.REQUIRED_QUALIFIERS.value: __str_to_num_ids(required_qualifiers_str_ids),
        GenConstFields.CONFLICTS_WITH.value: __str_map_to_num_ids_map(conflicts_with_map),
        GenConstFields.ITEM_REQUIRES_STATEMENT.value: __str_map_to_num_ids_map(item_requires_statement_map),
        GenConstFields.SUBJECT_TYPE.value: __map_str_values_to_num_ids(subject_types_map),
        GenConstFields.TYPE_DEPENDENT.value: type_dependent_constraints
    }
    
def extract_wd_property(str_property_id, wd_property, languages):
    prop_datatype = wd_json_fields_ex.extract_wd_datatype(wd_property)
    
    num_id = wd_json_fields_ex.extract_wd_numeric_id_part(str_property_id)
    datatype = PropertyDatatypes.index_of(prop_datatype)
    underlying_type = PropertyDatatypes.type_of(prop_datatype)

    # Descriptions
    aliases = wd_languages_tran.extract_wd_language_array_map(wd_json_fields_ex.extract_wd_aliases(wd_property), languages)
    labels = wd_languages_tran.extract_wd_language_map(wd_json_fields_ex.extract_wd_labels(wd_property), languages)
    descriptions = wd_languages_tran.extract_wd_language_map(wd_json_fields_ex.extract_wd_descriptions(wd_property), languages)
    
    # Statements
    instance_of_str_ids = wd_json_smts_ex.extract_wd_statement_values(wd_property, Properties.INSTANCE_OF) 
    subproperty_of_str_ids = wd_json_smts_ex.extract_wd_statement_values(wd_property, Properties.SUBPROPERTY_OF)
    related_property_str_ids = wd_json_smts_ex.extract_wd_statement_values(wd_property, Properties.RELATED_PROPERTY)
    equivalent_property_urls = wd_json_smts_ex.extract_wd_statement_values(wd_property, Properties.EQUIVALENT_PROPERTY)
    inverse_property_str_ids = wd_json_smts_ex.extract_wd_statement_values(wd_property, Properties.INVERSE_PROPERTY)
    complementary_property_str_ids = wd_json_smts_ex.extract_wd_statement_values(wd_property, Properties.COMPLEMENTARY_PROPERTY)
    negates_property_str_ids = wd_json_smts_ex.extract_wd_statement_values(wd_property, Properties.NEGATES_PROPERTY)
    
    constraints = __extract_wd_constraints(wd_property, underlying_type)
    
    return {
        PropertyFields.ID.value: num_id,
        PropertyFields.IRI.value: construct_wd_iri(str_property_id),
        PropertyFields.ALIASES.value: aliases,
        PropertyFields.LABELS.value: labels,
        PropertyFields.DESCRIPTIONS.value: descriptions,
        PropertyFields.DATATYPE.value: datatype,
        PropertyFields.UNDERLYING_TYPE.value: underlying_type,
        PropertyFields.INSTANCE_OF.value: __str_to_num_ids(instance_of_str_ids),
        PropertyFields.SUBPROPERTY_OF.value: __str_to_num_ids(subproperty_of_str_ids),
        PropertyFields.RELATED_PROPERTY.value: __str_to_num_ids(related_property_str_ids),
        PropertyFields.INVERSE_PROPERTY.value: __str_to_num_ids(inverse_property_str_ids),
        PropertyFields.COMPLEMENTARY_PROPERTY.value: __str_to_num_ids(complementary_property_str_ids),
        PropertyFields.NEGATES_PROPERTY.value: __str_to_num_ids(negates_property_str_ids),
        PropertyFields.EQUIVALENT_PROPERTY.value: equivalent_property_urls,
        PropertyFields.CONSTRAINTS.value: constraints
    }
from phases.experimental_search_engine_data_preparation.data_entities.data_class import DataClassFields
from phases.experimental_search_engine_data_preparation.data_entities.data_property import DataPropertyFields
from core.default_languages import ENGLISH_LANGUAGE
from phases.experimental_search_engine_data_preparation.phase_parts.lexicalize_entities.fields_lexicalization.common_lexicalization import multiple_language_values

"""
Note we are using only the English language.
"""

CLASSES_ADDITIONAL_DESCRIPTIONS = "additionalDescriptions"

def __create_language_key(field, language):
    return str(field) + "_" + ENGLISH_LANGUAGE

def __add_language_value_from_field(language_field_map, wd_data_entity, field, default_value):
    wd_language_object = wd_data_entity[field]
    lang_key = __create_language_key(field, ENGLISH_LANGUAGE)
    if  ENGLISH_LANGUAGE in wd_language_object:
        language_field_map[lang_key] = wd_language_object[ENGLISH_LANGUAGE]
    else:
        language_field_map[lang_key] = default_value

# Class 

def __expand_and_concat_fields(language_field_map, fields, store_as, wd_data_class, classes_dict: dict, expanded_labels_dict: dict):
    language_values = []
    for field in fields:
        values = multiple_language_values(wd_data_class[field], 100, DataClassFields.LABELS.value, classes_dict, expanded_labels_dict, ENGLISH_LANGUAGE)
        language_values += values
    language_field_map[store_as] = language_values    

def __generate_class_source(wd_data_class, classes_dict: dict, expanded_labels_dict: dict): 
    source = {}
    __add_language_value_from_field(source, wd_data_class, DataPropertyFields.LABELS.value, "")
    __add_language_value_from_field(source, wd_data_class, DataPropertyFields.DESCRIPTIONS.value, "")
    __add_language_value_from_field(source, wd_data_class, DataPropertyFields.ALIASES.value, [])
    # Store subclass of separately from the rest of concat description fields.
    # Because we can assign it more importance.
    __expand_and_concat_fields(
        source,
        [DataClassFields.SUBCLASS_OF.value],
        __create_language_key(DataClassFields.SUBCLASS_OF.value, ENGLISH_LANGUAGE),
        wd_data_class,
        classes_dict,
        expanded_labels_dict
    )
    __expand_and_concat_fields(
        source,
        [
            DataClassFields.HAS_CHARACTERISTICS.value,
            DataClassFields.HAS_EFFECT.value,
            DataClassFields.HAS_CAUSE.value,
            DataClassFields.HAS_USE.value,
            DataClassFields.PART_OF.value,
            DataClassFields.HAS_PARTS.value,
        ],
        __create_language_key(CLASSES_ADDITIONAL_DESCRIPTIONS, ENGLISH_LANGUAGE),
        wd_data_class,
        classes_dict,
        expanded_labels_dict
    )
    
    return source
    
def generate_class_elastic_input(wd_data_class, elastic_index_name, classes_dict: dict, expanded_labels_dict: dict):
    class_input =  {
        "_op_type": "index",
        "_index": elastic_index_name,
        "_id": wd_data_class[DataClassFields.ID.value],
        "_source": __generate_class_source(wd_data_class, classes_dict, expanded_labels_dict)
    }
    return class_input

# Property

def __generate_property_source(wd_data_property):
    source = {}
    __add_language_value_from_field(source, wd_data_property, DataPropertyFields.LABELS.value, "")
    __add_language_value_from_field(source, wd_data_property, DataPropertyFields.DESCRIPTIONS.value, "")
    __add_language_value_from_field(source, wd_data_property, DataPropertyFields.ALIASES.value, [])
    return source
    
def generate_property_elastic_input(wd_data_property, elastic_index_name):
    property_input =  {
        "_op_type": "index",
        "_index": elastic_index_name,
        "_id": wd_data_property[DataPropertyFields.ID.value],
        "_source": __generate_property_source(wd_data_property)
    }
    return property_input
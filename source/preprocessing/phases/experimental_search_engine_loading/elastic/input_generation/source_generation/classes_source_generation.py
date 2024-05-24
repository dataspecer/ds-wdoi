from phases.experimental_search_engine_data_preparation.data_entities.data_class import DataClassFields
from core.default_languages import ENGLISH_LANGUAGE
from phases.experimental_search_engine_data_preparation.phase_parts.lexicalize_entities.fields_lexicalization.common_lexicalization import multiple_language_values
from phases.experimental_search_engine_loading.elastic.input_generation.source_generation.common_source_generation import add_language_value_from_field, create_language_map_key, convert_num_ids_to_keywords

CLASSES_ADDITIONAL_DESCRIPTIONS = "additionalDescriptions"

def __expand_and_concat_class_fields(fields, wd_data_class, classes_dict: dict, expanded_labels_dict: dict):
    language_values = []
    for field in fields:
        values = multiple_language_values(wd_data_class[field], 100, DataClassFields.LABELS.value, classes_dict, expanded_labels_dict, ENGLISH_LANGUAGE)
        language_values += values
    return language_values    

def __generate_class_source(wd_data_class, classes_dict: dict, expanded_labels_dict: dict): 
    source = {}
    
    add_language_value_from_field(source, wd_data_class, DataClassFields.LABELS.value, "")
    add_language_value_from_field(source, wd_data_class, DataClassFields.DESCRIPTIONS.value, "")
    add_language_value_from_field(source, wd_data_class, DataClassFields.ALIASES.value, [])
    
    # Store subclass of separately from the rest of concat description fields.
    # Because we can assign it more importance.
    subclass_of_map_key = create_language_map_key(DataClassFields.SUBCLASS_OF.value)
    source[subclass_of_map_key] = __expand_and_concat_class_fields(
        [DataClassFields.SUBCLASS_OF.value],
        wd_data_class,
        classes_dict,
        expanded_labels_dict
    )
    # All the description fields are concatenated since they will carry the same importance.
    additional_description_map_key = create_language_map_key(CLASSES_ADDITIONAL_DESCRIPTIONS)
    source[additional_description_map_key] = __expand_and_concat_class_fields(
        [
            DataClassFields.HAS_CHARACTERISTICS.value,
            DataClassFields.HAS_EFFECT.value,
            DataClassFields.HAS_CAUSE.value,
            DataClassFields.HAS_USE.value,
            DataClassFields.PART_OF.value,
            DataClassFields.HAS_PARTS.value,
        ],
        wd_data_class,
        classes_dict,
        expanded_labels_dict
    )
    # Add Ancestors defining properties as keywords for filtering.
    source[DataClassFields.ANCESTORS_DEFINING_PROPERTIES.value] = convert_num_ids_to_keywords(wd_data_class[DataClassFields.ANCESTORS_DEFINING_PROPERTIES.value])
    
    return source
    
def generate_class_elastic_input(wd_data_class, elastic_index_name, classes_dict: dict, expanded_labels_dict: dict):
    class_input =  {
        "_op_type": "index",
        "_index": elastic_index_name,
        "_id": wd_data_class[DataClassFields.ID.value],
        "_source": __generate_class_source(wd_data_class, classes_dict, expanded_labels_dict)
    }
    return class_input
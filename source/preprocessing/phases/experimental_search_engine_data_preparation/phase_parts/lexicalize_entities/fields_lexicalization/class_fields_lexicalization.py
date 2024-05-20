from phases.experimental_search_engine_data_preparation.data_entities.data_class import DataClassFields
import phases.experimental_search_engine_data_preparation.phase_parts.lexicalize_entities.fields_lexicalization.common_lexicalization as clex
from core.default_languages import ENGLISH_LANGUAGE

VALUES_LIMIT = 3

FIELDS_TO_EXPAND = [
        (DataClassFields.SUBCLASS_OF.value, "is a", VALUES_LIMIT),
        (DataClassFields.HAS_CAUSE.value, "is caused by", VALUES_LIMIT),
        (DataClassFields.HAS_CHARACTERISTICS.value, "is characterized by", VALUES_LIMIT),
        (DataClassFields.HAS_EFFECT.value, "is the cause of", VALUES_LIMIT),
        (DataClassFields.HAS_USE.value, "has use:", VALUES_LIMIT),
        (DataClassFields.HAS_PARTS.value, "is formed from", VALUES_LIMIT),
        (DataClassFields.PART_OF.value, "is part of", VALUES_LIMIT)
    ]

def __try_add_to_map(m, key, value: None | str):
    if value != None:
        m[key] = value

def lexicalize_wd_data_class(wd_data_class, classes_dict: dict, expanded_labels_dict: dict):
    lex_map = {}
    
    label_lex = __lexicalize_label_description(wd_data_class)
    __try_add_to_map(lex_map, DataClassFields.LABELS.value, label_lex)
        
    aliases_lex = __lexicalize_aliases(wd_data_class, VALUES_LIMIT)
    __try_add_to_map(lex_map, DataClassFields.ALIASES.value, aliases_lex)

    for record in FIELDS_TO_EXPAND:
        field, concat_str, values_limit = record
        value = __lexicalize_ids_field(wd_data_class, concat_str, field, values_limit, classes_dict, expanded_labels_dict)
        __try_add_to_map(lex_map, field, value)
    
    return lex_map
    
def __lexicalize_label_description(wd_data_class):
    return clex.lexicalize_label_description(wd_data_class, DataClassFields.LABELS.value, DataClassFields.DESCRIPTIONS.value, ENGLISH_LANGUAGE)
    
def __lexicalize_aliases(wd_data_class, values_limit: int):
        return clex.lexicalize_aliases(
            wd_data_class,
            DataClassFields.LABELS.value,
            DataClassFields.ALIASES.value, 
            values_limit,
            ENGLISH_LANGUAGE
        )

def __lexicalize_ids_field(wd_data_class, concat_str: str, field: str, values_limit: int, classes_dict: dict, expanded_labels_dict: dict):
    return clex.lexicalize_ids_field_with_labels(
            wd_data_class,
            DataClassFields.LABELS.value,
            concat_str,
            field, 
            values_limit,
            classes_dict, 
            expanded_labels_dict, 
            ENGLISH_LANGUAGE
        )
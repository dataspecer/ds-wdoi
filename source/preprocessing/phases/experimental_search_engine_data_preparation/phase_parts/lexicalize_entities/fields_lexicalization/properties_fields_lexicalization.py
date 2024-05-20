from phases.experimental_search_engine_data_preparation.data_entities.data_property import DataPropertyFields
import phases.experimental_search_engine_data_preparation.phase_parts.lexicalize_entities.fields_lexicalization.common_lexicalization as clex
from core.default_languages import ENGLISH_LANGUAGE

VALUES_LIMIT = 5

def try_add_to_map(m, key, value: None | str):
    if value != None:
        m[key] = value

def lexicalize_wd_data_property(wd_data_property):
    lex_map = {}
    
    label_lex = __lexicalize_label_description(wd_data_property)
    try_add_to_map(lex_map, DataPropertyFields.LABELS.value, label_lex)
        
    aliases_lex = __lexicalize_aliases(wd_data_property, VALUES_LIMIT)
    try_add_to_map(lex_map, DataPropertyFields.ALIASES.value, aliases_lex)

    return lex_map
    
def __lexicalize_label_description(wd_data_property):
    return clex.lexicalize_label_description(wd_data_property, DataPropertyFields.LABELS.value, DataPropertyFields.DESCRIPTIONS.value, ENGLISH_LANGUAGE)
    
def __lexicalize_aliases(wd_data_property, values_limit: int):
        return clex.lexicalize_aliases(
            wd_data_property,
            DataPropertyFields.LABELS.value,
            DataPropertyFields.ALIASES.value, 
            values_limit,
            ENGLISH_LANGUAGE
        )
from phases.experimental_search_engine_loading.elastic.input_generation.source_generation.common_source_generation import create_language_map_key
from phases.experimental_search_engine_loading.elastic.input_generation.source_generation.classes_source_generation import CLASSES_ADDITIONAL_DESCRIPTIONS
from phases.experimental_search_engine_data_preparation.data_entities.data_class import DataClassFields
from phases.experimental_search_engine_data_preparation.data_entities.data_property import DataPropertyFields
import phases.experimental_search_engine_loading.elastic.elastic_client as es

def __create_text_mapping_with_sub_keywords():
    return {
        "type": "text",
        "analyzer": es.ELASTIC_ENGLISH_ANALYZER,
        'fields': {
            'keyword': {
                'type': 'keyword',
                "normalizer": "lowercase",
                'ignore_above': 256
            }
        },
    }
    
def __create_text_mapping():
     return {
        "type": "text",
        "analyzer": es.ELASTIC_ENGLISH_ANALYZER,
    }

def __create_keyword_mapping():
    return {
        'type': 'keyword',
    }

def create_class_mappings():
    return {
        "_source": {
            "enabled": False
        },
        "properties": {
            create_language_map_key(DataClassFields.LABELS.value):    __create_text_mapping_with_sub_keywords(),  
            create_language_map_key(DataClassFields.ALIASES.value):  __create_text_mapping_with_sub_keywords(), 
            create_language_map_key(DataClassFields.SUBCLASS_OF.value): __create_text_mapping_with_sub_keywords(),
            create_language_map_key(DataClassFields.DESCRIPTIONS.value):   __create_text_mapping(),
            create_language_map_key(CLASSES_ADDITIONAL_DESCRIPTIONS): __create_text_mapping(),
            DataClassFields.ANCESTORS_DEFINING_PROPERTIES.value: __create_keyword_mapping()
        }
    }
    
def create_property_mappings():
    return {
        "_source": {
            "enabled": False
        },
        "properties": {
            create_language_map_key(DataPropertyFields.LABELS.value):    __create_text_mapping_with_sub_keywords(),  
            create_language_map_key(DataPropertyFields.ALIASES.value):  __create_text_mapping_with_sub_keywords(), 
            create_language_map_key(DataPropertyFields.DESCRIPTIONS.value):   __create_text_mapping()     
        }
    }
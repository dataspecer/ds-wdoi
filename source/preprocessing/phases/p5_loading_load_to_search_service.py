import pathlib
import logging 
import utils.decoding as decoding
import wikidata.json_extractors.wd_fields as wd_fields_ex
from wikidata.model.entity_json_fields import RootFields
import utils.elastic_search as es
import utils.logging as ul
from utils.timer import timed

main_logger = logging.getLogger("loading")
classes_logger = main_logger.getChild("p4_load_classes")
properties_logger = main_logger.getChild("p4_load_properties")

def __add_language_value_from_field(language_field_map, wd_entity, field: RootFields, language, default_value = ""):
    wd_language_object = wd_fields_ex.extract_from_wd_json(wd_entity, field)
    if wd_language_object != None and language in wd_language_object:
        language_field_map[str(field)] = wd_language_object[language]
    else:
        language_field_map[str(field)] = default_value

def __extract_wd_entity_language_values(wd_entity, language):
    language_map_entry_value = {}
    __add_language_value_from_field(language_map_entry_value, wd_entity, RootFields.LABELS, language)    
    __add_language_value_from_field(language_map_entry_value, wd_entity, RootFields.ALIASES, language, default_value=[])
    return language_map_entry_value

def __create_language_map(wd_entity, languages):
    language_map = {}
    for lang in languages:
        language_map[lang] = __extract_wd_entity_language_values(wd_entity, lang)
    return language_map

def __generate_elastic_input(wd_entity, languages, elastic_index_name):
    elastic_input =  {
        "_op_type": "index",
        "_index": elastic_index_name,
        "_id": wd_fields_ex.extract_wd_id(wd_entity),
        "_source": __create_language_map(wd_entity, languages)
    }
    return elastic_input

def __elastic_input_generator(input_json_file, logger, logging_step, languages, elastic_index_name):
    i = 0
    for binary_line in input_json_file:
        try:
            wd_entity = decoding.line_to_wd_entity(binary_line)
            if wd_entity != None:
                yield __generate_elastic_input(wd_entity, languages, elastic_index_name)
        except Exception as e:
            logger.exception("There was an error during loading of an entity.")
        i += 1
        ul.try_log_progress(logger, i, logging_step)
    ul.log_progress(logger, i)

def __load_entities(json_file_path: pathlib.Path, logger, logging_step, languages, elastic_index_name): 
    with open(json_file_path, "rb") as input_json_file:
        data_generator = __elastic_input_generator(input_json_file, logger, logging_step, languages, elastic_index_name)
        es.bulk(es.client, data_generator, chunk_size=es.CHUNK_SIZE)
        es.client.indices.refresh(index=elastic_index_name)

@timed(classes_logger)
def load_classes(json_file_path: pathlib.Path, languages):
    __load_entities(json_file_path, classes_logger, ul.CLASSES_PROGRESS_STEP, languages, es.CLASSES_ELASTIC_INDEX_NAME)

@timed(properties_logger)
def load_properties(json_file_path: pathlib.Path, languages):
    __load_entities(json_file_path, properties_logger, ul.PROPERTIES_PROGRESS_STEP, languages, es.PROPERTIES_ELASTIC_INDEX_NAME)
    
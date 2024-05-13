from pathlib import Path
import core.utils.decoding as decoding
import core.json_extractors.wd_fields as wd_json_fields_ex
from core.model_wikidata.entity_json_fields import RootFields
import phases.search_engine_loading.elastic_search_config as es
import core.utils.logging as ul
from core.utils.timer import timed
from core.default_languages import DEFAULT_LANGUAGES

main_logger = ul.root_logger.getChild("loading")
classes_logger = main_logger.getChild("classes")
properties_logger = main_logger.getChild("properties")

def __construct_field_lang_key(field: RootFields, lang: str):
    return str(field) + "_" + lang

def __add_language_value_from_field(language_field_map, wd_entity, field: RootFields, language, default_value = ""):
    wd_language_object = wd_json_fields_ex.extract_from_wd_json(wd_entity, field)
    lang_key = __construct_field_lang_key(field, language)
    if wd_language_object != None and language in wd_language_object:
        language_field_map[lang_key] = wd_language_object[language]
    else:
        language_field_map[lang_key] = default_value

def __create_language_map(wd_entity, languages):
    language_map = {}
    for lang in languages:
        __add_language_value_from_field(language_map, wd_entity, RootFields.LABELS, lang)    
        __add_language_value_from_field(language_map, wd_entity, RootFields.ALIASES, lang, default_value=[])
    return language_map

def __generate_elastic_input(wd_entity, languages, elastic_index_name):
    elastic_input =  {
        "_op_type": "index",
        "_index": elastic_index_name,
        "_id": wd_json_fields_ex.extract_wd_id(wd_entity),
        "_source": __create_language_map(wd_entity, languages)
    }
    return elastic_input

def __elastic_input_generator(input_json_file, logger, logging_step, languages, elastic_index_name):
    for wd_entity in decoding.entities_from_file(input_json_file, logger, logging_step):
        yield __generate_elastic_input(wd_entity, languages, elastic_index_name)
        
def __load_entities(json_file_path: Path, logger, logging_step, languages, elastic_index_name): 
    with open(json_file_path, "rb") as input_json_file:
        data_generator = __elastic_input_generator(input_json_file, logger, logging_step, languages, elastic_index_name)
        es.bulk(es.client, data_generator, chunk_size=es.CHUNK_SIZE)
        es.client.indices.refresh(index=elastic_index_name)

@timed(classes_logger)
def __load_classes(json_file_path: Path, languages):
    __load_entities(json_file_path, classes_logger, ul.CLASSES_PROGRESS_STEP, languages, es.CLASSES_ELASTIC_INDEX_NAME)

@timed(properties_logger)
def __load_properties(json_file_path: Path, languages):
    __load_entities(json_file_path, properties_logger, ul.PROPERTIES_PROGRESS_STEP, languages, es.PROPERTIES_ELASTIC_INDEX_NAME)
    
@timed(main_logger)
def main_loading(properties_json_file_path: Path, classes_json_file_path: Path):
    try:
        __load_properties(properties_json_file_path, DEFAULT_LANGUAGES)
        __load_classes(classes_json_file_path, DEFAULT_LANGUAGES)
        return True
    except Exception as e:
        main_logger.exception("There was an error that cannot be handled")
        main_logger.critical("Exiting phase...")
        return False
import pprint
from core.utils.timer import timed
from phases.experimental_search_engine_loading.main_logger import main_logger
import phases.experimental_search_engine_loading.elastic.elastic_client as es
from pathlib import Path
import core.utils.decoding as decoding
import core.utils.logging as ul
from phases.experimental_search_engine_loading.elastic.input_generation.source_generation.classes_source_generation import generate_class_elastic_input
from phases.experimental_search_engine_loading.elastic.input_generation.source_generation.properties_source_generation import generate_property_elastic_input
from phases.experimental_search_engine_data_preparation.data_entities.data_class import DataClassFields
from phases.experimental_search_engine_data_preparation.data_entities.data_property import DataPropertyFields
import phases.experimental_search_engine_loading.elastic.elastic_index_helpers as index_helpers

"""
Note we are using only the English language.
"""

logger = main_logger.getChild("elastic")
pp = pprint.PrettyPrinter(indent=2)


@timed(logger)
def __load_classes_to_dict(classes_json_file_path: Path) -> dict:
    def __remove_vectors(wd_class):
        wd_class[DataClassFields.DENSE_VECTOR.value] = []
        wd_class[DataClassFields.SPARSE_VECTOR.value] = []
        return wd_class
    return decoding.load_entities_to_dict(classes_json_file_path, logger, ul.CLASSES_PROGRESS_STEP, __remove_vectors)

@timed(logger)
def __load_properties_to_dict(classes_json_file_path: Path) -> dict:
    def __remove_vectors(wd_class):
        wd_class[DataPropertyFields.DENSE_VECTOR.value] = []
        wd_class[DataPropertyFields.SPARSE_VECTOR.value] = []
        return wd_class
    return decoding.load_entities_to_dict(classes_json_file_path, logger, ul.PROPERTIES_PROGRESS_STEP, __remove_vectors)

@timed(logger)
def __load_expanded_labels_to_dict(expanded_labels_json_file_path: Path) -> dict:
    return decoding.load_entities_to_dict(expanded_labels_json_file_path, logger, ul.CLASSES_PROGRESS_STEP)

def __elastic_input_generator(entities_dict: dict, elastic_index_name, entity_generate_func):
    for i, wd_entity in enumerate(entities_dict.values()):
        yield entity_generate_func(wd_entity, elastic_index_name)
        ul.try_log_progress(logger, i, ul.HUNDRED_K_PROGRESS_STEP)

def __load_entities_to_elastic(entities_dict: dict, elastic_index_name, entity_generate_func): 
    data_generator = __elastic_input_generator(entities_dict, elastic_index_name, entity_generate_func)
    es.bulk(es.elastic_client, data_generator, chunk_size=es.ELASTIC_CHUNK_SIZE)
    es.elastic_client.indices.refresh(index=elastic_index_name)

@timed(logger)
def __load_classes_to_elastic(classes_json_file_path: Path, expanded_labels_json_file_path: Path):
    classes_dict = __load_classes_to_dict(classes_json_file_path)
    expanded_labels_dict = __load_expanded_labels_to_dict(expanded_labels_json_file_path)
    
    def capture_func(wd_data_class, elastic_index_name):
        classes_dict_capture = classes_dict
        expanded_labels_dict_capture = expanded_labels_dict
        return generate_class_elastic_input(wd_data_class, elastic_index_name, classes_dict_capture, expanded_labels_dict_capture)
    
    __load_entities_to_elastic(classes_dict, es.ELASTIC_CLASSES_INDEX_NAME, capture_func)

@timed(logger)
def __load_properties_to_elastic(properties_json_file_path: Path):
    properties_dict = __load_properties_to_dict(properties_json_file_path)
    __load_entities_to_elastic(properties_dict, es.ELASTIC_PROPERTIES_INDEX_NAME, generate_property_elastic_input)

@timed(logger)
def load_to_elastic(classes_json_file_path: Path, properties_json_file_path: Path, expanded_labels_file_path: Path):
    index_helpers.delete()
    index_helpers.create()
    __load_classes_to_elastic(classes_json_file_path, expanded_labels_file_path)
    __load_properties_to_elastic(properties_json_file_path)
    index_helpers.refresh()    
    index_helpers.list_mappings()
    index_helpers.list_sizes()
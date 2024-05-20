from pathlib import Path
from phases.experimental_search_engine_data_preparation.main_logger import main_logger
from core.utils.timer import timed
from phases.experimental_search_engine_data_preparation.data_entities.data_class import DataClassFields
from phases.experimental_search_engine_data_preparation.phase_parts.vectorize.dense import vectorize_dense
from phases.experimental_search_engine_data_preparation.phase_parts.vectorize.sparse_splade import vectorize_sparse
from phases.experimental_search_engine_data_preparation.data_entities.data_property import DataPropertyFields
import core.utils.logging as ul
import core.utils.decoding as decoding
from core.output_directory import OUTPUT_DIR_PATH

logger = main_logger.getChild("vectorize")

CLASSE_OUTPUT_FILE_PATH = OUTPUT_DIR_PATH / "classes-experimental-prep-4-vectorize.json" 
PROPERTIES_OUTPUT_FILE_PATH = OUTPUT_DIR_PATH / "properties-experimental-prep-4-vectorize.json" 

ON_EMPTY_STRING_VALUE = "empty"

CLASSES_FIELDS_TO_VECTORIZE = [
        # Labels contains description.
        DataClassFields.LABELS.value,
        DataClassFields.ALIASES.value,
        DataClassFields.SUBCLASS_OF.value,
        DataClassFields.HAS_CHARACTERISTICS.value,
        DataClassFields.HAS_EFFECT.value,
        DataClassFields.HAS_CAUSE.value,
        DataClassFields.HAS_USE.value,
        DataClassFields.PART_OF.value,
        DataClassFields.HAS_PARTS.value,
    ]

PROPERTIES_FIELDS_TO_VECTORIZE = [
        # Labels contains description.
        DataClassFields.LABELS.value,
        DataClassFields.ALIASES.value,
    ]

def __concat_lex_sentences(lex_map, fields_to_concat: list[str]):
    non_empty_fields = filter(lambda x: x in lex_map, fields_to_concat)
    strings_to_concat = map(lambda x: lex_map[x], non_empty_fields)
    text =  " ".join(strings_to_concat)
    if text != None and text != "":
        return text
    else:
        return ON_EMPTY_STRING_VALUE

@timed(logger)
def __load_classes_to_dict(classes_json_file_path: Path) -> dict:
    return decoding.load_entities_to_dict(classes_json_file_path, logger, ul.CLASSES_PROGRESS_STEP)

@timed(logger)
def __load_properties_to_dict(classes_json_file_path: Path) -> dict:
    return decoding.load_entities_to_dict(classes_json_file_path, logger, ul.PROPERTIES_PROGRESS_STEP)

@timed(logger)
def __load_lexicalized_classes_to_dict(lexicalized_classes_json_file_path: Path) -> dict:
    return decoding.load_entities_to_dict(lexicalized_classes_json_file_path, logger, ul.CLASSES_PROGRESS_STEP)

@timed(logger)
def __load_lexicalized_properties_to_dict(lexicalized_properties_json_file_path: Path) -> dict:
    return decoding.load_entities_to_dict(lexicalized_properties_json_file_path, logger, ul.PROPERTIES_PROGRESS_STEP)

@timed(logger)
def __write_dicts_to_files(classes_dict, properties_dict):
    decoding.write_entities_dict_to_file(classes_dict, CLASSE_OUTPUT_FILE_PATH)
    decoding.write_entities_dict_to_file(properties_dict, PROPERTIES_OUTPUT_FILE_PATH)

@timed(logger)
def __assign_text_to_entities(entities_dict: dict, lexicalized_entities_dict: dict, lex_field: str, fields_to_concat: list[str]):
    for i, [wd_data_entity_id, wd_data_entity] in enumerate(entities_dict.items()):
        if wd_data_entity_id in lexicalized_entities_dict:
            lex_map = lexicalized_entities_dict[wd_data_entity_id][lex_field]
            text = __concat_lex_sentences(lex_map, fields_to_concat)
            wd_data_entity[lex_field] = text
            ul.try_log_progress(logger, i, ul.HUNDRED_K_PROGRESS_STEP)
        else:
            wd_data_entity[lex_field] = ON_EMPTY_STRING_VALUE

@timed(logger)
def vectorize_entities(classes_json_file_path: Path, properties_json_file_path: Path, lexicalized_classes_json_file_path: Path, lexicalized_properties_json_file_path: Path):
    classes_dict = __load_classes_to_dict(classes_json_file_path)
    logger.info("Assigning text to classes")
    __assign_text_to_entities(classes_dict, __load_lexicalized_classes_to_dict(lexicalized_classes_json_file_path), DataClassFields.LEXICALIZATION.value, CLASSES_FIELDS_TO_VECTORIZE)
    
    properties_dict = __load_properties_to_dict(properties_json_file_path)
    logger.info("Assigning text to properties")
    __assign_text_to_entities(properties_dict, __load_lexicalized_properties_to_dict(lexicalized_properties_json_file_path), DataPropertyFields.LEXICALIZATION.value, PROPERTIES_FIELDS_TO_VECTORIZE)
    
    logger.info("Dense vectorization of classes")
    vectorize_dense(classes_dict, DataClassFields.LEXICALIZATION.value, DataClassFields.DENSE_VECTOR.value)
    
    logger.info("Dense vectorization of properties")
    vectorize_dense(properties_dict, DataPropertyFields.LEXICALIZATION.value, DataPropertyFields.DENSE_VECTOR.value)
    
    logger.info("Sparse vectorization of classes")
    vectorize_sparse(classes_dict, DataClassFields.LEXICALIZATION.value, DataClassFields.SPARSE_VECTOR.value)
    
    logger.info("Sparse vectorization of properties")
    vectorize_sparse(properties_dict, DataPropertyFields.LEXICALIZATION.value, DataPropertyFields.SPARSE_VECTOR.value)
    
    __write_dicts_to_files(classes_dict, properties_dict)
    
    
    
    
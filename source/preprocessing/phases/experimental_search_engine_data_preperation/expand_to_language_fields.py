from phases.experimental_search_engine_data_preperation.main_logger import main_logger
from pathlib import Path
from core.utils.timer import timed
from phases.experimental_search_engine_data_preperation.data_entities.data_class import DataClassFields
import core.utils.logging as ul
import core.utils.decoding as decoding
import gzip
import re
import phases.extraction.entity_extractors.wd_languages as wd_languages_tran
import core.json_extractors.wd_fields as wd_fields_ex
import core.default_languages as default_langs
from core.output_directory import OUTPUT_DIR_PATH

logger = main_logger.getChild("extend_to_language_fields")

CLASSES_OUTPUT_FILE_PATH = OUTPUT_DIR_PATH / "classes-experimental-prep-2-expand.json" 

FIELDS_TO_EXPAND = [
        DataClassFields.HAS_CAUSE.value,
        DataClassFields.HAS_CHARACTERISTICS.value,
        DataClassFields.HAS_EFFECT.value,
        DataClassFields.HAS_PARTS.value,
        DataClassFields.HAS_USE.value,
        DataClassFields.PART_OF.value
    ]

@timed(logger)
def __load_classes_to_dict(classes_json_file_path: Path) -> dict:
    return decoding.load_entities_to_dict(classes_json_file_path, logger, ul.CLASSES_PROGRESS_STEP)

def __log_missing_ids(classes_dict: dict, usage_ids_set):
    present = 0
    missing = 0
    for id in usage_ids_set:
        if id in classes_dict:
            present += 1
        else:
            missing += 1
    logger.info(f"Missing {missing} entities")
    logger.info(f"Present are {present} entities")

@timed(logger)
def __usage_of_fields(classes_dict: dict):
    usage_counts = {value: 0 for value in FIELDS_TO_EXPAND}
    usage_ids_set = set()
    
    for i, [_, wd_data_class] in enumerate(classes_dict.items()):
        for field in FIELDS_TO_EXPAND:
            usage_counts[field] += len(wd_data_class[field])
            usage_ids_set.update(wd_data_class[field])
        ul.try_log_progress(logger, i, ul.CLASSES_PROGRESS_STEP)

    __log_missing_ids(classes_dict, usage_ids_set)
    logger.info("Usage counts are:")
    logger.info(usage_counts)
    return usage_ids_set

def __try_extract_english_label(wd_entity):
    labels = wd_fields_ex.extract_wd_labels(wd_entity)
    if labels != None:
        lang_map = wd_languages_tran.extract_wd_language_map(labels, [default_langs.ENGLISH_LANGUAGE])
        if default_langs.ENGLISH_LANGUAGE in lang_map:
            return lang_map[default_langs.ENGLISH_LANGUAGE] 
    return None

def __try_store_english_label(wd_entity_id, english_label, d):
    if english_label != None:
        d[wd_entity_id] = { 
            DataClassFields.ID.value: wd_entity_id,
            DataClassFields.LABELS.value: {
                default_langs.ENGLISH_LANGUAGE: english_label,
            }
        }

@timed(logger)
def __collect_additional_labels(usage_ids_set, classes_dict: dict, gzip_json_dump_file_path: Path):
    additional_labels = dict()
    with gzip.open(gzip_json_dump_file_path) as gzip_dump_file:
        pattern = re.compile('"id":"Q([0-9]+)"')
        for wd_entity_str_line in decoding.entities_from_file(gzip_dump_file, logger, ul.CLASSES_PROGRESS_STEP, return_as_str=True):
            try:
                result = pattern.search(wd_entity_str_line, 0, 160)
                if result != None:
                    wd_entity_id = int(result.group(1))
                    if wd_entity_id in usage_ids_set and wd_entity_id not in classes_dict:
                        wd_entity = decoding.__load_wd_entity_json(wd_entity_str_line)
                        english_label = __try_extract_english_label(wd_entity)
                        __try_store_english_label(wd_entity_id, english_label, additional_labels)
            except AttributeError:
                logger.exception("Failed to parse pattern from string.")    
            except Exception:
                logger.exception("Failed to process entity from dump.")
    return additional_labels

@timed(logger)
def __write_additional_labels_to_file(additional_labels: dict):
    decoding.write_entities_dict_to_file(additional_labels, CLASSES_OUTPUT_FILE_PATH)

@timed(logger)
def expand_to_langauge_fields(classes_json_file_path: Path, gzip_json_dump_file_path: Path):
    classes_dict = __load_classes_to_dict(classes_json_file_path)
    usage_ids_set = __usage_of_fields(classes_dict)
    additional_labels = __collect_additional_labels(usage_ids_set, classes_dict, gzip_json_dump_file_path)
    __write_additional_labels_to_file(additional_labels)
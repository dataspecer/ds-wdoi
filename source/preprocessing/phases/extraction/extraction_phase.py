from enum import StrEnum
import gzip
from core.output_directory import OUTPUT_DIR_PATH
import core.json_extractors.wd_fields as wd_fields_ex
import core.model_wikidata.entity_types as wd_entity_types
import core.utils.logging as ul
import core.utils.decoding as decoding
from core.utils.timer import timed
from phases.extraction.entity_extractors.wd_class import extract_wd_class
from phases.extraction.entity_extractors.wd_property import extract_wd_property
from core.default_languages import DEFAULT_LANGUAGES

main_logger = ul.root_logger.getChild("extraction")
classes_logger = main_logger.getChild("extract_classes")
properties_logger = main_logger.getChild("extract_properties")

CLASSES_OUTPUT_FILE_PATH = OUTPUT_DIR_PATH / "classes-ex.json"
PROPERTIES_OUTPUT_FILE_PATH = OUTPUT_DIR_PATH / 'properties-ex.json'

class Phases(StrEnum):
    BOTH = "both"
    CLASSES = "cls"
    PROPERTIES = "props"

def __process_wd_entity(wd_entity, output_file, transform_func, type_check_func, logger, languages):
    try:
        str_id = wd_fields_ex.extract_wd_id(wd_entity)
        if type_check_func(str_id):
                new_entity = transform_func(str_id, wd_entity, languages)
                decoding.write_wd_entity_to_file(new_entity, output_file)
        else:
            raise ValueError(f"The entity does not match the desired type. ID = {str_id}")
    except:    
        logger.exception("There was an error during transformation.")
    
def __extract_entities(gzip_file_path: Path, output_file_name, transform_func, type_check_func, logger, logging_step, languages):
    with (gzip.open(gzip_file_path) as gzip_input_file,
          open(output_file_name, "wb") as output_file
        ):
            decoding.init_json_array_in_files([output_file])
            for wd_entity in decoding.entities_from_file(gzip_input_file, logger, logging_step):
                __process_wd_entity(wd_entity, output_file, transform_func, type_check_func, logger, languages)
            decoding.close_json_array_in_files([output_file])

@timed(classes_logger)
def __extract_classes(gzip_file_path: Path, languages):
    __extract_entities(gzip_file_path, CLASSES_OUTPUT_FILE_PATH, extract_wd_class, wd_entity_types.is_wd_entity_item, classes_logger, ul.CLASSES_PROGRESS_STEP, languages)

@timed(properties_logger)
def __extract_properties(gzip_file_path: Path, languages):
    __extract_entities(gzip_file_path, PROPERTIES_OUTPUT_FILE_PATH, extract_wd_property, wd_entity_types.is_wd_entity_property, properties_logger, ul.PROPERTIES_PROGRESS_STEP, languages)
    
@timed(main_logger)    
def main_extraction(phase: Phases, classes_gzip_file_path: Path, properties_gzip_file_path: Path):
    try:
        if phase in [Phases.BOTH, Phases.CLASSES]:
            __extract_classes(classes_gzip_file_path, DEFAULT_LANGUAGES)
        if phase in [Phases.BOTH, Phases.PROPERTIES]:
            __extract_properties(properties_gzip_file_path, DEFAULT_LANGUAGES)
        return True
    except Exception as e:
        main_logger.exception("There was an error that cannot be handled")
        main_logger.critical("Exiting phase...")
        return False
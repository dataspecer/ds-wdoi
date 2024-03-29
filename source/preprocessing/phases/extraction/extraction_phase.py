import gzip
import pathlib
import logging
import core.json_extractors.wd_fields as wd_fields_ex
import core.model_wikidata.entity_types as wd_entity_types
from phases.extraction.entity_extractors.wd_class import extract_wd_class
from phases.extraction.entity_extractors.wd_property import extract_wd_property
import core.utils.logging as ul
import core.utils.decoding as decoding
from core.utils.timer import timed

main_logger = logging.getLogger("extraction")
classes_logger = main_logger.getChild("p3_extract_classes")
properties_logger = main_logger.getChild("p3_extract_properties")

CLASSES_OUTPUT_FILE = "classes-ex.json"
PROPERTIES_OUTPUT_FILE = 'properties-ex.json'

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
    
def __extract_entities(gzip_file_path: pathlib.Path, output_file_name, transform_func, type_check_func, logger, logging_step, languages):
    with (gzip.open(gzip_file_path) as gzip_input_file,
          open(output_file_name, "wb") as output_file
        ):
            decoding.init_json_array_in_files([output_file])
            for wd_entity in decoding.entities_generator(gzip_input_file, logger, logging_step):
                __process_wd_entity(wd_entity, output_file, transform_func, type_check_func, logger, languages)
            decoding.close_json_array_in_files([output_file])

@timed(classes_logger)
def extract_classes(gzip_file_path: pathlib.Path, languages):
    __extract_entities(gzip_file_path, CLASSES_OUTPUT_FILE, extract_wd_class, wd_entity_types.is_wd_entity_item, classes_logger, ul.CLASSES_PROGRESS_STEP, languages)

@timed(properties_logger)
def extract_properties(gzip_file_path: pathlib.Path, languages):
    __extract_entities(gzip_file_path, PROPERTIES_OUTPUT_FILE, extract_wd_property, wd_entity_types.is_wd_entity_property, properties_logger, ul.PROPERTIES_PROGRESS_STEP, languages)
    
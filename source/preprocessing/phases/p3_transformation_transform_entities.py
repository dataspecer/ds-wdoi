import bz2
import pathlib
import logging
import wikidata.json_extractors.wd_fields as wd_fields_ex
import wikidata.model.entity_types as wd_entity_types
import utils.decoding as decoding
from wikidata.transformations.wd_class import transform_wd_class
from wikidata.transformations.wd_property import transform_wd_property

main_logger = logging.getLogger("transformation")

CLASSES_LOGGING_PROGRESS_STEP = 100_000
PROPERTIES_LOGGING_PROGRESS_STEP = 1_000
CLASSES_OUTPUT_FILE = "classes.json"
PROPERTIES_OUTPUT_FILE = 'properties.json'

def __log_progress_message(i):
    return f"Processed {i:,} entities"

def __log_progress(logger, i):
    logger.info(__log_progress_message(i))

def __try_log_progress(logger, step, i):
    if i % step == 0:
        __log_progress(logger, i)
        
def __process_wd_entity(wd_entity, output_file, transform_func, type_check_func, logger, languages):
    str_id = wd_fields_ex.extract_wd_id(wd_entity)
    if type_check_func(str_id):
            new_entity = transform_func(str_id, wd_entity, languages)
            decoding.write_wd_entity_to_file(new_entity, output_file)
    else:
        logger.error(f"The entity does not match the desired type. ID = {str_id}")
   
def __process_wd_entities(bz2_input_file, output_file, transform_func, type_check_func, logger, logging_step, languages):
    i = 0
    for binary_line in bz2_input_file:
        try:
            wd_entity = decoding.line_to_wd_entity(binary_line)
            if wd_entity != None:
                __process_wd_entity(wd_entity, output_file, transform_func, type_check_func, logger, languages)
        except Exception as e:
            logger.exception("There was an error during transformation of an entity.")
        i += 1
        __try_log_progress(logger, logging_step, i)
    __log_progress(logger, i)
    
def __transform_entities(bz2_file_path: pathlib.Path, output_file_name, transform_func, type_check_func, logger, logging_step, languages):
    with (bz2.BZ2File(bz2_file_path) as bz2_input_file,
          open(output_file_name, "wb") as output_file
        ):
            decoding.init_json_array_in_files([output_file])
            __process_wd_entities(bz2_input_file, output_file, transform_func, type_check_func, logger, logging_step, languages)
            decoding.close_json_array_in_files([output_file])

def transform_classes(bz2_file_path: pathlib.Path, languages):
    logger = main_logger.getChild("p3_transform_classes")
    __transform_entities(bz2_file_path, CLASSES_OUTPUT_FILE, transform_wd_class, wd_entity_types.is_wd_entity_item, logger, CLASSES_LOGGING_PROGRESS_STEP, languages)
    
def transform_properties(bz2_file_path: pathlib.Path, languages):
    logger = main_logger.getChild("p3_transform_properties")
    __transform_entities(bz2_file_path, PROPERTIES_OUTPUT_FILE, transform_wd_property, wd_entity_types.is_wd_entity_property, logger, PROPERTIES_LOGGING_PROGRESS_STEP, languages)
    
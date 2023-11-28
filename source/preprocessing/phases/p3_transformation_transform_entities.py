import bz2
import pathlib
import logging
import wikidata.json_extractors.wd_fields as wd_fields_ex
import wikidata.model.entity_types as wd_entity_types
import utils.decoding as decoding
from wikidata.transformations.wd_class import transform_wd_class
from wikidata.transformations.wd_property import transform_wd_property
import utils.logging as ul
from utils.timer import timed

main_logger = logging.getLogger("transformation")
classes_logger = main_logger.getChild("p3_transform_classes")
properties_logger = main_logger.getChild("p3_transform_properties")

CLASSES_OUTPUT_FILE = "classes-tran.json"
PROPERTIES_OUTPUT_FILE = 'properties-tran.json'

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
    
def __transform_entities(bz2_file_path: pathlib.Path, output_file_name, transform_func, type_check_func, logger, logging_step, languages):
    with (bz2.BZ2File(bz2_file_path) as bz2_input_file,
          open(output_file_name, "wb") as output_file
        ):
            decoding.init_json_array_in_files([output_file])
            for wd_entity in decoding.entities_generator(bz2_input_file, logger, logging_step):
                __process_wd_entity(wd_entity, output_file, transform_func, type_check_func, logger, languages)
            decoding.close_json_array_in_files([output_file])

@timed(classes_logger)
def transform_classes(bz2_file_path: pathlib.Path, languages):
    __transform_entities(bz2_file_path, CLASSES_OUTPUT_FILE, transform_wd_class, wd_entity_types.is_wd_entity_item, classes_logger, ul.CLASSES_PROGRESS_STEP, languages)

@timed(properties_logger)
def transform_properties(bz2_file_path: pathlib.Path, languages):
    __transform_entities(bz2_file_path, PROPERTIES_OUTPUT_FILE, transform_wd_property, wd_entity_types.is_wd_entity_property, properties_logger, ul.PROPERTIES_PROGRESS_STEP, languages)
    
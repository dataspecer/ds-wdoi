import bz2
import pathlib
import logging
import wikidata.json_extractors.wd_fields as wd_fields_ex
import wikidata.json_extractors.wd_statements as wd_statements_ex
import wikidata.transformations.wd_fields as wd_fields_tran
import wikidata.transformations.wd_languages as wd_languages_tran 
import wikidata.model.entity_types as wd_entity_types
from wikidata.model.properties import Datatypes as wd_property_datatypes
import utils.decoding as decoding

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
        
def __transform_wd_class(str_class_id, wd_class):
    num_id = wd_fields_ex.extract_wd_numeric_id_part(str_class_id)
    instance_of_num_ids = wd_fields_tran.transform_wd_str_ids_to_num_ids(wd_statements_ex.extract_wd_instance_of_values(wd_class)) 
    subclass_of_num_ids = wd_fields_tran.transform_wd_str_ids_to_num_ids(wd_statements_ex.extract_wd_subclass_of_values(wd_class))
    properties_for_this_type_num_ids = wd_fields_tran.transform_wd_str_ids_to_num_ids(wd_statements_ex.extract_wd_properties_for_this_type(wd_class))
    equivalent_class_urls = wd_statements_ex.extract_wd_equivalent_class(wd_class)
    labels = wd_languages_tran.transform_wd_language_map(wd_fields_ex.extract_wd_labels(wd_class))
    descriptions = wd_languages_tran.transform_wd_language_map(wd_fields_ex.extract_wd_descriptions(wd_class))
    
    return {
        "id": num_id,
        "instanceOf": instance_of_num_ids,
        "subclassOf": subclass_of_num_ids,
        "propertiesForThisType": properties_for_this_type_num_ids,
        "equivalentClass": equivalent_class_urls, 
        "labels": labels,
        "descriptions": descriptions
    }
    
def __transform_wd_property(str_property_id, wd_property):
    prop_datatype = wd_fields_ex.extract_wd_datatype(wd_property)
    
    num_id = wd_fields_ex.extract_wd_numeric_id_part(str_property_id)
    datatype = wd_property_datatypes.index_of(prop_datatype)
    underlying_type = wd_property_datatypes.type_of(prop_datatype)
    instance_of_num_ids = wd_fields_tran.transform_wd_str_ids_to_num_ids(wd_statements_ex.extract_wd_instance_of_values(wd_property)) 
    subproperty_of_num_ids = wd_fields_tran.transform_wd_str_ids_to_num_ids(wd_statements_ex.extract_wd_subproperty_of_values(wd_property))
    related_property_num_ids = wd_fields_tran.transform_wd_str_ids_to_num_ids(wd_statements_ex.extract_wd_related_property(wd_property))
    equivalent_property_urls = wd_statements_ex.extract_wd_equivalent_property(wd_property)
    labels = wd_languages_tran.transform_wd_language_map(wd_fields_ex.extract_wd_labels(wd_property))
    descriptions = wd_languages_tran.transform_wd_language_map(wd_fields_ex.extract_wd_descriptions(wd_property))
    
    return {
        "id": num_id,
        "datatype": datatype,
        "underlyingType": underlying_type,
        "instanceOf": instance_of_num_ids,
        "subpropertyOf": subproperty_of_num_ids,
        "relatedProperty": related_property_num_ids,
        "equivalentProperty": equivalent_property_urls,
        "labels": labels,
        "descriptions": descriptions
    }

def __process_wd_entity(wd_entity, output_file, transform_func, type_check_func, logger):
    str_id = wd_fields_ex.extract_wd_id(wd_entity)
    if type_check_func(str_id):
        new_entity = transform_func(str_id, wd_entity)
        decoding.write_wd_entity_to_file(new_entity, output_file)
    else:
        logger.error(f"The entity does not match the desired type. ID = {str_id}")
   
def __process_wd_entities(bz2_input_file, output_file, transform_func, type_check_func, logger, logging_step):
    i = 0
    for binary_line in bz2_input_file:
        try:
            wd_entity = decoding.line_to_wd_entity(binary_line)
            if wd_entity != None:
                __process_wd_entity(wd_entity, output_file, transform_func, type_check_func, logger)
        except Exception as e:
            logger.exception("There was an error during transformation of an entity.")
        i += 1
        __try_log_progress(logger, logging_step, i)
    __log_progress(logger, i)
    
def __transform_entities(bz2_file_path: pathlib.Path, output_file_name, transform_func, type_check_func, logger, logging_step):
    with (bz2.BZ2File(bz2_file_path) as bz2_input_file,
          open(output_file_name, "wb") as output_file
        ):
            decoding.init_json_array_in_files([output_file])
            __process_wd_entities(bz2_input_file, output_file, transform_func, type_check_func, logger, logging_step)
            decoding.close_json_array_in_files([output_file])

def transform_classes(bz2_file_path: pathlib.Path):
    logger = main_logger.getChild("p3_transform_classes")
    __transform_entities(bz2_file_path, CLASSES_OUTPUT_FILE, __transform_wd_class, wd_entity_types.is_wd_entity_item, logger, CLASSES_LOGGING_PROGRESS_STEP)
    
def transform_properties(bz2_file_path: pathlib.Path):
    logger = main_logger.getChild("p3_transform_properties")
    __transform_entities(bz2_file_path, PROPERTIES_OUTPUT_FILE, __transform_wd_property, wd_entity_types.is_wd_entity_property, logger, PROPERTIES_LOGGING_PROGRESS_STEP)
    
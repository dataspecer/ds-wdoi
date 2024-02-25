import bz2
import pathlib
import logging
import utils.counter as counter
import wikidata.json_extractors.wd_fields as wd_json_fields_ex
import wikidata.model.entity_types as wd_entity_types
import utils.decoding as decoding
import utils.logging as ul
from wikidata.model.entity_json_fields import RootFields
from wikidata.statistics.property_usage import PropertyUsageStatistics
from utils.timer import timed

logger = logging.getLogger("separation").getChild("p2_separate_to_files")

CLASSES_OUTPUT_FILE = "classes-test.json.bz2"
PROPERTIES_OUTPUT_FILE = "properties-test.json.bz2"

def __log_context_func(class_counter, property_counter, classes_set, properties_dict):
    def log_context_message():
        classes_counter_capture = class_counter
        properties_counter_capture = property_counter
        classes_set_capture = classes_set
        properties_dict_capture = properties_dict
        return f"Separated Classes: {classes_counter_capture.get_count():,} / {len(classes_set_capture):,} Properties: {properties_counter_capture.get_count():,} / {len(properties_dict_capture):,}"
    return log_context_message

def __log_sum_progress(class_counter, property_counter, classes_set, properties_dict):
    class_count = class_counter.get_count()
    property_count = property_counter.get_count()
    classes_set_count = len(classes_set)
    properties_dict_count = len(properties_dict)
    logger.info(f"Separated Classes: {class_count:,} Properties: {property_count:,} . The sum is {(class_count + property_count):,} from the set of {classes_set_count + properties_dict_count:,}")

# Sitelinks are not used in the ontology.
def __reduce_wd_entity(wd_entity):
    wd_entity[RootFields.SITELINKS] = None
    return wd_entity

def __process_wd_item(wd_entity, classes_output_file, class_counter):
    decoding.write_wd_entity_to_file(__reduce_wd_entity(wd_entity), classes_output_file)
    class_counter.inc()
    
def __process_wd_property(wd_entity, properties_output_file, property_counter):
    decoding.write_wd_entity_to_file(__reduce_wd_entity(wd_entity), properties_output_file)
    property_counter.inc()

def __process_wd_entity(wd_entity, classes_output_file, properties_output_file, class_counter, property_counter, wd_classes_ids_set: set, wd_properties_ids_dict: dict) -> None:
    try:
        str_entity_id = wd_json_fields_ex.extract_wd_id(wd_entity)
        if str_entity_id != None:
            if wd_entity_types.is_wd_entity_property(str_entity_id) and str_entity_id in wd_properties_ids_dict:
                __process_wd_property(wd_entity, properties_output_file, property_counter)
            elif wd_entity_types.is_wd_entity_item(str_entity_id) and str_entity_id in wd_classes_ids_set:
                __process_wd_item(wd_entity, classes_output_file, class_counter)
    except:
        logger.exception("There was an error during processing of an entity.")
        
    
def __separate_to_files(bz2_input_file, classes_output_file, properties_output_file, wd_classes_ids_set: set, wd_properties_ids_dict: dict, class_counter, property_counter, property_statistics: PropertyUsageStatistics):    
    for wd_entity in decoding.entities_generator(bz2_input_file, logger, ul.ENTITY_PROGRESS_STEP, __log_context_func(class_counter, property_counter, wd_classes_ids_set, wd_properties_ids_dict)):
        __process_wd_entity(wd_entity, classes_output_file, properties_output_file, class_counter, property_counter, wd_classes_ids_set, wd_properties_ids_dict) 
        property_statistics.process_entity(wd_entity)
    __log_sum_progress(class_counter, property_counter, wd_classes_ids_set, wd_properties_ids_dict)

@timed(logger)
def separate_to_files(bz2_dump_file_path: pathlib.Path, wd_classes_ids_set: set, wd_properties_ids_dict: dict, property_statistics: PropertyUsageStatistics):
    with (bz2.BZ2File(bz2_dump_file_path) as bz2_input_file,
          bz2.BZ2File(CLASSES_OUTPUT_FILE, "w") as classes_output_file,
          bz2.BZ2File(PROPERTIES_OUTPUT_FILE, "w") as properties_output_file
        ):
            class_counter = counter.Counter()
            property_counter = counter.Counter()
            decoding.init_json_array_in_files([classes_output_file, properties_output_file])
            __separate_to_files(bz2_input_file, classes_output_file, properties_output_file, wd_classes_ids_set, wd_properties_ids_dict, class_counter, property_counter, property_statistics)
            decoding.close_json_array_in_files([classes_output_file, properties_output_file])
                
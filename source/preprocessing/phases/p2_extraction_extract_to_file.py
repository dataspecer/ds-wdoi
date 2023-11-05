import bz2
import pathlib
import logging
import utils.counter as counter
import wikidata.json_extractors.wd_fields as wd_fields_ex
import wikidata.model.entity_types as wd_entity_types
import utils.decoding as decoding
from wikidata.model.entity_json_fields import RootFields
import utils.logging as ul
from utils.timer import timed

logger = logging.getLogger("extraction").getChild("p2_extract_to_file")

CLASSES_OUTPUT_FILE = "classes.json.bz2"
PROPERTIES_OUTPUT_FILE = "properties.json.bz2"

def __log_context_message(class_counter, property_counter):
    return f"Classes: {class_counter.get_count():,} Properties: {property_counter.get_count():,}"

def __log_sum_progress(class_counter, property_counter, set):
    class_count = class_counter.get_count()
    property_count = property_counter.get_count()
    set_count = len(set)
    logger.info(f"Found Classes: {class_count:,} Properties: {property_count:,} . The sum is {(class_count + property_count):,} from the set of {set_count:,}")

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

def __process_wd_entity(wd_entity, classes_output_file, properties_output_file, class_counter, property_counter, wd_entity_ids_set: set) -> None:
    str_entity_id = wd_fields_ex.extract_wd_id(wd_entity)
    if str_entity_id != None:
        if wd_entity_types.is_wd_entity_property(str_entity_id):
            __process_wd_property(wd_entity, properties_output_file, property_counter)
        elif wd_entity_types.is_wd_entity_item(str_entity_id) and str_entity_id in wd_entity_ids_set:
            __process_wd_item(wd_entity, classes_output_file, class_counter)
    
def __extract_to_file(bz2_input_file, classes_output_file, properties_output_file, wd_entity_ids_set: set, class_counter, property_counter):    
    i = 0
    for binary_line in bz2_input_file:
        try:
            wd_entity = decoding.line_to_wd_entity(binary_line)
            if wd_entity != None:
                __process_wd_entity(wd_entity, classes_output_file, properties_output_file, class_counter, property_counter, wd_entity_ids_set)
        except Exception as e:
            logger.exception("There was an error during extraction of an entity")
        i += 1
        ul.try_log_progress(logger, i, ul.ENTITY_PROGRESS_STEP, __log_context_message(class_counter, property_counter))
    ul.log_progress(logger, i, __log_context_message(class_counter, property_counter))
    __log_sum_progress(class_counter, property_counter, wd_entity_ids_set)


@timed(logger)
def extract_to_file(bz2_dump_file_path: pathlib.Path, wd_entity_ids_set: set):
    with (bz2.BZ2File(bz2_dump_file_path) as bz2_input_file,
          bz2.BZ2File(CLASSES_OUTPUT_FILE, "w") as classes_output_file,
          bz2.BZ2File(PROPERTIES_OUTPUT_FILE, "w") as properties_output_file
        ):
            class_counter = counter.Counter()
            property_counter = counter.Counter()
            decoding.init_json_array_in_files([classes_output_file, properties_output_file])
            __extract_to_file(bz2_input_file, classes_output_file, properties_output_file, wd_entity_ids_set, class_counter, property_counter)
            decoding.close_json_array_in_files([classes_output_file, properties_output_file])
                
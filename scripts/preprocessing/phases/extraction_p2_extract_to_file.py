import bz2
import pathlib
import logging
import utils.counter as counter
import wikidata.json_extractors.wd_fields as wd_fields_ex
import wikidata.json_extractors.wd_languages as wd_languages_ex
import wikidata.model.entity_types as wd_entity_types
import utils.decoding as decoding

logger = logging.getLogger("extraction").getChild("p2_extract_to_file")

CLASSES_OUTPUT_FILE = "classes.json.bz2"
PROPERTIES_OUTPUT_FILE = "properties.json.bz2"
LANGUAGES = ['en']
LOGGIN_PROGRESS_STEP = 100_000

def __log_progress_message(i, class_count, property_count):
    return f"Processed {i:,} entities. Classes: {class_count:,} Properties: {property_count:,}"

def __log_progress(i, class_count, property_count):
    logger.info(__log_progress_message(i, class_count, property_count))

def __try_log_progress(i, class_count, property_count):
    if i % LOGGIN_PROGRESS_STEP == 0:
        __log_progress(i, class_count, property_count)

# Sitelinks are not used in the ontology and remove all unwanted languages from wikidata language objects.
def __reduce_wd_entity(wd_entity):
    wd_entity['sitelinks'] = None
    wd_entity["aliases"] = wd_languages_ex.extract_languages_from_wd_language_field(wd_entity, "aliases", LANGUAGES)
    wd_entity["labels"] = wd_languages_ex.extract_languages_from_wd_language_field(wd_entity, "labels", LANGUAGES)
    wd_entity["descriptions"] = wd_languages_ex.extract_languages_from_wd_language_field(wd_entity, "descriptions", LANGUAGES)
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
        __try_log_progress(i, class_counter.get_count(), property_counter.get_count())
    __log_progress(i, class_counter.get_count(), property_counter.get_count())
    
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
                
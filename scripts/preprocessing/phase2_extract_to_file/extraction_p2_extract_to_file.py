import bz2
import pathlib
import logging
import utils.counter as counter
import wikidata.extractors.json_extractors as wd_extractors
import wikidata.model.entity_types as wd_entity_types
import utils.decoding as decoding

logger = logging.getLogger("extraction")

CLASSES_OUTPUT_FILE = "classes.json"
PROPERTIES_OUTPUT_FILE = "properties.json"
LANGUAGES = ['en']

def info_log_message(i, class_count, property_count):
    return f"P2 - Processed {i:,} entities. Classes: {class_count:,} Properties: {property_count:,} ."

def init_json_array_in_files(file_array) -> None:
    for f in file_array:
        f.write("[\n".encode())
        
def close_json_array_in_files(file_array) -> None:
    for f in file_array:
        f.write("]".encode())
        
# Sitelinks are not used in the ontology and remove all unwanted languages from wikidata language objects.
def reduce_entity(wd_entity):
    wd_entity['sitelinks'] = None
    wd_entity["aliases"] = wd_extractors.extract_selected_languages_from_field(wd_entity, "aliases", LANGUAGES)
    wd_entity["labels"] = wd_extractors.extract_selected_languages_from_field(wd_entity, "labels", LANGUAGES)
    wd_entity["descriptions"] = wd_extractors.extract_selected_languages_from_field(wd_entity, "descriptions", LANGUAGES)
    return wd_entity

def write_wd_entity_to_file(wd_entity, output_file):
    output_file.write(decoding.serialize_wd_entity_json(wd_entity))
    output_file.write(",\n".encode())

def process_wd_item(wd_entity, classes_output_file, class_counter):
    write_wd_entity_to_file(reduce_entity(wd_entity), classes_output_file)
    class_counter.inc()
    
def process_wd_property(wd_entity, properties_output_file, property_counter):
    write_wd_entity_to_file(reduce_entity(wd_entity), properties_output_file)
    property_counter.inc()

def process_wd_entity(wd_entity, classes_output_file, properties_output_file, class_counter, property_counter, idsSet: set) -> None:
    entity_id = wd_extractors.extract_id(wd_entity)
    if entity_id != None and entity_id in idsSet:
        if wd_entity_types.is_item(entity_id):
            process_wd_item(wd_entity, classes_output_file, class_counter)
        elif wd_entity_types.is_property(entity_id):
            process_wd_property(wd_entity, properties_output_file, property_counter)
        else:
            logger.warning(f"P2 - Found entity that is in idsSet but is not item or property. ID = {entity_id} .")
    
def extract_classes_properties(bz2_dump_file_path: pathlib.Path, idsSet: set):
    with (bz2.BZ2File(bz2_dump_file_path) as bz2_input_file,
          bz2.BZ2File(CLASSES_OUTPUT_FILE, "w") as classes_output_file,
          bz2.BZ2File(PROPERTIES_OUTPUT_FILE, "w") as properties_output_file
        ):
            class_counter = counter.Counter()
            property_counter = counter.Counter()
            init_json_array_in_files([classes_output_file, properties_output_file])
            i = 0
            for binary_line in bz2_input_file:
                if i % 100_000 == 0:
                    logger.info(info_log_message(i, class_counter.get_count(), property_counter.get_count()))
                
                try:
                    string_line = decoding.decode_binary_line(binary_line)
                    if not decoding.line_contains_json_object(string_line):
                        continue
                    wd_entity = decoding.load_wd_entity_json(string_line)
                    process_wd_entity(wd_entity, classes_output_file, properties_output_file, class_counter, property_counter, idsSet)
                except Exception as e:
                    logger.error(e)
                    logger.error("P2 - there was an error during extraction of entity.")
                
            logger.info("P2 - Finishing up:")
            close_json_array_in_files([classes_output_file, properties_output_file])
            logger.info(info_log_message(i, class_counter.get_count(), property_counter.get_count()))
                
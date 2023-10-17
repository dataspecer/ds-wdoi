import bz2
import pathlib
import logging
import utils.counter as counter
import wikidata.extractors.json_extractors as wd_extractors
import wikidata.model.entity_types as wd_entity_types
import utils.decoding as decoding

logger = logging.getLogger("extraction").getChild("p2_classes_properties")

CLASSES_OUTPUT_FILE = "classes2222.json.bz2"
PROPERTIES_OUTPUT_FILE = "properties2222.json.bz2"
LANGUAGES = ['en']

def __info_log_message(i, class_count, property_count):
    return f"Processed {i:,} entities. Classes: {class_count:,} Properties: {property_count:,}"

# Sitelinks are not used in the ontology and remove all unwanted languages from wikidata language objects.
def __reduce_entity(wd_entity):
    wd_entity['sitelinks'] = None
    wd_entity["aliases"] = wd_extractors.extract_languages_from_wd_language_field(wd_entity, "aliases", LANGUAGES)
    wd_entity["labels"] = wd_extractors.extract_languages_from_wd_language_field(wd_entity, "labels", LANGUAGES)
    wd_entity["descriptions"] = wd_extractors.extract_languages_from_wd_language_field(wd_entity, "descriptions", LANGUAGES)
    return wd_entity

def __process_wd_item(wd_entity, classes_output_file, class_counter):
    decoding.write_wd_entity_to_file(__reduce_entity(wd_entity), classes_output_file)
    class_counter.inc()
    
def __process_wd_property(wd_entity, properties_output_file, property_counter):
    decoding.write_wd_entity_to_file(__reduce_entity(wd_entity), properties_output_file)
    property_counter.inc()

def __process_wd_entity(wd_entity, classes_output_file, properties_output_file, class_counter, property_counter, ids_set: set) -> None:
    entity_id = wd_extractors.extract_wd_id(wd_entity)
    if entity_id != None:
        if wd_entity_types.is_wd_entity_property(entity_id):
            __process_wd_property(wd_entity, properties_output_file, property_counter)
        elif wd_entity_types.is_wd_entity_item(entity_id) and entity_id in ids_set:
                __process_wd_item(wd_entity, classes_output_file, class_counter)
    
def extract_classes_properties(bz2_dump_file_path: pathlib.Path, ids_set: set):
    with (bz2.BZ2File(bz2_dump_file_path) as bz2_input_file,
          bz2.BZ2File(CLASSES_OUTPUT_FILE, "w") as classes_output_file,
          bz2.BZ2File(PROPERTIES_OUTPUT_FILE, "w") as properties_output_file
        ):
            class_counter = counter.Counter()
            property_counter = counter.Counter()
            decoding.init_json_array_in_files([classes_output_file, properties_output_file])
            i = 0
            for binary_line in bz2_input_file:
                if i % 100_000 == 0:
                    logger.info(__info_log_message(i, class_counter.get_count(), property_counter.get_count()))
                
                i += 1
                
                if i == 10:
                    break
                
                try:
                    string_line = decoding.decode_binary_line(binary_line)
                    if not decoding.line_contains_json_object(string_line):
                        continue
                    wd_entity = decoding.load_wd_entity_json(string_line)
                    __process_wd_entity(wd_entity, classes_output_file, properties_output_file, class_counter, property_counter, ids_set)
                except Exception as e:
                    logger.exception("There was an error during extraction of an entity")
                
            logger.info("Finishing up:")
            decoding.close_json_array_in_files([classes_output_file, properties_output_file])
            logger.info(__info_log_message(i, class_counter.get_count(), property_counter.get_count()))
                
import bz2
import pathlib
import logging
import wikidata.extractors.json_extractors as wd_extractors
import wikidata.model.entity_types as wd_entity_types
import utils.decoding as decoding

logger = logging.getLogger("transformation").getChild("p1_transform_classes")

CLASSES_OUTPUT_FILE = "classes.json"

def __info_log_message(i):
    return f"Processed {i:,} classes"

def __transform_wd_language_map(wd_language_object):
    lang_map = {}
    for key, value in wd_language_object.items():
        lang_map[key] = value['value']
    return lang_map

def __transform_class(str_class_id, wd_class):
    num_id = wd_extractors.extract_wd_numeric_id_part(str_class_id)
    instance_of_num_ids = list(map(wd_extractors.extract_wd_numeric_id_part, wd_extractors.extract_wd_instance_of_values(wd_class))) 
    subclass_of_num_ids = list(map(wd_extractors.extract_wd_numeric_id_part, wd_extractors.extract_wd_subclass_of_values(wd_class)))
    labels = __transform_wd_language_map(wd_extractors.extract_wd_labels(wd_class))
    descriptions = __transform_wd_language_map(wd_extractors.extract_wd_descriptions(wd_class))
    
    return {
        "id": num_id,
        "instance_of": instance_of_num_ids,
        "subclass_of": subclass_of_num_ids,
        "labels": labels,
        "descriptions": descriptions
    }

def __process_wd_class(wd_class, classes_output_file):
    str_class_id = wd_extractors.extract_wd_id(wd_class)
    if wd_entity_types.is_wd_entity_item(str_class_id):
        new_class = __transform_class(str_class_id, wd_class)
        decoding.write_wd_entity_to_file(new_class, classes_output_file)
    else:
        logger.error(f"There was a class that is not an wikidata item. ID = {str_class_id}")
        
def transform_classes(bz2_classes_file_path: pathlib.Path) -> set:
    with (bz2.BZ2File(bz2_classes_file_path) as bz2_input_file,
          open(CLASSES_OUTPUT_FILE, "wb") as classes_output_file
        ):
            i = 0
            decoding.init_json_array_in_files([classes_output_file])
            for binary_line in bz2_input_file:
                try:
                    string_line = decoding.decode_binary_line(binary_line)
                    if not decoding.line_contains_json_object(string_line):
                        continue
                    wd_entity = decoding.load_wd_entity_json(string_line)
                    __process_wd_class(wd_entity, classes_output_file)
                except Exception as e:
                   logger.exception("There was an error during transformation of an class.")
                i += 1
                
                if i % 100_000 == 0:
                    logger.info(__info_log_message(i))
                
            logger.info("Finishing up:")
            decoding.close_json_array_in_files([classes_output_file])
            logger.info(__info_log_message(i))
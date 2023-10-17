import bz2
import pathlib
import logging
import wikidata.extractors.json_extractors as wd_extractors
import wikidata.model.entity_types as wd_entity_types
import utils.decoding as decoding

WD_PARENT_CLASS_ID = "Q16889133"

logger = logging.getLogger("extraction").getChild("p1_class_ids")

def __info_log_message(i, ids_count):
    return f"Processed {i:,} entities and found {ids_count}"

def __is_wd_entity_class(wd_entity, instance_of_ids) -> bool:
    if wd_extractors.contains_wd_subclass_of_statement(wd_entity) or WD_PARENT_CLASS_ID in instance_of_ids:
        return True
    else:
        return False

def __process_wd_entity(wd_entity, ids_set: set):
    entity_id = wd_extractors.extract_wd_id(wd_entity)
    if wd_entity_types.is_wd_entity_item_or_property(entity_id):
        instance_of_ids = wd_extractors.extract_wd_instance_of_values(wd_entity)
        subclass_of_ids = wd_extractors.extract_wd_subclass_of_values(wd_entity)                         
        
        if __is_wd_entity_class(wd_entity, instance_of_ids) or wd_entity_types.is_wd_entity_property(entity_id):
            ids_set.add(entity_id)
        
        for id in instance_of_ids:
            ids_set.add(id)
        for id in subclass_of_ids:
            ids_set.add(id)   

def extract_ids(bz2_dump_file_path: pathlib.Path) -> set:
    ids_set = set()
    with (bz2.BZ2File(bz2_dump_file_path) as bz2_input_file):
            i = 0
            for binary_line in bz2_input_file:
                if i % 100_000 == 0:
                    logger.info(__info_log_message(i, len(ids_set)))

                i += 1
                
                try:
                    string_line = decoding.decode_binary_line(binary_line)
                    if not decoding.line_contains_json_object(string_line):
                        continue
                    wd_entity = decoding.load_wd_entity_json(string_line)
                    __process_wd_entity(wd_entity, ids_set)
                except Exception as e:
                    logger.exception("There was an error during extraction of an entity")
                
            logger.info("Finishing up:")
            logger.info(__info_log_message(i, len(ids_set)))
            return ids_set
                
    
    
    
    
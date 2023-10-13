import bz2
import pathlib
import logging
import wikidata.extractors.json_extractors as wd_extractors
import wikidata.model.entity_types as wd_entity_types
import utils.decoding as decoding

WD_PARENT_CLASS_ID = "Q16889133"

logger = logging.getLogger("extraction")

def info_log_message(i, ids_count):
    return f"P1 - Processed {i:,} entities and found {ids_count} ."
    
def is_entity_class(instance_of_ids, subclass_of_ids) -> bool:
    if WD_PARENT_CLASS_ID in instance_of_ids or len(subclass_of_ids) != 0:
        return True
    else:
        return False

def process_wd_entity(wd_entity, idsSet: set):
    entity_id = wd_extractors.extract_id(wd_entity)
    if wd_entity_types.is_item_or_property(entity_id):
        instance_of_ids = wd_extractors.extract_instance_of_ids(wd_entity)
        subclass_of_ids = wd_extractors.extract_subclass_of_ids(wd_entity)                         
        
        if is_entity_class(instance_of_ids, subclass_of_ids) or wd_entity_types.is_property(entity_id):
            idsSet.add(entity_id)
        
        for id in instance_of_ids:
            idsSet.add(id)
        for id in subclass_of_ids:
            idsSet.add(id)   

def extract_ids(bz2_dump_file_path: pathlib.Path) -> set:
    idsSet = set()
    with (bz2.BZ2File(bz2_dump_file_path) as bz2_input_file):
            i = 0
            for binary_line in bz2_input_file:
                if i % 100_000 == 0:
                    logger.info(info_log_message(i, len(idsSet)))
                
                try:
                    string_line = decoding.decode_binary_line(binary_line)
                    if not decoding.line_contains_json_object(string_line):
                        continue
                    wd_entity = decoding.load_wd_entity_json(string_line)
                    process_wd_entity(wd_entity, idsSet)
                except Exception as e:
                    logger.error(e)
                    logger.error("P1 - there was an error during extraction of entity.")
                
            logger.info("P1 - Finishing up:")
            logger.info(info_log_message(i, len(idsSet)))
            return idsSet
                
    
    
    
    
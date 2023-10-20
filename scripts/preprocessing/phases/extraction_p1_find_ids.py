import bz2
import pathlib
import logging
import wikidata.json_extractors.wd_fields as wd_fields_ex
import wikidata.json_extractors.wd_statements as wd_statements_ex
import wikidata.model.entity_types as wd_entity_types
import utils.decoding as decoding

WD_PARENT_CLASS_ID = "Q16889133"

logger = logging.getLogger("extraction").getChild("p1_find_ids")

def __info_log_message(i, ids_count):
    return f"Processed {i:,} entities and found {ids_count}"

def __is_wd_entity_class(wd_entity, instance_of_ids) -> bool:
    if wd_statements_ex.contains_wd_subclass_of_statement(wd_entity) or WD_PARENT_CLASS_ID in instance_of_ids:
        return True
    else:
        return False

def mark_for_extraction(wd_entity_ids_set: set, values):
    for value in values:
        wd_entity_ids_set.add(value)
        
def is_wd_entity_for_extration(wd_entity, entity_id, instance_of_ids):
    if __is_wd_entity_class(wd_entity, instance_of_ids) or wd_entity_types.is_wd_entity_property(entity_id):
        return True
    else:
        return False
        
def __process_wd_entity(wd_entity, wd_entity_ids_set: set):
    str_entity_id = wd_fields_ex.extract_wd_id(wd_entity)
    if wd_entity_types.is_wd_entity_item_or_property(str_entity_id):
        instance_of_ids = wd_statements_ex.extract_wd_instance_of_values(wd_entity)
        subclass_of_ids = wd_statements_ex.extract_wd_subclass_of_values(wd_entity)                         
        
        mark_for_extraction(wd_entity_ids_set, instance_of_ids)
        mark_for_extraction(wd_entity_ids_set, subclass_of_ids)
        
        if is_wd_entity_for_extration(wd_entity, str_entity_id, instance_of_ids):
            mark_for_extraction(wd_entity_ids_set, [str_entity_id])
        

def extract_ids(bz2_dump_file_path: pathlib.Path) -> set:
    wd_entity_ids_set = set()
    with (bz2.BZ2File(bz2_dump_file_path) as bz2_input_file):
            i = 0
            for binary_line in bz2_input_file:
                try:
                    wd_entity = decoding.line_to_wd_entity(binary_line)
                    if wd_entity != None:
                        __process_wd_entity(wd_entity, wd_entity_ids_set)
                except Exception as e:
                    logger.exception("There was an error during extraction of an entity")
                i += 1
                if i % 100_000 == 0:
                    logger.info(__info_log_message(i, len(wd_entity_ids_set)))
            logger.info("Finishing up:")
            logger.info(__info_log_message(i, len(wd_entity_ids_set)))
            return wd_entity_ids_set
                
    
    
    
    
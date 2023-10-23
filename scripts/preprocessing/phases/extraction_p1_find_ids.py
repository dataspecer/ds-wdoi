import bz2
import pathlib
import logging
import wikidata.json_extractors.wd_fields as wd_fields_ex
import wikidata.json_extractors.wd_statements as wd_stmts_ex
import wikidata.model.entity_types as wd_entity_types
from wikidata.model.properties import Properties
import utils.decoding as decoding

logger = logging.getLogger("extraction").getChild("p1_find_ids")

WD_PARENT_CLASS_ID = "Q16889133"
LOGGIN_PROGRESS_STEP = 100_000

def __log_progress_message(i, ids_count):
    return f"Processed {i:,} entities and found {ids_count}"

def __log_progress(i, ids_count):
    logger.info(__log_progress_message(i, ids_count))

def __try_log_progress(i, ids_count):
    if i % LOGGIN_PROGRESS_STEP == 0:
        __log_progress(i, ids_count)

def __is_wd_entity_class(wd_entity, instance_of_ids) -> bool:
    if wd_stmts_ex.contains_wd_subclass_of_statement(wd_entity) or WD_PARENT_CLASS_ID in instance_of_ids:
        return True
    else:
        return False

def __mark_for_extraction(wd_entity_ids_set: set, values):
    for value in values:
        wd_entity_ids_set.add(value)
        
def __is_wd_entity_for_extration(wd_entity, entity_id, instance_of_ids):
    if __is_wd_entity_class(wd_entity, instance_of_ids) or wd_entity_types.is_wd_entity_property(entity_id):
        return True
    else:
        return False
        
def __process_wd_entity(wd_entity, wd_entity_ids_set: set):
    str_entity_id = wd_fields_ex.extract_wd_id(wd_entity)
    if wd_entity_types.is_wd_entity_item_or_property(str_entity_id):
        instance_of_ids = wd_stmts_ex.extract_wd_statement_values(wd_entity, Properties.INSTANCE_OF)
        subclass_of_ids = wd_stmts_ex.extract_wd_statement_values(wd_entity, Properties.SUBCLASS_OF)                         
        
        __mark_for_extraction(wd_entity_ids_set, instance_of_ids)
        __mark_for_extraction(wd_entity_ids_set, subclass_of_ids)
        
        if __is_wd_entity_for_extration(wd_entity, str_entity_id, instance_of_ids):
            __mark_for_extraction(wd_entity_ids_set, [str_entity_id])
        
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
            __try_log_progress(i, len(wd_entity_ids_set))
        __log_progress(i, len(wd_entity_ids_set))
        return wd_entity_ids_set
                
    
    
    
    
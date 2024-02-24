import bz2
import pathlib
import logging
import wikidata.json_extractors.wd_fields as wd_json_fields_ex
import wikidata.json_extractors.wd_statements as wd_json_stmts_ex
import wikidata.model.entity_types as wd_entity_types
from wikidata.model.properties import Properties
import utils.decoding as decoding
import utils.logging as ul
from utils.timer import timed

logger = logging.getLogger("identification").getChild("p1_identify_classes_properties")

WD_PARENT_CLASS_ID = "Q16889133"

def __log_context_func(set):
    def log_context_message():
        capture_set = set
        return f"Found {len(capture_set):,}"
    return log_context_message

def __is_wd_entity_class(wd_entity, instance_of_ids) -> bool:
    if wd_json_stmts_ex.contains_wd_subclass_of_statement(wd_entity) or WD_PARENT_CLASS_ID in instance_of_ids:
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
    try:
        str_entity_id = wd_json_fields_ex.extract_wd_id(wd_entity)
        if wd_entity_types.is_wd_entity_item_or_property(str_entity_id):
            instance_of_ids = wd_json_stmts_ex.extract_wd_statement_values(wd_entity, Properties.INSTANCE_OF)
            subclass_of_ids = wd_json_stmts_ex.extract_wd_statement_values(wd_entity, Properties.SUBCLASS_OF)                         
            
            __mark_for_extraction(wd_entity_ids_set, instance_of_ids)
            __mark_for_extraction(wd_entity_ids_set, subclass_of_ids)
            
            if __is_wd_entity_for_extration(wd_entity, str_entity_id, instance_of_ids):
                __mark_for_extraction(wd_entity_ids_set, [str_entity_id])
    except:
        logger.exception("There was an error during processing of the entity.")
    
@timed(logger)
def identify_classes_properties(bz2_dump_file_path: pathlib.Path) -> set:
    wd_entity_ids_set = set()
    with (bz2.BZ2File(bz2_dump_file_path) as bz2_input_file):
        for wd_entity in decoding.entities_generator(bz2_input_file, logger, ul.ENTITY_PROGRESS_STEP, __log_context_func(wd_entity_ids_set)):
            __process_wd_entity(wd_entity, wd_entity_ids_set)
        return wd_entity_ids_set
    
    
    
    
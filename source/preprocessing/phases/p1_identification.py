import gzip
import pathlib
import logging
import wikidata.json_extractors.wd_fields as wd_json_fields_ex
import wikidata.json_extractors.wd_statements as wd_json_stmts_ex
import wikidata.model.entity_types as wd_entity_types
from wikidata.model.properties import Properties
from wikidata.model.properties import is_allowed_property_datatype
from wikidata.model.properties import is_allowed_property
from wikidata.statistics.property_usage import PropertyUsageStatistics
import utils.decoding as decoding
import utils.logging as ul
from utils.timer import timed

logger = logging.getLogger("identification-separation").getChild("p1_identify_classes_properties")

WD_PARENT_CLASS_ID = "Q16889133"

def __log_context_func(classes_set, properties_dict):
    def log_context_message():
        capture_classes_set = classes_set
        capture_properties_dict = properties_dict 
        return f"Found {len(capture_classes_set):,} classes and {len(capture_properties_dict):,} properties"
    return log_context_message

def __is_wd_entity_class_for_separation(wd_entity, instance_of_ids) -> bool:
    if wd_json_stmts_ex.contains_wd_subclass_of_statement(wd_entity) or WD_PARENT_CLASS_ID in instance_of_ids:
        return True
    else:
        return False
    
def __is_wd_entity_property_for_separation(wd_entity, str_entity_id: str) -> bool:
    if wd_entity_types.is_wd_entity_property(str_entity_id) and is_allowed_property(str_entity_id):
        prop_datatype = wd_json_fields_ex.extract_wd_datatype(wd_entity)
        if is_allowed_property_datatype(prop_datatype):
            return True
    return False

def __mark_classes_for_separation(wd_classes_ids_set: set, str_classes_ids):
    for str_class_id in str_classes_ids:
        wd_classes_ids_set.add(str_class_id)
        
def __mark_property_for_separation(wd_properties_ids_dict: set, str_property_id, prop_datatype):
    if str_property_id not in wd_properties_ids_dict:
        wd_properties_ids_dict[str_property_id] = prop_datatype
        
def __process_wd_entity(wd_entity, wd_classes_ids_set: set, wd_properties_ids_dict: dict):
    try:
        str_entity_id = wd_json_fields_ex.extract_wd_id(wd_entity)
        if wd_entity_types.is_wd_entity_item_or_property(str_entity_id):
            instance_of_ids = wd_json_stmts_ex.extract_wd_statement_values(wd_entity, Properties.INSTANCE_OF)
            subclass_of_ids = wd_json_stmts_ex.extract_wd_statement_values(wd_entity, Properties.SUBCLASS_OF)                         
            
            __mark_classes_for_separation(wd_classes_ids_set, instance_of_ids)
            __mark_classes_for_separation(wd_classes_ids_set, subclass_of_ids)
            
            if __is_wd_entity_class_for_separation(wd_entity, instance_of_ids):
                __mark_classes_for_separation(wd_classes_ids_set, [str_entity_id])
            elif __is_wd_entity_property_for_separation(wd_entity, str_entity_id):
                prop_datatype = wd_json_fields_ex.extract_wd_datatype(wd_entity)
                __mark_property_for_separation(wd_properties_ids_dict, str_entity_id, prop_datatype)
    except:
        logger.exception("There was an error during processing of the entity.")
    
@timed(logger)
def identify_classes_properties(gzip_dump_file_path: pathlib.Path, property_statistics: PropertyUsageStatistics):
    wd_classes_ids_set = set()
    wd_properties_ids_dict = dict()
    with (gzip.open(gzip_dump_file_path) as gzip_input_file):
        for wd_entity in decoding.entities_generator(gzip_input_file, logger, ul.ENTITY_PROGRESS_STEP, __log_context_func(wd_classes_ids_set, wd_properties_ids_dict)):
            __process_wd_entity(wd_entity, wd_classes_ids_set, wd_properties_ids_dict)
            property_statistics.process_entity(wd_entity)
        return wd_classes_ids_set, wd_properties_ids_dict
    
    
    
    
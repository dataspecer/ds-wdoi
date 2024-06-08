import sys
from enum import StrEnum
import core.utils.logging as ul
from core.utils.timer import timed
import phases.download.download_phase as download
import phases.identification_separation.identification_separation_phase as id_sep
import phases.identification_separation.separation as sep
import phases.extraction.extraction_phase as ext
import phases.modification.modification_phase as mod
import core.statistics.property_usage as property_usage
import phases.property_recommendations.property_recommendations_phase as recs
import phases.restart_service as restart
import phases.experimental_search_engine_data_preparation.search_engine_data_preparation_phase as prep
import phases.experimental_search_engine_data_preparation.phase_parts.vectorize.vectorize_part as prep_vectorize
import phases.experimental_search_engine_data_preparation.phase_parts.expand_to_language_fields.expand_to_language_fields_part as prep_expand
import phases.experimental_search_engine_loading.search_engine_loading_phase as load

main_logger = ul.root_logger.getChild("run_all")

class Phases(StrEnum):
    ID_SEP = "id_sep"
    EXT = "ext"
    MOD = "mod"
    RECS = "recs"
    PREP = "prep"
    LOAD = "load"
    ALL = "all"

def throw_on_fail(success):
    if not success:
        raise Exception("A phase failed")

@timed(main_logger)    
def main_run_all(download_dump: bool, continue_from: Phases, exclude_load: bool, restart_services: bool):
    try:
        # Download
        if continue_from in [Phases.ALL] and download_dump:
            throw_on_fail(download.main_download())
            continue_from = Phases.ALL

        # Identification and separation
        if continue_from in [Phases.ALL, Phases.ID_SEP]: 
            throw_on_fail(id_sep.main_identification_separation(download.DUMP_OUTPUT_FILE_PATH))
            continue_from = Phases.ALL
            
        # Extraction
        if continue_from in [Phases.ALL, Phases.EXT]: 
            throw_on_fail(ext.main_extraction(ext.Phases.BOTH, sep.CLASSES_OUTPUT_FILE_PATH, sep.PROPERTIES_OUTPUT_FILE_PATH))
            continue_from = Phases.ALL
        
        # Modification
        if continue_from in [Phases.ALL, Phases.MOD]:
            throw_on_fail(mod.main_modification(ext.CLASSES_OUTPUT_FILE_PATH, ext.PROPERTIES_OUTPUT_FILE_PATH, property_usage.CLASSES_STATS_OUTPUT_FILE_PATH, property_usage.PROPERTIES_STATS_OUTPUT_FILE_PATH))
            continue_from = Phases.ALL
        
        # Recommendations of properties
        if continue_from in [Phases.ALL, Phases.RECS]:
            throw_on_fail(recs.main_property_recommendations(mod.CLASSES_OUTPUT_FILE_PATH, mod.PROPERTIES_OUTPUT_FILE_PATH))
            continue_from = Phases.ALL
        
        if continue_from in [Phases.ALL, Phases.PREP]:
            throw_on_fail(prep.main_search_engine_data_preparation(prep.Phases.ALL, recs.CLASSES_OUTPUT_FILE_PATH, recs.PROPERTIES_OUTPUT_FILE_PATH, download.DUMP_OUTPUT_FILE_PATH))
            continue_from = Phases.ALL
        
        if continue_from in [Phases.ALL, Phases.LOAD] and not exclude_load:
            throw_on_fail(load.main_search_engine_loading(load.Phases.BOTH, prep_vectorize.CLASSE_OUTPUT_FILE_PATH, prep_vectorize.PROPERTIES_OUTPUT_FILE_PATH, prep_expand.CLASSES_OUTPUT_FILE_PATH))
        
        if restart_services:
            throw_on_fail(restart.main_restart_api_service())
            throw_on_fail(restart.main_restart_search_service())
        
    except Exception as e:
        main_logger.exception("There was an error that cannot be handled")
        main_logger.critical("Exiting phase...")
        sys.exit(1)
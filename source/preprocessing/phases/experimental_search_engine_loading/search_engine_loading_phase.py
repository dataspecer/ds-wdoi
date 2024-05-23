from pathlib import Path
from enum import StrEnum
from core.utils.timer import timed
import core.utils.decoding as decoding
import core.utils.logging as ul
from phases.experimental_search_engine_loading.main_logger import main_logger
from phases.experimental_search_engine_loading.qdrant.qdrant_loading import load_to_qdrant

class Phases(StrEnum):
    BOTH = "both"
    QDRANT = "qdrant"
    ELASTIC = "elastic"

@timed(main_logger)
def main_search_engine_loading(phase: Phases, classes_json_file_path: Path, properties_json_file_path: Path) -> bool:
    try:
        if phase in [Phases.BOTH, Phases.QDRANT]:
            load_to_qdrant(classes_json_file_path, properties_json_file_path)
            
        if phase in [Phases.BOTH, Phases.ELASTIC]:
            pass
            
        return True
    except Exception as e:
        main_logger.exception("There was an error that cannot be handled")
        main_logger.critical("Exiting phase...")
        return False
from phases.experimental_search_engine_data_preparation.main_logger import main_logger
from core.utils.timer import timed
from phases.experimental_search_engine_data_preparation.data_entities.data_class import DataClassFields
from phases.experimental_search_engine_data_preparation.data_entities.data_property import DataPropertyFields
import core.utils.logging as ul
from pathlib import Path
from core.output_directory import OUTPUT_DIR_PATH
import core.utils.decoding as decoding

logger = main_logger.getChild("minimize")

CLASSE_OUTPUT_FILE_PATH = OUTPUT_DIR_PATH / "classes-experimental-prep-5-minimize.json" 
PROPERTIES_OUTPUT_FILE_PATH = OUTPUT_DIR_PATH / "properties-experimental-prep-5-minimize.json" 

@timed(logger)
def __minimize_entities(entities_json_file_path: Path, entities_json_output_path: Path, minimize_func):
    with (open(entities_json_file_path, "rb") as input_file,
          open(entities_json_output_path, "wb") as output_file
        ):
        decoding.init_json_array_in_files([output_file])
        for wd_entity in decoding.entities_from_file(input_file, logger, ul.HUNDRED_K_PROGRESS_STEP):
            minimized_entity = minimize_func(wd_entity)
            decoding.write_wd_entity_to_file(minimized_entity, output_file)
        decoding.close_json_array_in_files([output_file])

def __minimize_property(wd_property):
    del wd_property[DataPropertyFields.SPARSE_VECTOR.value]
    del wd_property[DataPropertyFields.DENSE_VECTOR.value]
    del wd_property[DataPropertyFields.ALIASES.value]
    del wd_property[DataPropertyFields.DESCRIPTIONS.value]
    del wd_property[DataPropertyFields.LABELS.value]
    return wd_property

def __minimize_class(wd_class):
    del wd_class[DataClassFields.SPARSE_VECTOR.value]
    del wd_class[DataClassFields.DENSE_VECTOR.value]
    del wd_class[DataClassFields.ALIASES.value]
    del wd_class[DataClassFields.DESCRIPTIONS.value]
    del wd_class[DataClassFields.LABELS.value]
    return wd_class

@timed(logger)
def minimize_for_search_service(classes_json_file_path: Path, properties_json_file_path: Path):
    __minimize_entities(classes_json_file_path, CLASSE_OUTPUT_FILE_PATH, __minimize_class)
    __minimize_entities(properties_json_file_path, PROPERTIES_OUTPUT_FILE_PATH, __minimize_property)
import core.utils.decoding as decoding
import core.utils.logging as ul
from core.utils.timer import timed
from phases.experimental_search_engine_data_preparation.data_entities.data_property import DataPropertyFields
from summaries.summaries import main_logger
import pathlib

logger = main_logger.getChild("classes_number_of_instances")

OUTPUT_FILE = "classes_defining_property_count.json"

@timed(logger)
def main_classes_defining_property_count(property_json_file_path: pathlib.Path):
    with open(property_json_file_path, "rb") as property_input_file:
        results = []
        for prop in decoding.entities_from_file(property_input_file, logger, ul.PROPERTIES_PROGRESS_STEP):
            number_of_classes = len(prop[DataPropertyFields.CLASSES_DEFINING_USAGE.value])
            results.append({
                "n": number_of_classes,
                "id": prop[DataPropertyFields.ID.value],
                "name": prop[DataPropertyFields.LABELS.value]['en'],
            })
        
        results.sort(reverse=True, key=lambda x: x["n"])
        with open(OUTPUT_FILE, "wb") as o:
            decoding.init_json_array_in_files([o])
            for stat in results:
                decoding.write_wd_entity_to_file(stat, o)
            decoding.close_json_array_in_files([o])
            
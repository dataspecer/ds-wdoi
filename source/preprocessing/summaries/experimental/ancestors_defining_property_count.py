import core.utils.decoding as decoding
import core.utils.logging as ul
from core.utils.timer import timed
from phases.experimental_search_engine_data_preparation.data_entities.data_class import DataClassFields
from summaries.summaries import main_logger
import pathlib

logger = main_logger.getChild("ancestors_defining_property_count")

OUTPUT_FILE = "ancestors_defining_property_count.json"

@timed(logger)
def main_ancestors_defining_property_count(classes_json_file_path: pathlib.Path):
    with open(classes_json_file_path, "rb") as classes_input_file:
        results = []
        for cls in decoding.entities_from_file(classes_input_file, logger, ul.CLASSES_PROGRESS_STEP):
            number_of_classes = len(cls[DataClassFields.ANCESTORS_DEFINING_PROPERTIES.value])
            results.append({
                "n": number_of_classes,
                "id": cls[DataClassFields.ID.value],
                "name": cls[DataClassFields.LABELS.value]['en'],
            })
        
        results.sort(reverse=True, key=lambda x: x["n"])
        with open(OUTPUT_FILE, "wb") as o:
            for stat in results:
                decoding.write_wd_entity_to_file(stat, o)
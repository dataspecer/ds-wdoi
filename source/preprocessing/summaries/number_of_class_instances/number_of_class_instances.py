import core.utils.decoding as decoding
import core.utils.logging as ul
from core.utils.timer import timed
from core.model_simplified.classes import ClassFields
from summaries.summaries import main_logger
import pathlib

logger = main_logger.getChild("number_of_class_instances")

OUTPUT_FILE = "number_of_class_instances.json"

@timed(logger)
def main_number_of_class_instances(classes_json_file_path: pathlib.Path):
    with open(classes_json_file_path, "rb") as classes_input_file:
        results = []
        for cls in decoding.entities_from_file(classes_input_file, logger, ul.CLASSES_PROGRESS_STEP):
            num_instances = len(cls[ClassFields.INSTANCES.value])
            if num_instances != 0:
                results.append({
                    "n": num_instances,
                    "id": cls[ClassFields.ID.value],
                    "name": cls[ClassFields.LABELS.value]['en'],
                })
        
        results.sort(reverse=True, key=lambda x: x["n"])
        with open(OUTPUT_FILE, "wb") as o:
            decoding.init_json_array_in_files([o])
            for stat in results:
                decoding.write_wd_entity_to_file(stat, o)
            decoding.close_json_array_in_files([o])
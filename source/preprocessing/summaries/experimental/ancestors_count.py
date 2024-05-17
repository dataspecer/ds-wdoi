import pathlib
from collections import deque
from core.model_simplified.classes import ClassFields
import core.utils.logging as ul
import core.utils.decoding as decoding
from phases.experimental_search_engine_data_preparation.data_entities.data_class import DataClassFields
from summaries.summaries import main_logger
from core.utils.timer import timed

logger = main_logger.getChild("ancestors_count")

OUTPUT_FILE = "ancestors_count.json"

@timed(logger)
def __load_classes_to_dict(json_file_path: pathlib.Path) -> dict:
    return decoding.load_entities_to_dict(json_file_path, logger, ul.CLASSES_PROGRESS_STEP)

def __ancestors_of(id, cls, classes_dict: dict):
    visited_ids = set()
    queue = deque()
    
    visited_ids.add(id)
    queue.append(cls[ClassFields.SUBCLASS_OF.value])
    
    while (len(queue) != 0):
        next_ids = queue.popleft()
        for next_class_id in next_ids:
            if next_class_id not in visited_ids:
                visited_ids.add(next_class_id)
                next_cls = classes_dict[next_class_id]
                queue.append(next_cls[ClassFields.SUBCLASS_OF.value])
                yield next_cls
    
@timed(logger)
def main_ancestors_count(classes_json_file_path: pathlib.Path):
    classes_dict = __load_classes_to_dict(classes_json_file_path)
    with open(OUTPUT_FILE, "wb") as output_file:
        results = []
        for i, [id, cls] in enumerate(classes_dict.items()):
            count = 0
            for _ in __ancestors_of(id, cls, classes_dict):
                count += 1
            results.append({
                "n": count,
                "id": cls[DataClassFields.ID.value],
                "name": cls[DataClassFields.LABELS.value]['en'],
            })
            ul.try_log_progress(logger, i, ul.CLASSES_PROGRESS_STEP)
        
        results.sort(reverse=True, key=lambda x: x["n"])
        for result in results:
            decoding.write_wd_entity_to_file(result, output_file)
                    
        
        
    
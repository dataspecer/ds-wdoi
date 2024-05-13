import pathlib
from collections import deque
from core.model_simplified.classes import ClassFields
import core.utils.logging as ul
import core.utils.decoding as decoding
from summaries.summaries import main_logger
from core.utils.timer import timed

logger = main_logger.getChild("all_properties_for_classes")

OUTPUT_FILE_ALL = "subclassing_properties_per_class.json"
OUTPUT_FILE_COUNT_ONLY = "subclassing_properties_per_class_counts.json"

@timed(logger)
def __load_classes_to_dict(json_file_path: pathlib.Path) -> dict:
    return decoding.load_entities_to_dict(json_file_path, logger, ul.CLASSES_PROGRESS_STEP)

def __add_props_to_set_if_missing(cls, props_set: set):
    props_ids = cls[ClassFields.SUBJECT_OF_STATS.value] + cls[ClassFields.VALUE_OF_STATS.value]
    for prop_id in props_ids:
        if prop_id not in props_set:
            props_set.add(prop_id)

def __props_for_class(id, cls, classes_dict: dict):
    props_set = set()
    visited_ids = set()
    queue = deque()
    
    visited_ids.add(id)
    queue.append(cls[ClassFields.SUBCLASS_OF.value])
    __add_props_to_set_if_missing(cls, props_set)
    
    while (len(queue) != 0):
        next_ids = queue.popleft()
        for next_class_id in next_ids:
            if next_class_id not in visited_ids:
                visited_ids.add(next_class_id)
                next_cls = classes_dict[next_class_id]
                queue.append(next_cls[ClassFields.SUBCLASS_OF.value])
                __add_props_to_set_if_missing(next_cls, props_set)
    return props_set

@timed(logger)
def main_all_properties_for_classes(classes_json_file_path: pathlib.Path):
    classes_dict = __load_classes_to_dict(classes_json_file_path)
    with (open(OUTPUT_FILE_ALL, "wb") as output_all_file,
          open(OUTPUT_FILE_COUNT_ONLY, "wb") as output_counts_file
    ):
        for i, [id, cls] in enumerate(classes_dict.items()):
            cls_props = __props_for_class(id, cls, classes_dict)
            decoding.write_wd_entity_to_file({
                "id": id,
                "len": len(cls_props),
                "props": list(cls_props)
            }, output_all_file)
            decoding.write_wd_entity_to_file({
                "id": id,
                "len": len(cls_props)
            }, output_counts_file)
            ul.try_log_progress(logger, i, ul.CLASSES_PROGRESS_STEP)
        
        
    
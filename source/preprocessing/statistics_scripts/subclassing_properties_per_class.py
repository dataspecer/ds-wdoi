import pathlib
import logging
from collections import deque
from core.model_simplified.classes import ClassFields
from core.model_simplified.scores import ScoresFields
import core.utils.logging as ul
import core.utils.decoding as decoding

logger = logging.getLogger("s")

def __load_classes_to_dict(json_file_path: pathlib.Path) -> dict:
    return decoding.load_entities_to_dict(json_file_path, logger, ul.CLASSES_PROGRESS_STEP)

def __load_properties_to_dict(json_file_path: pathlib.Path) -> dict:
    return decoding.load_entities_to_dict(json_file_path, logger, ul.PROPERTIES_PROGRESS_STEP)

print("loading classes")
# properties_dict = __load_properties_to_dict(properties_json_file_path)
classes_dict = __load_classes_to_dict("classes-recs.json")
print("classes loaded")

def try_add_to_set(cls, props_set: set):
    props_ids = cls[ClassFields.SUBJECT_OF_STATS.value] + cls[ClassFields.VALUE_OF_STATS.value]
    for prop_id in props_ids:
        if prop_id not in props_set:
            props_set.add(prop_id)

def compute_props_for_class(id, cls):
    props_set = set()
    visited_ids = set()
    queue = deque()
    
    visited_ids.add(id)
    queue.append(cls[ClassFields.SUBCLASS_OF.value])
    try_add_to_set(cls, props_set)
    
    while (len(queue) != 0):
        next_ids = queue.popleft()
        for next_class_id in next_ids:
            if next_class_id not in visited_ids:
                visited_ids.add(next_class_id)
                next_cls = classes_dict[next_class_id]
                queue.append(next_cls[ClassFields.SUBCLASS_OF.value])
                try_add_to_set(next_cls, props_set)

    return props_set

def compute():
    with open("subclassing_properties_per_class.json", "wb") as output_file:
        i = 0
        for id, cls in classes_dict.items():
            cls_props = compute_props_for_class(id, cls)
            decoding.write_wd_entity_to_file({
                "id": id,
                "len": len(cls_props),
                "props": list(cls_props)
            }, output_file)
            i += 1
            if i % 10_000 == 0:
                print(i)
        
        
    
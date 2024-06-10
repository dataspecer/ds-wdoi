from pathlib import Path
import core.utils.decoding as decoding
import core.utils.logging as ul
import random
import json

from core.default_languages import ENGLISH_LANGUAGE
from core.model_simplified.classes import ClassFields

RANDOM_SEED = 333
random.seed(RANDOM_SEED)

logger = ul.root_logger.getChild("initial_search_class_selection")

VALUES_TO_SELECT = 6

OUTPUT_FILE_PATH_JSON = "initial_search_class_selection.json"
OUTPUT_FILE_PATH_CSV = "initial_search_class_selection.csv"

INSTANCES_COUNT_MIN = 100
INSTANCES_COUNT_MAX = 1_000_000_000
INSTANCE_COUNT_RANGES = [(INSTANCES_COUNT_MIN, 1_000), (1_000, 10_000), (10_000, 100_000), (100_000, INSTANCES_COUNT_MAX)]

CHILDREN_COUNT_MIN = 1
CHILDREN_COUNT_MAX = 1_000_000_000
CHILDREN_COUNT_RANGES = [(100, 1_000), (1_000, 10_000), (10_000, 100_000), (100_000, CHILDREN_COUNT_MAX)]

ANCESTORS_COUNT_MIN = 1
ANCESTORS_COUNT_MAX = 1_000_000_000
ANCESTORS_COUNT_RANGES = [(100, 200), (200, ANCESTORS_COUNT_MAX)]

def find_bucket_index(value, bucket_ranges) -> int | None:
    for idx, range_tuple in enumerate(bucket_ranges):
        if value >= range_tuple[0] and value < range_tuple[1]:
            return idx
    
def split_into_buckets(entities: list, value_getter, bucket_ranges):
    buckets = [[] for _ in range(len(bucket_ranges))]
    
    for entity in entities:
        value = value_getter(entity)
        bucket_idx = find_bucket_index(value, bucket_ranges)
        if bucket_idx != None:
            buckets[bucket_idx].append(entity[ClassFields.ID.value])

    return buckets

def select_random_entites_from_bucket_no_repetition(bucket: list[int], count: int, context: set) -> list:
    if len(bucket) < count:
        raise ValueError(f"Cannot select {count} values from array of length {len(bucket)}")
    else:
        selected = []
        while len(selected) != count:
            selected_entity_id = random.choice(bucket)
            if selected_entity_id not in context:
                context.add(selected_entity_id)
                selected.append(selected_entity_id)
        return selected

def create_selections_for_buckets(name: str, classes_dict: dict, buckets, ranges, context: set):
    selections = []
    for idx, bucket in enumerate(buckets):
        random_selection = select_random_entites_from_bucket_no_repetition(bucket, VALUES_TO_SELECT, context)
        selections.append({
            "id": "_".join([name, str(ranges[idx][0]), str(ranges[idx][1])]),
            "selection": [
                    {
                        "id": entity_id, 
                        "label": classes_dict[entity_id][ClassFields.LABELS.value][ENGLISH_LANGUAGE],
                        "iri": classes_dict[entity_id][ClassFields.IRI.value]
                    } 
                    for entity_id in random_selection
                ]
        })
    return selections


def filter_out_wikimedia_labels(entities_dict: dict) -> dict:
    new_dict = dict()
    for id, entity in entities_dict.items():
        lowercase = entity["name"].lower()
        if "wikimedia" not in lowercase and "wikidata" not in lowercase and "wikipedia" not in lowercase and "template" not in lowercase and "wikinews" not in lowercase:
            new_dict[id] = entity
    return new_dict
    
def main_initial_search_class_selection(classes_json_file_path: Path, instance_count_summary_file_path: Path, ancestor_count_summary_file_path: Path, children_count_summary_file_path: Path):
    logger.info("Loading classes")
    classes_dict = decoding.load_entities_to_dict(classes_json_file_path, logger, ul.CLASSES_PROGRESS_STEP)
    
    logger.info("Loading instances info classes")
    instance_counts_dict = filter_out_wikimedia_labels(decoding.load_entities_to_dict(instance_count_summary_file_path, logger, ul.CLASSES_PROGRESS_STEP))
    logger.info("Loading ancestors info classes")
    ancestor_counts_dict = filter_out_wikimedia_labels(decoding.load_entities_to_dict(ancestor_count_summary_file_path, logger, ul.CLASSES_PROGRESS_STEP))
    logger.info("Loading children info classes")
    children_counts_dict = filter_out_wikimedia_labels(decoding.load_entities_to_dict(children_count_summary_file_path, logger, ul.CLASSES_PROGRESS_STEP))
    
    logger.info("Splitting classes into instances buckets")
    instance_buckets = split_into_buckets(instance_counts_dict.values(), lambda entity: entity["nins"], INSTANCE_COUNT_RANGES)
    logger.info("Splitting classes into ancestors buckets")
    ancestors_buckets = split_into_buckets(ancestor_counts_dict.values(), lambda entity: entity["n"], ANCESTORS_COUNT_RANGES)
    logger.info("Splitting classes into children buckets")
    children_buckets = split_into_buckets(children_counts_dict.values(), lambda entity: entity["n"], CHILDREN_COUNT_RANGES)
    
    context = set()
    ##ancestor_selections = create_selections_for_buckets("ancestors", classes_dict, ancestors_buckets, ANCESTORS_COUNT_RANGES, context)
    instance_selections = create_selections_for_buckets("instances", classes_dict, instance_buckets, INSTANCE_COUNT_RANGES, context)
    children_selections = create_selections_for_buckets("children", classes_dict, children_buckets, CHILDREN_COUNT_RANGES, context)
    
    logger.info("Writing to a json file")
    with open(OUTPUT_FILE_PATH_JSON, "w") as json_file:
        json.dump({
            #"ancestors": ancestor_selections,
            "instances": instance_selections,
            "children": children_selections
        }, json_file, indent=2, sort_keys=True)
from pathlib import Path
import core.utils.decoding as decoding
import core.utils.logging as ul
from random import Random
import json
import re
import csv

from experiments.main_logger import main_logger
from core.default_languages import ENGLISH_LANGUAGE
from core.model_simplified.classes import ClassFields
from core.utils.timer import timed

RANDOM_SEED = 2222
random = Random()
random.seed(RANDOM_SEED)

TEST_RANDOM_SEED = 3333
test_random = Random()
test_random.seed(TEST_RANDOM_SEED)

logger = main_logger.getChild("initial_search_class_selection")

VALUES_TO_SELECT = 10
TEST_VALUES_TO_SELECT = 1

OUTPUT_FILE_JSON_PREFIX = "initial_search_class_selection"
OUTPUT_FILE_CSV_PREFIX = "initial_search_class_selection"

INSTANCES_COUNT_MIN = 100
INSTANCES_COUNT_MAX = 1_000_000_000
INSTANCE_COUNT_RANGES = [(INSTANCES_COUNT_MIN, 1_000), (1_000, 10_000), (10_000, 100_000), (100_000, INSTANCES_COUNT_MAX)]

CHILDREN_COUNT_MIN = 10_000
CHILDREN_COUNT_MAX = 1_000_000_000
CHILDREN_COUNT_RANGES = [(CHILDREN_COUNT_MIN, 100_000), (100_000, CHILDREN_COUNT_MAX)]

ANCESTORS_COUNT_MIN = 150
ANCESTORS_COUNT_MAX = 1_000_000_000
ANCESTORS_COUNT_RANGES = [(ANCESTORS_COUNT_MIN, 180), (180, ANCESTORS_COUNT_MAX)]

def __find_bucket_index(value, bucket_ranges) -> int | None:
    for idx, range_tuple in enumerate(bucket_ranges):
        if value >= range_tuple[0] and value < range_tuple[1]:
            return idx
    
def __split_into_buckets(entities: list, value_getter, bucket_ranges):
    buckets = [[] for _ in range(len(bucket_ranges))]
    
    for entity in entities:
        value = value_getter(entity)
        bucket_idx = __find_bucket_index(value, bucket_ranges)
        if bucket_idx != None:
            buckets[bucket_idx].append(entity[ClassFields.ID.value])

    return buckets

def __select_random_entites_from_bucket_no_repetition(random: Random, bucket: list[int], count: int, context: set) -> list:
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

def __create_selections_for_buckets(name: str, classes_dict: dict, buckets, ranges, context: set):
    selections = []
    for idx, bucket in enumerate(buckets):
        random_selection = __select_random_entites_from_bucket_no_repetition(random, bucket, VALUES_TO_SELECT, context)
        selections.append({
            "id": "_".join([name, str(ranges[idx][0]), str(ranges[idx][1])]),
            "selection": [
                    {
                        "id": entity_id, 
                        "iri": classes_dict[entity_id][ClassFields.IRI.value],
                        "label": classes_dict[entity_id][ClassFields.LABELS.value][ENGLISH_LANGUAGE],
                    } 
                    for entity_id in random_selection
                ]
        })
    return selections


def __filter_out_entities(entities_dict: dict) -> dict:
    new_dict = dict()
    for id, entity in entities_dict.items():
        lowercase = entity["name"].lower()
        if ( 
            "wikimedia" not in lowercase and 
            "wikidata" not in lowercase and 
            "wikipedia" not in lowercase and 
            "template" not in lowercase and 
            "wikinews" not in lowercase and 
            not bool(re.search(r'\d', lowercase))
        ):
            new_dict[id] = entity
    return new_dict

def __create_sublists(selections: list, *, shuffle: bool = False):
    sublists = []
    for idx in range(VALUES_TO_SELECT):
        sl = []
        for selection in selections:
            sl.append(selection["selection"][idx])
        if shuffle:
            random.shuffle(sl)
        sublists.append(sl)
    return sublists
    
def __save_sublists_to_csv(sublists, csv_file_path: Path):
    with open(csv_file_path, "w", newline="") as file:
        writer = csv.writer(file, delimiter='|')
        for sl in sublists:
            for item in sl:
                writer.writerow([item["id"], item["iri"], item["label"]])
            writer.writerow(["", "", ""])
    
def __save_sublists_to_json(sublists, json_file_path: Path):
    with open(json_file_path, "w") as output_file:
            json.dump(sublists, output_file, indent=2, sort_keys=True)
    
    
def __select_test_entities_for_selection(selections: list, classes_dict: dict, buckets: list, context):
    for idx, category in enumerate(selections):
        test_random_selection = __select_random_entites_from_bucket_no_repetition(test_random, buckets[idx], TEST_VALUES_TO_SELECT, context)
        category["test_selection"] = [
            {
                "id": entity_id, 
                "iri": classes_dict[entity_id][ClassFields.IRI.value],
                "label": classes_dict[entity_id][ClassFields.LABELS.value][ENGLISH_LANGUAGE],
            } 
            for entity_id in test_random_selection
        ]

@timed(logger)
def __initial_sublists(context, classes_dict, instance_counts_dict, ancestor_counts_dict, children_counts_dict):
    ancestor_buckets = __split_into_buckets(ancestor_counts_dict.values(), lambda entity: entity["n"], ANCESTORS_COUNT_RANGES)
    children_buckets = __split_into_buckets(children_counts_dict.values(), lambda entity: entity["n"], CHILDREN_COUNT_RANGES)
    instance_buckets = __split_into_buckets(instance_counts_dict.values(), lambda entity: entity["nins"], INSTANCE_COUNT_RANGES)
    
    instance_selections = __create_selections_for_buckets("instances", classes_dict, instance_buckets, INSTANCE_COUNT_RANGES, context)
    children_selections = __create_selections_for_buckets("children", classes_dict, children_buckets, CHILDREN_COUNT_RANGES, context)
    ancestor_selections = __create_selections_for_buckets("ancestors", classes_dict, ancestor_buckets, ANCESTORS_COUNT_RANGES, context)
    
    __select_test_entities_for_selection(instance_selections, classes_dict, instance_buckets, context)
    __select_test_entities_for_selection(children_selections, classes_dict, children_buckets, context)
    __select_test_entities_for_selection(ancestor_selections, classes_dict, ancestor_buckets, context)
    
    __save_sublists_to_json({
            "ancestors": ancestor_selections,
            "instances": instance_selections,
            "children": children_selections
        }, OUTPUT_FILE_JSON_PREFIX + ".json")
        
    concatenated_selections = instance_selections + children_selections + ancestor_selections
    sublists = __create_sublists(concatenated_selections)
    sublists_shuffled = __create_sublists(concatenated_selections, shuffle=True)
    __save_sublists_to_csv(sublists, OUTPUT_FILE_CSV_PREFIX + ".csv")
    __save_sublists_to_csv(sublists_shuffled, OUTPUT_FILE_CSV_PREFIX + "_shuffled" + ".csv")   
    
@timed(logger)
def __substitution_sublists(context, classes_dict, instance_counts_dict):    
    instance_buckets = __split_into_buckets(instance_counts_dict.values(), lambda entity: entity["nins"], INSTANCE_COUNT_RANGES)
    instance_selections = __create_selections_for_buckets("instances", classes_dict, instance_buckets, INSTANCE_COUNT_RANGES, context)
    
    __select_test_entities_for_selection(instance_selections, classes_dict, instance_buckets, context)
    
    __save_sublists_to_json({
            "instances": instance_selections,
        }, OUTPUT_FILE_JSON_PREFIX + "_substitution.json")

    concatenated_selections = instance_selections
    sublists = __create_sublists(concatenated_selections)
    sublists_shuffled = __create_sublists(concatenated_selections, shuffle=True)
    __save_sublists_to_csv(sublists, OUTPUT_FILE_CSV_PREFIX + "_substitution.csv")
    __save_sublists_to_csv(sublists_shuffled, OUTPUT_FILE_CSV_PREFIX + "_shuffled_substitution" + ".csv")   
    
@timed(logger)
def main_initial_search_class_selection(classes_json_file_path: Path, instance_count_summary_file_path: Path, ancestor_count_summary_file_path: Path, children_count_summary_file_path: Path):
    logger.info("Loading classes")
    classes_dict = decoding.load_entities_to_dict(classes_json_file_path, logger, ul.CLASSES_PROGRESS_STEP)
    logger.info("Loading instances info classes")
    instance_counts_dict = __filter_out_entities(decoding.load_entities_to_dict(instance_count_summary_file_path, logger, ul.CLASSES_PROGRESS_STEP))
    logger.info("Loading ancestors info classes")
    ancestor_counts_dict = __filter_out_entities(decoding.load_entities_to_dict(ancestor_count_summary_file_path, logger, ul.CLASSES_PROGRESS_STEP))
    logger.info("Loading children info classes")
    children_counts_dict = __filter_out_entities(decoding.load_entities_to_dict(children_count_summary_file_path, logger, ul.CLASSES_PROGRESS_STEP))
    
    context = set()
    __initial_sublists(context, classes_dict, instance_counts_dict, ancestor_counts_dict, children_counts_dict)
    __substitution_sublists(context, classes_dict, instance_counts_dict)
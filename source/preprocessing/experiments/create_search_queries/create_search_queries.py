import csv
import json
from pathlib import Path
import core.utils.decoding as decoding
import core.utils.logging as ul
from experiments.main_logger import main_logger
from core.default_languages import ENGLISH_LANGUAGE
from core.model_simplified.classes import ClassFields
from core.utils.timer import timed

logger = main_logger.getChild("create_search_queries")
OUTPUT_FILE_PATH = "search_queries.json"

MECHANIC_USER_ID = 0
MECHANIC_USER_MIX_USER_ID = 100

def __load_selections_from_files(selection_file_paths: list[Path]) -> dict:
    selections = []
    for file_path in selection_file_paths:
        with open(file_path, "r") as file:
            selections.append(json.load(file))
    return selections

def __map_selection_classes_to_category_ids(selections: list):
    selection_classes = dict[int, str]()
    for selection in selections:
        for group_id, selection_group in selection.items():
            for category in selection_group:
                category_id = category["id"]
                for cls in category["selection"]:
                    selection_classes[cls["id"]] = category_id
    return selection_classes

@timed(logger)
def __load_user_queries_from_csv(csv_file_path: Path):
    queries = []
    with open(csv_file_path, "r") as input_file:
        csv_reader = csv.reader(input_file)
        fields = next(csv_reader)
        for row in csv_reader:
            if len(row) != 8:
                raise ValueError("Missing column")
            
            user_id = row[0]
            class_id = row[1]
            user_queries = row[2:]
            
            if len(user_queries) != 6:
                raise ValueError("Missing query")
            
            for idx, user_query in enumerate(user_queries):
                queries.append({
                    "user_id": int(user_id),
                    "class_id": int(class_id),
                    "query_id": f"user_query_{idx}",
                    "query": user_query
                })
    return queries

def __add_categories_to_queries(queries, class_to_category: dict):
    for query in queries:
        cls_id = query["class_id"]
        if cls_id not in class_to_category:
            raise ValueError(f"Missing {cls_id} from in selection")
        category_id = class_to_category[cls_id]
        query["class_category"] = category_id

def __get_class_label(wd_class):
    return wd_class[ClassFields.LABELS.value][ENGLISH_LANGUAGE]

def __get_class_description(wd_class):
    class_descriptions = wd_class[ClassFields.DESCRIPTIONS.value]
    if ENGLISH_LANGUAGE in class_descriptions:
        return class_descriptions[ENGLISH_LANGUAGE]
    return None

def __generate_label_query(user_query, wd_class):
    return {
            "user_id": MECHANIC_USER_ID,
            "class_id": user_query["class_id"],
            "query_id": "mech_label",
            "query": __get_class_label(wd_class)
        }

def __generate_description_query(user_query, wd_class):
    description = __get_class_description(wd_class)
    if description != None:
        return {
                "user_id": MECHANIC_USER_ID,
                "class_id": user_query["class_id"],
                "query_id": "mech_desc",
                "query": description
            }
    return None

def __generate_label_description_query(user_query, wd_class):
    label = __get_class_label(wd_class)
    description = __get_class_description(wd_class)
    if description != None:
        return {
                "user_id": MECHANIC_USER_ID,
                "class_id": user_query["class_id"],
                "query_id": "mech_label_desc",
                "query": f"{label}, {description}"
            }
        
def __generate_label_user_query(user_query, wd_class):
    label = __get_class_label(wd_class)
    return {
            "user_id": MECHANIC_USER_MIX_USER_ID + user_query["user_id"],
            "class_id": user_query["class_id"],
            "query_id": f"mech_label_{user_query["query_id"]}",
            "query": f"{label}, {user_query["query"]}"
        }

def __append_query_if_not_empty(query, storage: list):
    if query != None:
        storage.append(query)

@timed(logger)
def __generate_machanic_queries(user_queries: list, classes: dict):
    mech_only_once = set()
    mechanic_queries = []
    for query in user_queries:
        wd_class_id = query["class_id"]
        wd_class = classes[wd_class_id]
        if wd_class_id not in mech_only_once:
            __append_query_if_not_empty(__generate_label_query(query, wd_class), mechanic_queries)
            __append_query_if_not_empty(__generate_description_query(query, wd_class), mechanic_queries)
            __append_query_if_not_empty(__generate_label_description_query(query, wd_class), mechanic_queries)
            mech_only_once.add(wd_class_id)
        __append_query_if_not_empty(__generate_label_user_query(query, wd_class), mechanic_queries)
    return mechanic_queries
   
def __save_queries_to_json(queries, json_file_path: Path):
    with open(json_file_path, "w") as output_file:
        json.dump(queries, output_file, indent=2)

@timed(logger)
def main_create_search_queries(classes_json_file_path: Path, initial_selections_json_file_paths: list[Path], user_generated_queries_file_path: Path):
    logger.info("Loading classes")
    classes = decoding.load_entities_to_dict(classes_json_file_path, logger, ul.CLASSES_PROGRESS_STEP)
    logger.info("Loading selections")
    selections = __load_selections_from_files(initial_selections_json_file_paths)
    selection_classes_to_category = __map_selection_classes_to_category_ids(selections)
    user_queries = __load_user_queries_from_csv(user_generated_queries_file_path)
    mechanic_queries = __generate_machanic_queries(user_queries, classes)
    queries = user_queries + mechanic_queries
    __add_categories_to_queries(queries, selection_classes_to_category)
    __save_queries_to_json(queries, OUTPUT_FILE_PATH)
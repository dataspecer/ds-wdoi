from pathlib import Path
import core.utils.logging as ul
from random import Random
import json

from core.default_languages import ENGLISH_LANGUAGE
from core.model_simplified.classes import ClassFields
logger = ul.root_logger.getChild("post_initial_search_class_selection")

RANDOM_SEED = 3
random = Random()
random.seed(RANDOM_SEED)

ITEMS_PER_CATEGORY = 2
OUTPUT_JSON_FILE_PATH = "post_initial_search_class_selection.json"

def load_selections_categories_to_dict(selections: list):
    selection_categories = dict()
    for selection in selections:
        for group_id, selection_group in selection.items():
            for category in selection_group:
                category_id = category["id"]
                if category_id in selection_categories:
                    selection_categories[category_id] += category["selection"]
                else:
                    selection_categories[category_id] = category["selection"]
    return selection_categories

def load_selection_from_files(selection_file_paths: list[Path]) -> dict:
    selections = []
    for file_path in selection_file_paths:
        with open(file_path, "r") as file:
            selections.append(json.load(file))
    return selections

def select_unique_item_from_category(category: list, items_present: set):
    while True:
        item = random.choice(category)
        if item["id"] not in items_present:
            items_present.add(item["id"])
            return item

def select_items_for_each_category(selection_categories: dict, items_per_category: int):
    categories_selections = {}
    items_present = set()
    for category_id, items in selection_categories.items():
        if items_per_category > len(items):
            raise ValueError("Cannot select more items than is present.")
        categories_selections[category_id] = [select_unique_item_from_category(items, items_present) for _ in range(items_per_category)]
    return categories_selections
        
def save_selection_to_file(items_selection, output_file_path):
    with open(output_file_path, "w") as output_file:
        json.dump(items_selection, output_file, indent=2)
        
def main_post_initial_search_class_selection(selection_file_paths: list[Path]):
    selections = load_selection_from_files(selection_file_paths)
    selection_categories = load_selections_categories_to_dict(selections)
    items_selection = select_items_for_each_category(selection_categories, ITEMS_PER_CATEGORY)
    save_selection_to_file(items_selection, OUTPUT_JSON_FILE_PATH)
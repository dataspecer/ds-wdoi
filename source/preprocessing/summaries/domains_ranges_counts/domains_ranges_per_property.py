from typing import Literal
import core.utils.decoding as decoding
import core.utils.logging as ul
from core.utils.timer import timed
from core.model_simplified.classes import ClassFields
from core.model_simplified.scores import ScoresFields
from source.preprocessing.core.model_simplified.constraints import GenConstFields, ItemConstFields
from source.preprocessing.core.model_simplified.properties import PropertyFields
from source.preprocessing.core.model_wikidata.properties import UnderlyingTypes
from summaries.summaries import main_logger
import pathlib
import json

logger = main_logger.getChild("domains_ranges_per_property")

DOMAINS_OUTPUT_FILE = "domains_ranges_per_property_sorted_domains.json"
RANGES_OUTPUT_FILE = "domains_ranges_per_property_sorted_ranges.json"

def __get_value_of_list(property):
    if property[PropertyFields.UNDERLYING_TYPE.value] == UnderlyingTypes.ENTITY:
        return property[PropertyFields.CONSTRAINTS.value][GenConstFields.TYPE_DEPENDENT.value][ItemConstFields.VALUE_TYPE_STATS.value] 
    else:
        return []
    
@timed(logger)
def main_domains_ranges_per_class(properties_json_file_path: pathlib.Path):
    with open(properties_json_file_path, "rb") as properties_input_file:
        properties_list = json.load(properties_input_file)
        results = []
        for prop in properties_list:
            results.append({
                "domain_count": len(prop[PropertyFields.CONSTRAINTS.value][GenConstFields.SUBJECT_TYPE_STATS.value]),
                "range_count": len(__get_value_of_list(prop)),
                "id": prop[PropertyFields.ID],
                "label": prop[PropertyFields.LABELS.value]["en"],
            })
            
        results.sort(reverse=True, key=lambda x: x["domain_count"])
        with open(DOMAINS_OUTPUT_FILE, "wb") as o:
            for stat in results:
                decoding.write_wd_entity_to_file(stat, o)

        results.sort(reverse=True, key=lambda x: x["range_count"])
        with open(RANGES_OUTPUT_FILE, "wb") as o:
            for stat in results:
                decoding.write_wd_entity_to_file(stat, o)
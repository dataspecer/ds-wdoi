from typing import Literal
import core.utils.decoding as decoding
import core.utils.logging as ul
from core.utils.timer import timed
from core.model_simplified.classes import ClassFields
from core.model_simplified.scores import ScoresFields
from summaries.summaries import main_logger
import pathlib

logger = main_logger.getChild("domains_ranges_per_class")

DOMAINS_OUTPUT_FILE = "domains_ranges_per_class_sorted_domains.json"
RANGES_OUTPUT_FILE = "domains_ranges_per_class_sorted_ranges.json"

@timed(logger)
def main_domains_ranges_per_class(classes_json_file_path: pathlib.Path, field: Literal[ClassFields.VALUE_OF_STATS, ClassFields.SUBJECT_OF_STATS]):
    with open(classes_json_file_path, "rb") as input_json_file:
        results = []
        for entity in decoding.entities_generator(input_json_file, logger, ul.CLASSES_PROGRESS_STEP):
            cls_property_counts = []
            for property_record in entity[field.value]:
                if len(property_record[ScoresFields.RANGE.value]) != 0:
                        cls_property_counts.append({ "range_count": len(property_record[ScoresFields.RANGE.value]), "property_id": property_record[ScoresFields.PROPERTY.value], "class_id": entity['id']}) 
            cls_property_counts.sort(reverse=True, key=lambda x: x["c"])
            if len(cls_property_counts) != 0:
                results.append(cls_property_counts)
        results.sort(reverse=True, key=lambda x: x[0]["c"])            

        output_file_name = DOMAINS_OUTPUT_FILE
        if field.value == ClassFields.SUBJECT_OF_STATS.value:
            output_file_name = RANGES_OUTPUT_FILE
        
        with open(output_file_name, "wb") as o:
            for idx, res in enumerate(results):
                decoding.write_wd_entity_to_file(res, o)
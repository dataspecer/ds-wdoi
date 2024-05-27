import core.utils.decoding as decoding
import core.utils.logging as ul
from core.utils.timer import timed
from phases.experimental_search_engine_data_preparation.data_entities.data_class import DataClassFields
from summaries.summaries import main_logger
import pathlib
import statistics

logger = main_logger.getChild("classes_number_of_instances_and_normalize")

OUTPUT_FILE = "classes_number_of_instances_and_normalize.json"

def normalize_min_max(entities):
    entities_instance_counts =  [cls["nins"] for cls in entities]
    minv = min(entities_instance_counts)
    maxv = max(entities_instance_counts)
    logger.info(f"Mean {statistics.mean(entities_instance_counts)} StdDev {statistics.stdev(entities_instance_counts)}") 
    
    for entity in entities:
        entity["nins_min_max"] = (entity["nins"] - minv) / (maxv - minv)

def normalize_satu(entities):
    for entity in entities:
        entity["nins_satu_100"] = (entity["nins"]) / (entity["nins"] + 100)

@timed(logger)
def main_classes_number_of_instances_and_normalize(classes_json_file_path: pathlib.Path, include_zero: bool):
    with open(classes_json_file_path, "rb") as classes_input_file:
        results = []
        for cls in decoding.entities_from_file(classes_input_file, logger, ul.CLASSES_PROGRESS_STEP):
            num_instances = cls[DataClassFields.INSTANCE_COUNT.value]
            num_inlinks = cls[DataClassFields.INLINKS_COUNT.value]
            
            if num_instances != 0 or include_zero:
                results.append({
                    "nins": num_instances,
                    "ninl": num_inlinks,
                    "id": cls[DataClassFields.ID.value],
                    "name": cls[DataClassFields.LABELS.value]['en'],
                })
        
        results.sort(reverse=True, key=lambda x: x["nins"])
        
        normalize_min_max(results)
        normalize_satu(results)
        
        with open(OUTPUT_FILE, "wb") as o:
            for stat in results:
                decoding.write_wd_entity_to_file(stat, o)
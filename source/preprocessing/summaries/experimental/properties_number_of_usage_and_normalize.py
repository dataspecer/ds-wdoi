import core.utils.decoding as decoding
import core.utils.logging as ul
from core.utils.timer import timed
from phases.experimental_search_engine_data_preparation.data_entities.data_property import DataPropertyFields
from summaries.summaries import main_logger
import pathlib
import statistics

logger = main_logger.getChild("properties_number_of_usage_and_normalize")

OUTPUT_FILE = "properties_number_of_usage_and_normalize.json"

def normalize_min_max(entities):
    entities_instance_counts =  [entity["nu"] for entity in entities]
    minv = min(entities_instance_counts)
    maxv = max(entities_instance_counts)
    logger.info(f"Mean {statistics.mean(entities_instance_counts)} StdDev {statistics.stdev(entities_instance_counts)}")
    
    for entity in entities:
        entity["nu_min_max"] = (entity["nu"] - minv) / (maxv - minv)

def normalize_satu(entities):
    for entity in entities:
        entity["nu_satu_1000"] = (entity["nu"]) / (entity["nu"] + 1000)

@timed(logger)
def main_properties_number_of_usage_and_normalize(properties_json_file_path: pathlib.Path, include_zero: bool):
    with open(properties_json_file_path, "rb") as properties_input_file:
        results = []
        for prop in decoding.entities_from_file(properties_input_file, logger, ul.PROPERTIES_PROGRESS_STEP):
            num_usage = prop[DataPropertyFields.INSTANCE_USAGE_COUNT.value]
            
            if num_usage != 0 or include_zero:
                results.append({
                    "nu": num_usage,
                    "id": prop[DataPropertyFields.ID.value],
                    "name": prop[DataPropertyFields.LABELS.value]['en'],
                })
        
        results.sort(reverse=True, key=lambda x: x["nu"])
        
        normalize_min_max(results)
        normalize_satu(results)
        
        with open(OUTPUT_FILE, "wb") as o:
            decoding.init_json_array_in_files([o])
            for stat in results:
                decoding.write_wd_entity_to_file(stat, o)
            decoding.close_json_array_in_files([o])
import pathlib
from collections import deque
from core.model_simplified.classes import ClassFields
import core.utils.logging as ul
import core.utils.decoding as decoding
from phases.experimental_search_engine_data_preparation.data_entities.data_class import DataClassFields
from summaries.summaries import main_logger
from core.utils.timer import timed
import statistics
import matplotlib.pyplot as plt

logger = main_logger.getChild("average")

@timed(logger)
def main_average(input_file_path: pathlib.Path, value_field, include_zero):
    with open(input_file_path, "rb") as file:
        values = []
        labels = []
        for entity in decoding.entities_from_file(file, logger, ul.CLASSES_PROGRESS_STEP):
            v = len(entity[value_field])
            l = entity["labels"]
            if (v == 0 and include_zero) or v != 0:
                values.append(v)
                labels.append((v, "empty" if "en" not in l else l["en"]))
                
        logger.info(f"count {len(values)}")
        logger.info(f"zeros {len(list(filter(lambda x: x == 0, values)))}")
        logger.info(f"average: {statistics.mean(values)}")
        logger.info(f"std: {statistics.stdev(values)})")                   
        logger.info(f"median: {statistics.median(values)})")                   
        logger.info(f"max: {max(values)})")                   
        
        labels.sort(reverse=True, key=lambda x: x[0])
        with open("average.txt", "w") as f:
            for tuple in enumerate(labels):
                f.write(f"{tuple[0]} : {tuple[1]}\n")
        
        
        
    
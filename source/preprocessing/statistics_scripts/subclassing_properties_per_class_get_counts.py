import core.utils.decoding as decoding
import logging

from core.model_simplified.classes import ClassFields
from core.model_simplified.scores import ScoresFields

logger = logging.getLogger("t")

def compute():
    with open("./statistics_scripts/subclassing_properties_per_class.json", "rb") as f:
        with open("subclassing_properties_per_class_counts.json", "wb") as o:
            entities = []
            for entity in decoding.entities_generator(f, logger, 100_000):
                entities.append({
                    "id": entity["id"],
                    "len": entity["len"]
                })
            print("finished loading")
            entities.sort(reverse=True, key=lambda x: x['len'])
            print("finished sorting")
            for entity in entities:
                decoding.write_wd_entity_to_file(entity, o)
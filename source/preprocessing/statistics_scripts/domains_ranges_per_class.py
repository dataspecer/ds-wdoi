
import core.utils.decoding as decoding
import logging

from core.model_simplified.classes import ClassFields
from core.model_simplified.scores import ScoresFields

logger = logging.getLogger("t")

with open("./classes-recs.json", "rb") as f:
    results = []
    for entity in decoding.entities_generator(f, logger, 100_000):
        one = []
        for property_record in entity[ClassFields.VALUE_OF_STATS_SCORES.value]:
            if len(property_record[ScoresFields.RANGE.value]) != 0:
                    one.append({ "c": len(property_record[ScoresFields.RANGE.value]), "n": property_record[ScoresFields.PROPERTY.value], "en": entity['id']}) 
        one.sort(reverse=True, key=lambda x: x["c"])
        if len(one) != 0:
            results.append(one)
    results.sort(reverse=True, key=lambda x: x[0]["c"])            

    print("finished loading")

    with open("test2.json", "wb") as o:
        for idx, res in enumerate(results):
            decoding.write_wd_entity_to_file(res, o)
            
    print("finished")
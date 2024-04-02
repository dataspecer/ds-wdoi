import json
import utils.decoding as decoding
import logging

logger = logging.getLogger("my-logger")

properties = decoding.load_entities_to_map("./properties-recs.json", logger, 1_000)

with open("./properties-domain-range-usage.json", "rb") as f:
    arr = json.load(f)
    
    output = []
    for prop_stat in arr:
        output.append({
            "domainCount": len(prop_stat["subjectTypeStats"]),
            "rangeCount": len(prop_stat["valueTypeStats"]),
            "id": prop_stat["id"],
            "label": properties[prop_stat["id"]]["labels"]["en"],
        })
        
    output.sort(reverse=True, key=lambda x: x["domainCount"])
    
    with open("./testD.json", "wb") as o:
        for stat in output:
            decoding.write_wd_entity_to_file(stat, o)

            
    output.sort(reverse=True, key=lambda x: x["rangeCount"])
    with open("./testR.json", "wb") as o:
        for stat in output:
            decoding.write_wd_entity_to_file(stat, o)
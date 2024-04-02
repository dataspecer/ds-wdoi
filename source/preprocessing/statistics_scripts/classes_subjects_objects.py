import utils.decoding as decoding
import logging

logger = logging.getLogger("t")


with open("./classes-recs.json", "rb") as f:
    results = []
    for entity in decoding.entities_generator(f, logger, 100_000):
        results.append({
            "subjectOfCount": len(entity["subjectOf"]),
            "valueOfCount": len(entity["valueOf"]),
            "subjectOfCountStats": len(entity["subjectOfStats"]),
            "valueOfCountStats": len(entity["valueOfStats"]),
            "id": entity["id"],
            "label": entity["labels"]["en"],
        })

    print("finished loading")

    results.sort(reverse=True, key=lambda x: x['subjectOfCount'])    
    with open("textCCd.json", "wb") as o:
        for entity in results:
            decoding.write_wd_entity_to_file(entity, o)
    
    print("finished ccd")

    results.sort(reverse=True, key=lambda x: x['valueOfCount'])    
    with open("textCCr.json", "wb") as o:
        for entity in results:
            decoding.write_wd_entity_to_file(entity, o)
      
    print("finished ccr")
          
    results.sort(reverse=True, key=lambda x: x['subjectOfCountStats'])    
    with open("textCSd.json", "wb") as o:
        for entity in results:
            decoding.write_wd_entity_to_file(entity, o)
    
    print("finished csd")
    
    results.sort(reverse=True, key=lambda x: x['valueOfCountStats'])      
    with open("textCSr.json", "wb") as o:
        for entity in results:
            decoding.write_wd_entity_to_file(entity, o)
            
    print("finished csr")
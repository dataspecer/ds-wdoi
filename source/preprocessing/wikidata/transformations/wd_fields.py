import wikidata.json_extractors.wd_fields as wd_fields

def transform_wd_str_ids_to_num_ids(wd_str_ids):
    return list(map(wd_fields.extract_wd_numeric_id_part, wd_str_ids)) 

def transform_wd_str_id_to_num_id(str_id):
    if str_id != None:
        return wd_fields.extract_wd_numeric_id_part(str_id)
    else:
        return None
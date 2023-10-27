from wikidata.json_extractors.wd_languages import extract_lang_map

def transform_wd_language_map(wd_language_object: dict, languages):
    lang_map = {}
    for key, value in extract_lang_map(wd_language_object, languages).items():
        lang_map[key] = value["value"]
    return lang_map

def transform_wd_language_array_map(wd_language_object: dict, languages):
    lang_map = {}
    for key, values in extract_lang_map(wd_language_object, languages).items():
        lang_value_array = []
        for value in values:
            lang_value_array.append(value["value"])
        lang_map[key] = lang_value_array
    return lang_map
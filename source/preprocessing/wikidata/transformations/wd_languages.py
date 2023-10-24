def transform_wd_language_map(wd_language_object: dict):
    lang_map = {}
    for key, value in wd_language_object.items():
        lang_map[key] = value['value']
    return lang_map


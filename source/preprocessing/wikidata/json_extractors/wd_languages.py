def extract_lang_map(wd_language_object, selected_languages):
    lang_map = {}
    for lang in selected_languages:
        if lang in wd_language_object:
            lang_map[lang] = wd_language_object[lang]
    return lang_map

def extract_languages_from_wd_language_field(wd_entity_json, field: str, selected_languages):
    if field in wd_entity_json:
        return extract_lang_map(wd_entity_json[field], selected_languages)
    else:
        return {}
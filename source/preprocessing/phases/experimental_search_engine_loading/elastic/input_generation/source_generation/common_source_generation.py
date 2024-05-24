from core.default_languages import ENGLISH_LANGUAGE

def create_language_map_key(field):
    return field + "_" + ENGLISH_LANGUAGE

def convert_num_ids_to_keywords(ids: list[int]) -> list[str]:
    return list(map(lambda x: str(x), ids))

def add_language_value_from_field(language_field_map, wd_data_entity, field, default_value):
    wd_language_object = wd_data_entity[field]
    lang_key = create_language_map_key(field)
    if  ENGLISH_LANGUAGE in wd_language_object:
        language_field_map[lang_key] = wd_language_object[ENGLISH_LANGUAGE]
    else:
        language_field_map[lang_key] = default_value

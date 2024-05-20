def __capitalize(value: str):
    return value.capitalize()

def __strip(value: str):
    return value.strip().strip(",.!?")

def __add_end_char(value: str):
    if value[-1] not in [".", "?", "!"]:
        return value + "."
    return value

def __finalize_sentence(value: str):
    return __capitalize(__add_end_char(value))

def __str_is_not_empty(value: str | None):
    return value != None and value != ""

def __language_value(language_dict, language, *, is_multi_value: bool):
    if language_dict != None:
        if language in language_dict:
            if not is_multi_value:
                return __strip(language_dict[language])
            else:
                return list(map(lambda x: __strip(x), language_dict[language]))
    return None
    
def __get_entity(entity_id, entities_dict: dict, expanded_labels_dict: dict):
    if entity_id in entities_dict:
        return entities_dict[entity_id]
    elif entity_id in entities_dict:
        return expanded_labels_dict[entity_id]
    else:
        return None
    
def multiple_language_values(entity_ids: list, values_limit: int, langauge_field: str, entities_dict: dict, expanded_labels_dict: dict, language):
    language_values = []
    for entity_id in entity_ids:
        entity = __get_entity(entity_id, entities_dict, expanded_labels_dict)
        if entity != None:
            value = __language_value(entity[langauge_field], language, is_multi_value=False)
            if __str_is_not_empty(value):
                language_values.append(value)
        if values_limit <= len(language_values):
            break
    return language_values
  
def __concat_multiple_values(values: list[str]):
    if len(values) == 1:
        return values[0]
    elif len(values) == 2:
        return " and ".join(values)
    else:
        return ", and ".join([", ".join(values[:-1]), values[-1]])
    
def lexicalize_label_description(wd_data_entity, label_field, description_field, language):
    label = __language_value(wd_data_entity[label_field], language, is_multi_value=False)
    description = __language_value(wd_data_entity[description_field], language, is_multi_value=False)
    
    if label != None and description != None:
        return __finalize_sentence(f"{label}, {description}")
    elif label != None and description == None:
        return __finalize_sentence(f"{label}")
    elif label == None and description != None:
        return __finalize_sentence(f"{description}")
    else:
        return None
    
def lexicalize_ids_field_with_labels(wd_data_entity, label_field: str, concat_str: str, values_ids_field: str,  values_limit: int, entities_dict: dict, expanded_labels_dict: dict, language):
    label = __language_value(wd_data_entity[label_field], language, is_multi_value=False)
    values = multiple_language_values(wd_data_entity[values_ids_field], values_limit, label_field, entities_dict, expanded_labels_dict, language)

    if label != None and len(values) != 0:
        return __finalize_sentence(" ".join([label, concat_str, __concat_multiple_values(values)]))
    
    return None

def lexicalize_aliases(wd_data_entity, label_field: str, aliases_field: str, values_limit: int, language):
    label = __language_value(wd_data_entity[label_field], language, is_multi_value=False)
    aliases = __language_value(wd_data_entity[aliases_field], language, is_multi_value=True)

    if label != None and aliases != None and len(aliases) != 0:
        aliases = list(filter(lambda x: __str_is_not_empty(x), aliases[:values_limit]))
        return __finalize_sentence(" ".join([label, "is also known as", __concat_multiple_values(aliases)]))
    
    return None
import core.utils.decoding as decoding
import core.utils.logging as ul
from core.utils.timer import timed
from core.model_simplified.classes import ClassFields
from summaries.summaries import main_logger
import pathlib

logger = main_logger.getChild("number_of_same_info")

EMPTY_STRING = "__empty__"

OUTPUT_FILE_PREFIX = "number_of_same_info_"
OUTPUT_FILE_SUFFIX = ".json"

def create_output_file_name(part):
    return OUTPUT_FILE_PREFIX + part + OUTPUT_FILE_SUFFIX

def get_description(entity) -> list[str]:
    entity_descriptions = entity[ClassFields.DESCRIPTIONS.value]
    description = EMPTY_STRING
    if 'en' in entity_descriptions:
        description = entity_descriptions['en'].lower()
    return [description]

def get_label(entity) -> list[str]:
    return [entity[ClassFields.LABELS.value]['en'].lower()]

def get_aliases(entity) -> list[str]:
    entity_aliases = entity[ClassFields.ALIASES.value]
    aliases = [EMPTY_STRING]
    if 'en' in entity_aliases:
        aliases = map(lambda x: x.lower(), entity_aliases['en'])
    return aliases

def get_str_values(entity, part):
    str_values = []
    if part == 'aliases':
        str_values = get_aliases(entity)
    elif part == 'description':
        str_values = get_description(entity)
    elif part == 'labels':
        str_values = get_label(entity)
    elif part == 'labels_description':
        str_values = [get_label(entity)[0] + " " + get_description(entity)[0]]
    else:
        raise ValueError("Missing value on type property")
    
    return str_values

@timed(logger)
def main_number_of_same_info(json_file_path: pathlib.Path, part: str):
    part_logger = logger.getChild(part)
    with open(json_file_path, "rb") as input_file:
        resultsDict = dict()
        for entity in decoding.entities_from_file(input_file, part_logger, ul.CLASSES_PROGRESS_STEP):
            str_values = get_str_values(entity, part)
            for value in str_values:
                if value in resultsDict:
                    resultsDict[value] += 1
                else:
                    resultsDict[value] = 1
        
        resultsList = []
        for key, value in resultsDict.items():
            resultsList.append({
                "n": value,
                "value": key
            })
        
        resultsList.sort(reverse=True, key=lambda x: x["n"])
        with open(create_output_file_name(part), "wb") as o:
            for stat in resultsList:
                decoding.write_wd_entity_to_file(stat, o)
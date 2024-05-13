import orjson
import core.utils.logging as ul
import pathlib

def __line_contains_json_object(line: str) -> bool:
   if line.startswith("{"):
       return True
   else:
       return False
   
def __remove_ending_comma(line: str) -> str:
    return line[:-1]

def __decode_binary_line(binary_line: str) -> str:
    return binary_line.decode().strip()

def __load_wd_entity_json(string_line: str):
    return orjson.loads(__remove_ending_comma(string_line))

def __serialize_wd_entity_json(wd_entity):
    return orjson.dumps(wd_entity)

def init_json_array_in_files(file_array) -> None:
    for f in file_array:
        f.write("[\n".encode())
        
def close_json_array_in_files(file_array) -> None:
    for f in file_array:
        f.write("]".encode())

def write_wd_entity_to_file(wd_entity, output_file):
    output_file.write(__serialize_wd_entity_json(wd_entity))
    output_file.write(",\n".encode())
    
def __line_to_wd_entity(binary_line):
    string_line = __decode_binary_line(binary_line)
    if __line_contains_json_object(string_line):
        return __load_wd_entity_json(string_line)
    else:
        return None

def write_json_to_file(json_obj, output_file):
    output_file.write(orjson.dumps(json_obj))

def __empty_message():
    return ""
    
def entities_generator(json_file, logger, logging_step, context_message_func = __empty_message):
    i = 0
    for binary_line in json_file:
        try:
            wd_entity = __line_to_wd_entity(binary_line)
            if wd_entity != None:
                yield wd_entity
        except Exception as e:
            logger.exception(f"There was an error during decoding of an entity on line {i}.")
        i += 1
        ul.try_log_progress(logger, i, logging_step, context_message_func())
    ul.log_progress(logger, i, context_message_func())
    
def load_entities_to_dict(json_file_path: pathlib.Path, logger, logging_step, transform_func = None): 
    entities_dict = dict()
    with open(json_file_path, "rb") as input_json_file:
        for wd_entity in entities_generator(input_json_file, logger, logging_step):
            entities_dict[wd_entity['id']] = wd_entity if transform_func == None else transform_func(wd_entity)
        ul.log_loading_to_map(logger, entities_dict)
    return entities_dict

def write_mapped_entities_to_file(entity_map: dict, file_name: pathlib.Path):
    with open(file_name, "wb") as output_file:
        init_json_array_in_files([output_file])
        for wd_entity in entity_map.values():
            write_wd_entity_to_file(wd_entity, output_file)
        close_json_array_in_files([output_file])
    
import orjson

def line_contains_json_object(line: str) -> bool:
   if line.startswith("{"):
       return True
   else:
       return False
   
def remove_ending_comma(line: str) -> str:
    return line[:-1]

def decode_binary_line(binary_line: str) -> str:
    return binary_line.decode().strip()

def load_wd_entity_json(string_line: str):
    return orjson.loads(remove_ending_comma(string_line))

def serialize_wd_entity_json(wd_entity):
    return orjson.dumps(wd_entity)

def init_json_array_in_files(file_array) -> None:
    for f in file_array:
        f.write("[\n".encode())
        
def close_json_array_in_files(file_array) -> None:
    for f in file_array:
        f.write("]".encode())

def write_wd_entity_to_file(wd_entity, output_file):
    output_file.write(serialize_wd_entity_json(wd_entity))
    output_file.write(",\n".encode())
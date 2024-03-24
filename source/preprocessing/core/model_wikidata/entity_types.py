from enum import Enum

class EntityTypes(Enum):
    ITEM = 1
    PROPERTY = 2
    UNKNOWN = 3
    
def is_wd_entity_item(id: str):
    if id != None:
        return id.startswith("Q")
    else:
        return False
    
def is_wd_entity_property(id: str):
    if id != None:
        return id.startswith("P")
    else:
        return False
    
def is_wd_entity_item_or_property(id: str):
    if id != None:
        return id.startswith("P") or id.startswith("Q")
    else:
        return False
    

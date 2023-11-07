
from typing import Any
from abc import ABC, abstractmethod

class Context:
    def __init__(self, class_map: dict, property_map: dict) -> None:
        self.class_map = class_map
        self.property_map = property_map

class Modifier(ABC):
    
    def __init__(self, logger) -> None:
        super().__init__()
        self.logger = logger
        self.marker_set = set()
    
    @abstractmethod
    def __call__(self, wd_entity, context: Context) -> None:
        pass
    
    @abstractmethod
    def report_status(self) -> None:
        pass
    
    def filter_existing(self, ids_list, classFlag, context: Context):
        entity_map = context.class_map if classFlag else context.property_map
        present_vals = []
        for id in ids_list:
            if id in entity_map:
                present_vals.append(id)
            else:
                self.logger.info(f"Found missing reference {id} (is Class = {classFlag})")
                self.marker_set.add(id)
        return present_vals
    
    def filter_existing_allowance_map(self, allowance_map, classFlag, context: Context):
        entity_map = context.class_map if classFlag else context.property_map
        present_vals = {}
        for strId in allowance_map.keys():
            numId = int(strId)
            if numId in entity_map:
                present_vals[strId] = allowance_map[strId]
            else:
                self.logger.info(f"Found missing reference {id} (is Class = {classFlag})")
                self.marker_set.add(id)
        return present_vals
    
    def remove_self_cycle(self, wd_entity, field: str, classFlag: bool) -> bool:
        entity_id = wd_entity["id"]
        ids_list: list = wd_entity[field]
        if entity_id in ids_list:
            ids_list.remove(entity_id)
            self.marker_set.add(entity_id)
            self.logger.info(f"Found self reference in {"property" if not classFlag else "class"}:{entity_id} on field: {field}")
            return True
        else:
            return False 
    

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
        self.missing_refs = set()
    
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
                self.missing_refs.add(id)
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
                self.missing_refs.add(id)
        return present_vals
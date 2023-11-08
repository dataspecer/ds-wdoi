
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
    
    def _filter_existing(self, entities_ids_list, entity_map, *, isClass: bool):
        existing_entities_ids = []
        for id in entities_ids_list:
            if id in entity_map:
                existing_entities_ids.append(id)
            else:
                self.logger.info(f"Found missing reference {id} (is Class = {isClass})")
                self.marker_set.add(id)
        return existing_entities_ids
    
    def filter_existing_classes(self, classes_ids_list, classes_map):
        return self._filter_existing(self, classes_ids_list, classes_map, isClass=True)
    
    def filter_existing_properties(self, properties_ids_list, properties_map):
        return self._filter_existing(self, properties_ids_list, properties_map, isClass=False)
    
    def filter_existing_allowance_map(self, allowance_map, properties_map):
        existing_records = {}
        for str_property_id in allowance_map.keys():
            num_property_id = int(str_property_id)
            if num_property_id in properties_map:
                existing_records[str_property_id] = allowance_map[str_property_id]
            else:
                self.logger.info(f"Found missing reference {id} (is Class = {False})")
                self.marker_set.add(id)
        return existing_records
    
    def remove_self_cycle(self, wd_entity, field: str, *, isClass: bool) -> bool:
        entity_id = wd_entity["id"]
        entities_ids_list: list = wd_entity[field]
        if entity_id in entities_ids_list:
            entities_ids_list.remove(entity_id)
            self.marker_set.add(entity_id)
            self.logger.info(f"Found self reference in {"property" if not isClass else "class"}:{entity_id} on field: {field}")
            return True
        else:
            return False 
    

from abc import abstractmethod
from phases.modification.modifiers.context import Context
from phases.modification.modifiers.modifier import Modifier

class ModifierPart(Modifier):
    def __init__(self, logger, context: Context) -> None:
        super().__init__(logger, context)
        self.marker_set = set()
    
    @abstractmethod
    def __call__(self, wd_entity) -> None:
        pass
    
    def _filter_existing(self, entities_ids_list, entities_dict: dict, isClass: bool):
        existing_entities_ids = []
        for id in entities_ids_list:
            if id in entities_dict:
                existing_entities_ids.append(id)
            else:
                self.logger.info(f"Found missing reference {id} (is Class = {isClass})")
                self.marker_set.add(id)
        return existing_entities_ids
    
    def filter_existing_classes(self, classes_ids_list):
        return self._filter_existing(classes_ids_list, self.context.classes_dict, True)
    
    def filter_existing_properties(self, properties_ids_list):
        return self._filter_existing(properties_ids_list, self.context.properties_dict, False)
    
    def filter_existing_allowance_map(self, allowance_map):
        existing_records = {}
        for str_property_id in allowance_map.keys():
            if str_property_id in self.context.properties_dict:
                existing_records[str_property_id] = list(filter(lambda x: x in self.context.properties_dict or x == "0", allowance_map[str_property_id]))
            else:
                self.logger.info(f"Found missing reference {str_property_id} (is Class = {False})")
                self.marker_set.add(str_property_id)
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
    
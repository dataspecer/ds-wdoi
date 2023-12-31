
from abc import abstractmethod
from wikidata.modifications.context import Context
from wikidata.modifications.modifier import Modifier

class ModifierPart(Modifier):
    def __init__(self, logger, context: Context) -> None:
        super().__init__(logger, context)
        self.marker_set = set()
    
    @abstractmethod
    def __call__(self, wd_entity) -> None:
        pass
    
    def _filter_existing(self, entities_ids_list, entity_map: dict, isClass: bool):
        existing_entities_ids = []
        for id in entities_ids_list:
            if id in entity_map:
                existing_entities_ids.append(id)
            else:
                self.logger.info(f"Found missing reference {id} (is Class = {isClass})")
                self.marker_set.add(id)
        return existing_entities_ids
    
    def filter_existing_classes(self, classes_ids_list):
        return self._filter_existing(classes_ids_list, self.context.class_map, True)
    
    def filter_existing_properties(self, properties_ids_list):
        return self._filter_existing(properties_ids_list, self.context.property_map, False)
    
    def filter_existing_allowance_map(self, allowance_map: dict):
        existing_records = {}
        for str_property_id in allowance_map.keys():
            num_property_id = int(str_property_id)
            if num_property_id in self.context.property_map:
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
    
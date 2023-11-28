from typing import Any
from wikidata.modifications.context import Context
from wikidata.modifications.modifier_full import ModifierFull

class Remover(ModifierFull):
    def __init__(self, logger, context: Context) -> None:
        super().__init__(logger, context)
        self.classes_marked_for_removal = set()
        self.classes_removed = set()
        self.properties_marked_for_removal = set()
        self.properties_removed = set()
    
    def remove(self, entity_map: dict, mark_set: set, remove_set: set):
        for entity_id in mark_set:
            if entity_id in entity_map:
                del entity_map[entity_id]
                remove_set.add(entity_id)
                self.logger.info(f"Removed entity {entity_id}")
from typing import Any
from phases.modification.modifiers.context import Context
from phases.modification.modifiers.modifier_all import ModifierAll

class Remover(ModifierAll):
    def __init__(self, logger, context: Context) -> None:
        super().__init__(logger, context)
        self.classes_marked_for_removal = set()
        self.classes_removed = set()
        self.properties_marked_for_removal = set()
        self.properties_removed = set()
    
    def remove(self, entities_dict: dict, mark_set: set, remove_set: set, logging: bool = True):
        for entity_id in mark_set:
            if entity_id in entities_dict:
                del entities_dict[entity_id]
                remove_set.add(entity_id)
                if logging:
                    self.logger.info(f"Removed entity {entity_id}")
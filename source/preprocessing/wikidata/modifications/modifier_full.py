
from typing import Any
from abc import ABC, abstractmethod
from wikidata.modifications.context import Context

"""
Full modifiers are different from part modifiers in terms of they iterate over the context immediately upon the call.
This is because some actions could overlap and destroy their assumption of the context,
e.g. if some parts were removed without any notice.
"""
class ModifierFull(ABC):
    def __init__(self, logger, context: Context) -> None:
        super().__init__()
        self.logger = logger
        self.classes_marked_for_removal = set()
        self.classes_removed = set()
        self.properties_marked_for_removal = set()
        self.properties_removed = set()
        self.context = context
    
    @abstractmethod
    def report_status(self) -> None:
        pass
    
    @abstractmethod
    def modify_all(self) -> None:
        pass
    
    def remove(self, entity_map: dict, mark_set: set, remove_set: set):
        for entity_id in mark_set:
            if entity_id in entity_map:
                del entity_map[entity_id]
                remove_set.add(entity_id)
                self.logger.info(f"Removed entity {entity_id}")
    
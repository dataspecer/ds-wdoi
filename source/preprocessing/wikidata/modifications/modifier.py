from abc import ABC, abstractmethod
from wikidata.modifications.context import *

class Modifier(ABC):
    def __init__(self, logger, context: Context) -> None:
        super().__init__()
        self.logger = logger
        self.context = context
    
    @abstractmethod
    def report_status(self) -> None:
        pass
    
    def add_field_if_missing(self, wd_entity, field):
        if field not in wd_entity:
            wd_entity[field] = []
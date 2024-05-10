from abc import ABC, abstractmethod
from phases.modification.modifiers.context import *

class Modifier(ABC):
    def __init__(self, logger, context: Context, logging_on: bool) -> None:
        super().__init__()
        self.logger = logger
        self.context = context
        self.logging_on = logging_on
    
    @abstractmethod
    def report_status(self) -> None:
        pass
    
    def add_field_if_missing(self, wd_entity, field):
        if field not in wd_entity:
            wd_entity[field] = []
            
    def try_log(self, message):
        if self.logging_on:
            self.logger.info(message)
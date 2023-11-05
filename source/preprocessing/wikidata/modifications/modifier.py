
from typing import Any
from abc import ABC, abstractmethod

class Context:
    def __init__(self, class_map: dict, property_map: dict) -> None:
        self.class_map = class_map
        self.property_map = property_map

class Modifier(ABC):
    @abstractmethod
    def __call__(self, wd_entity, context: Context) -> None:
        pass
    
    @abstractmethod
    def report_status(self) -> None:
        pass
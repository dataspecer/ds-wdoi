from abc import abstractmethod
from phases.modification.modifiers.modifier import Modifier
from phases.modification.modifiers.context import *

"""
Full modifiers are different from part modifiers in terms of they iterate over the context immediately upon the call.
This is because some actions could overlap and destroy their assumption of the context,
e.g. if some parts were removed without any notice.
"""
class ModifierAll(Modifier):
    def __init__(self, logger, context: Context) -> None:
        super().__init__(logger, context)
    
    @abstractmethod
    def modify_all(self) -> None:
        pass
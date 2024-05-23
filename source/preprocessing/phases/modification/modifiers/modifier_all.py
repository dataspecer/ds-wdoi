from abc import abstractmethod
from phases.modification.modifiers.modifier import Modifier
from phases.modification.modifiers.context import *

class ModifierAll(Modifier):
    """
    Full modifiers are different from part modifiers in terms of they iterate over the context immediately upon the call.
    This is because some actions could overlap and destroy their assumption of the context,
    e.g. if some parts were removed without any notice.
    """
    
    def __init__(self, logger, context: Context, logging_on: bool) -> None:
        super().__init__(logger, context, logging_on)
    
    @abstractmethod
    def modify_all(self) -> None:
        pass
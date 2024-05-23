from phases.modification.modifiers.modifier_part import ModifierPart
from phases.modification.modifiers.context import Context
from core.model_simplified.classes import ClassFields

class RemoveSelfCyclesClass(ModifierPart):
    """
    This should be run before removing unexisitng references or marking children.
    """
    
    def __init__(self, logger, context: Context, logging_on: bool) -> None:
        super().__init__(logger.getChild("remove_self_cycles_class"), context, logging_on)
        
    def __call__(self, wd_class) -> None:
        self.remove_self_cycle(wd_class, ClassFields.SUBCLASS_OF.value, isClass=True)
        self.remove_self_cycle(wd_class, ClassFields.INSTANCE_OF.value, isClass=True)
    
    def report_status(self) -> None:
        self.logger.info(f"Found {len(self.marker_set)} self cycles in classes")
        
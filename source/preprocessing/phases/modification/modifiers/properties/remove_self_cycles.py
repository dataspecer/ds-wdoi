from phases.modification.modifiers.modifier_part import ModifierPart
from phases.modification.modifiers.context import Context
from core.model_simplified.properties import PropertyFields
from core.model_simplified.constraints import GenConstFields, ItemConstFields

"""
This should be run before removing unexisitng references or marking children.
"""
class RemoveSelfCyclesProperty(ModifierPart):
    def __init__(self, logger, context: Context) -> None:
        super().__init__(logger.getChild("remove_self_cycles_property"), context)
        
    def __call__(self, wd_property) -> None:
        self.remove_self_cycle(wd_property, PropertyFields.SUBPROPERTY_OF.value, isClass=False)
    
    def report_status(self) -> None:
        self.logger.info(f"Found {len(self.marker_set)} self cycles in properties")
        
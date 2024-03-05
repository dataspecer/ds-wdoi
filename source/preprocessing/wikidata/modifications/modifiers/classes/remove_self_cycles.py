from wikidata.modifications.modifier_part import ModifierPart
from wikidata.modifications.context import Context
from wikidata.model_simplified.classes import ClassFields

"""
This should be run before removing unexisitng references or marking children.
"""
class RemoveSelfCyclesClass(ModifierPart):
    def __init__(self, logger, context: Context) -> None:
        super().__init__(logger.getChild("remove-self-cycles-class"), context)
        
    def __call__(self, wd_class) -> None:
        self.remove_self_cycle(wd_class, ClassFields.SUBCLASS_OF.value, isClass=True)
        self.remove_self_cycle(wd_class, ClassFields.INSTANCE_OF.value, isClass=True)
    
    def report_status(self) -> None:
        self.logger.info(f"Found {len(self.marker_set)} self cycles in classes")
        
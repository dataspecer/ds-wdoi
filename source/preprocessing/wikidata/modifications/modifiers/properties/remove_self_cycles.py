from wikidata.modifications.modifier_part import ModifierPart
from wikidata.modifications.context import Context
from wikidata.model_simplified.properties import PropertyFields
from wikidata.model_simplified.constraints import GenConstFields, ItemConstFields

"""
This should be run before removing unexisitng references or marking children.
"""
class RemoveSelfCyclesProperty(ModifierPart):
    def __init__(self, logger, context: Context) -> None:
        super().__init__(logger.getChild("remove-self-cycles-property"), context)
        
    def __call__(self, wd_entity) -> None:
        self.remove_self_cycle(wd_entity, PropertyFields.SUBPROPERTY_OF.value, isClass=False)
    
    def report_status(self) -> None:
        self.logger.info(f"Found {len(self.marker_set)} self cycles in properties")
        
from wikidata.modifications.modifier_part import ModifierPart
from wikidata.modifications.context import Context
from wikidata.model_simplified.properties import PropertyFields
from wikidata.model_simplified.constraints import GenConstFields, ItemConstFields

class RemoveUnexistingReferencesGeneralConstraintsProperties(ModifierPart):
    def __init__(self, logger,  context: Context) -> None:
        super().__init__(logger.getChild("rer-properties-general-constraints"), context)
    
    def __call__(self, wd_property) -> None:
        constraints = wd_property[PropertyFields.CONSTRAINTS.value]
        
        constraints[GenConstFields.ALLOWED_QUALIFIERS.value] = self.filter_existing_properties(constraints[GenConstFields.ALLOWED_QUALIFIERS.value])
        constraints[GenConstFields.REQUIRED_QUALIFIERS.value] = self.filter_existing_properties(constraints[GenConstFields.REQUIRED_QUALIFIERS.value])
        
        constraints[GenConstFields.SUBJECT_TYPE.value]['instanceOf'] = self.filter_existing_classes(constraints[GenConstFields.SUBJECT_TYPE.value]['instanceOf'])
        constraints[GenConstFields.SUBJECT_TYPE.value]['subclassOf'] = self.filter_existing_classes(constraints[GenConstFields.SUBJECT_TYPE.value]['subclassOf'])
        constraints[GenConstFields.SUBJECT_TYPE.value]['subclassOfInstanceOf'] = self.filter_existing_classes(constraints[GenConstFields.SUBJECT_TYPE.value]['subclassOfInstanceOf'])
        
        constraints[GenConstFields.SUBJECT_TYPE_STATS.value] = self.filter_existing_classes(constraints[GenConstFields.SUBJECT_TYPE_STATS.value])
        
        constraints[GenConstFields.ITEM_REQUIRES_STATEMENT.value] = self.filter_existing_allowance_map(constraints[GenConstFields.ITEM_REQUIRES_STATEMENT.value])
        constraints[GenConstFields.CONFLICTS_WITH.value] = self.filter_existing_allowance_map(constraints[GenConstFields.CONFLICTS_WITH.value])
    
    def report_status(self) -> None:
        self.logger.info(f"Missing {len(self.marker_set)} general constraints references")
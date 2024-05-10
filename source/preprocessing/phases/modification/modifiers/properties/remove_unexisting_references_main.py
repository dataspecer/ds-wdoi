from phases.modification.modifiers.modifier_part import ModifierPart
from phases.modification.modifiers.context import Context
from core.model_simplified.properties import PropertyFields

class RemoveUnexistingReferencesMainProperties(ModifierPart):
    def __init__(self, logger,  context: Context, logging_on: bool) -> None:
        super().__init__(logger.getChild("rer_properties_main"), context, logging_on)
    
    def __call__(self, wd_property) -> None:
        wd_property[PropertyFields.INSTANCE_OF.value] = self.filter_existing_classes(wd_property[PropertyFields.INSTANCE_OF.value])
        wd_property[PropertyFields.RELATED_PROPERTY.value] = self.filter_existing_properties(wd_property[PropertyFields.RELATED_PROPERTY.value])
        wd_property[PropertyFields.SUBPROPERTY_OF.value] = self.filter_existing_properties(wd_property[PropertyFields.SUBPROPERTY_OF.value])
        wd_property[PropertyFields.INVERSE_PROPERTY.value] = self.filter_existing_properties(wd_property[PropertyFields.INVERSE_PROPERTY.value])
        wd_property[PropertyFields.COMPLEMENTARY_PROPERTY.value] = self.filter_existing_properties(wd_property[PropertyFields.COMPLEMENTARY_PROPERTY.value])
        wd_property[PropertyFields.NEGATES_PROPERTY.value] = self.filter_existing_properties(wd_property[PropertyFields.NEGATES_PROPERTY.value])
    
    def report_status(self) -> None:
        self.logger.info(f"Missing {len(self.marker_set)} main property references")
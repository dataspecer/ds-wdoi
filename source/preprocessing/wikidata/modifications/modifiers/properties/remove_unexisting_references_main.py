from wikidata.modifications.modifier_part import ModifierPart
from wikidata.modifications.context import Context
from wikidata.model_simplified.properties import PropertyFields
from wikidata.model_simplified.constraints import GenConstFields, ItemConstFields
class RemoveUnexistingReferencesMainProperties(ModifierPart):
    def __init__(self, logger,  context: Context) -> None:
        super().__init__(logger.getChild("rer-properties-main"), context)
    
    def __call__(self, wd_property) -> None:
        wd_property[PropertyFields.INSTANCE_OF.value] = self.filter_existing_classes(wd_property[PropertyFields.INSTANCE_OF.value])
        wd_property[PropertyFields.RELATED_PROPERTY.value] = self.filter_existing_properties(wd_property[PropertyFields.RELATED_PROPERTY.value])
        wd_property[PropertyFields.SUBPROPERTY_OF.value] = self.filter_existing_properties(wd_property[PropertyFields.SUBPROPERTY_OF.value])
        wd_property[PropertyFields.INVERSE_PROPERTY.value] = self.filter_existing_properties(wd_property[PropertyFields.INVERSE_PROPERTY.value])
        wd_property[PropertyFields.COMPLEMENTARY_PROPERTY.value] = self.filter_existing_properties(wd_property[PropertyFields.COMPLEMENTARY_PROPERTY.value])
        wd_property[PropertyFields.NEGATES_PROPERTY.value] = self.filter_existing_properties(wd_property[PropertyFields.NEGATES_PROPERTY.value])
    
    def report_status(self) -> None:
        self.logger.info(f"Missing {len(self.marker_set)} main property references")
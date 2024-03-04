from wikidata.modifications.modifier_part import ModifierPart
from wikidata.modifications.context import Context
from wikidata.model_simplified.properties import PropertyFields
from wikidata.model_simplified.constraints import GenConstFields, ItemConstFields

"""
This should be run after removing unexisting references, self cycles and assigment of fields.
"""
class MarkSubpropertiesToParents(ModifierPart):
    
    def __init__(self, logger, context: Context) -> None:
        super().__init__(logger.getChild("mark-subproperties-to-parents"), context)
        
    def __call__(self, wd_entity) -> None:
        entityId = wd_entity[PropertyFields.ID.value]
        self.add_field_if_missing(wd_entity, PropertyFields.SUBPROPERTIES.value)
        for parentId in wd_entity[PropertyFields.SUBPROPERTY_OF.value]:
            if parentId in self.context.property_map:
                parent = self.context.property_map[parentId]
                self.add_field_if_missing(parent, PropertyFields.SUBPROPERTIES.value)
                parent[PropertyFields.SUBPROPERTIES.value].append(entityId)
            else:
                self.logger.info(f"Missing property {parentId}")
                self.marker_set.add(parentId)
    
    def report_status(self) -> None:
        self.logger.info(f"Missing {len(self.marker_set)} parents of subproperties")
        
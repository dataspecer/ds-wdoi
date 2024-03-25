from phases.modification.modifiers.modifier_part import ModifierPart
from phases.modification.modifiers.context import Context
from core.model_simplified.properties import PropertyFields
from core.model_simplified.constraints import GenConstFields, ItemConstFields

"""
This should be run after removing unexisting references, self cycles and assigment of fields.
"""
class MarkSubpropertiesToParents(ModifierPart):
    
    def __init__(self, logger, context: Context) -> None:
        super().__init__(logger.getChild("mark-subproperties-to-parents"), context)
        
    def __call__(self, wd_property) -> None:
        entityId = wd_property[PropertyFields.ID.value]
        self.add_field_if_missing(wd_property, PropertyFields.SUBPROPERTIES.value)
        for parentId in wd_property[PropertyFields.SUBPROPERTY_OF.value]:
            if parentId in self.context.properties_dict:
                parent = self.context.properties_dict[parentId]
                self.add_field_if_missing(parent, PropertyFields.SUBPROPERTIES.value)
                parent[PropertyFields.SUBPROPERTIES.value].append(entityId)
            else:
                self.logger.info(f"Missing property {parentId}")
                self.marker_set.add(parentId)
    
    def report_status(self) -> None:
        self.logger.info(f"Missing {len(self.marker_set)} parents of subproperties")
        
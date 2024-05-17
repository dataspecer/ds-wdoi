from enum import StrEnum
from core.model_simplified.properties import PropertyFields

class DataPropertyFields(StrEnum):
    CLASSES_DEFINING_USAGE = "classesDefiningUsage"
    LEXICALIZATION = "lexicalization"
    DENSE_VECTOR = "denseVector"
    
    ID = "id"
    ALIASES = "aliases"
    LABELS = "labels"
    DESCRIPTIONS = "descriptions"
    
    INSTANCE_USAGE_COUNT = "usageCount"
    
    
# Copy data and prepare to be used by the preperation.
def transform_wd_property(wd_property):
    return {
        DataPropertyFields.ID.value: wd_property[PropertyFields.ID.value],
        DataPropertyFields.LABELS.value: wd_property[PropertyFields.LABELS.value],
        DataPropertyFields.ALIASES.value: wd_property[PropertyFields.ALIASES.value],
        DataPropertyFields.DESCRIPTIONS.value: wd_property[PropertyFields.DESCRIPTIONS.value],
        
        DataPropertyFields.INSTANCE_USAGE_COUNT.value: wd_property[PropertyFields.INSTANCE_USAGE_COUNT.value],
        
        # Starts with empty, since they will be added after reduction.
        DataPropertyFields.CLASSES_DEFINING_USAGE.value: []
    }

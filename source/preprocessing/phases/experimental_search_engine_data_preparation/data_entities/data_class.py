from enum import StrEnum
from core.model_simplified.classes import ClassFields

class DataClassFields(StrEnum):
    OWN_PROPERTIES = "ownProperties"
    ANCESTORS_DEFINING_PROPERTIES = "ancestorsDefiningProperties"
    
    LEXICALIZATION = "lexicalization"
    DENSE_VECTOR = "denseVector"
    SPARSE_VECTOR = "sparseVector"
    
    ID = "id"
    ALIASES = "aliases"
    LABELS = "labels"
    DESCRIPTIONS = "descriptions"
    SUBCLASS_OF = "subclassOf"

    INSTANCE_COUNT = "instanceCount"
    SITELINKS_COUNT = "sitelinksCount"
    INLINKS_COUNT = "inlinksCount"
    EQUIVALENT_CLASS_COUNT = "equivalentClassCount"
    
    HAS_EFFECT = 'hasEffect'
    HAS_CAUSE = 'hasCause'
    HAS_CHARACTERISTICS = 'hasCharacteristics'
    HAS_PARTS = 'hasParts'
    PART_OF = 'partOf'
    HAS_USE = "hasUse"

def transform_wd_class(wd_class): 
    return {
        DataClassFields.ID.value: wd_class[ClassFields.ID.value],
        DataClassFields.LABELS.value: wd_class[ClassFields.LABELS.value],
        DataClassFields.ALIASES.value: wd_class[ClassFields.ALIASES.value],
        DataClassFields.DESCRIPTIONS.value: wd_class[ClassFields.DESCRIPTIONS.value],
        DataClassFields.SUBCLASS_OF.value: wd_class[ClassFields.SUBCLASS_OF.value],
        
        DataClassFields.HAS_CAUSE.value: wd_class[ClassFields.HAS_CAUSE.value],
        DataClassFields.HAS_CHARACTERISTICS.value: wd_class[ClassFields.HAS_CHARACTERISTICS.value],
        DataClassFields.HAS_EFFECT.value: wd_class[ClassFields.HAS_EFFECT.value],
        DataClassFields.HAS_USE.value: wd_class[ClassFields.HAS_USE.value],
        DataClassFields.HAS_PARTS.value: wd_class[ClassFields.HAS_PARTS.value],
        DataClassFields.PART_OF.value: wd_class[ClassFields.PART_OF.value],
        
        DataClassFields.INSTANCE_COUNT.value: wd_class[ClassFields.INSTANCE_COUNT.value],
        DataClassFields.SITELINKS_COUNT.value: wd_class[ClassFields.SITELINKS_COUNT.value],
        DataClassFields.INLINKS_COUNT.value: wd_class[ClassFields.INLINKS_COUNT.value],
        DataClassFields.EQUIVALENT_CLASS_COUNT.value: len(wd_class[ClassFields.EQUIVALENT_CLASS.value]),


        # Will be transformed to list after reduction.
        DataClassFields.OWN_PROPERTIES.value: set(wd_class[ClassFields.SUBJECT_OF_STATS.value] + wd_class[ClassFields.VALUE_OF_STATS.value]),
        
        # Starts with empty, since they will be added after reduction.
        DataClassFields.ANCESTORS_DEFINING_PROPERTIES.value: []
    }
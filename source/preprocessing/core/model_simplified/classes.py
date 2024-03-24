from enum import StrEnum

class ClassFields(StrEnum):
    ID = "id"
    IRI = "iri"
    ALIASES = "aliases"
    LABELS = "labels"
    DESCRIPTIONS = "descriptions"
    INSTANCE_OF = "instanceOf"
    SUBCLASS_OF = "subclassOf"
    PROPERTIES_FOR_THIS_TYPE = "propertiesForThisType"
    EQUIVALENT_CLASS = "equivalentClass"
    CHILDREN = "children"
    SUBJECT_OF = "subjectOf"
    SUBJECT_OF_PROBS = 'subjectOfProbs'
    VALUE_OF = "valueOf"
    SUBJECT_OF_STATS = "subjectOfStats"
    SUBJECT_OF_STATS_SCORES = "subjectOfStatsScores"
    VALUE_OF_STATS = "valueOfStats"
    VALUE_OF_STATS_SCORES = "valueOfStatsScores"
    INSTANCES = "instances"
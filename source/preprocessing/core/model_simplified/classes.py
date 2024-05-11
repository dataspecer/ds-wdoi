from enum import StrEnum

class ClassFields(StrEnum):
    
    # Added in extraction phase
    
    # A numeric identifier of the class.
    ID = "id"
    # A iri of the class, can be dereferenced to the Wikidata page.
    IRI = "iri"
    # Aliases of the class in different languages { "en": [string, ...], "cs": [...], ...}
    ALIASES = "aliases"
    # Label of the class in different languages { "en": string, "cs": string, ...}
    LABELS = "labels"
    # Description of the class in different languages { "en": string, "cs": string, ...}
    DESCRIPTIONS = "descriptions"
    # Numeric identifiers of classes that the class is instance of.
    INSTANCE_OF = "instanceOf"
    # Numeric identifiers of classes that the class is subclass of.
    SUBCLASS_OF = "subclassOf"
    # String URIs of external classes that are the same as the class.
    EQUIVALENT_CLASS = "equivalentClass"
    # Numeric identifiers of properties that are widely used on the class.
    PROPERTIES_FOR_THIS_TYPE = "propertiesForThisType"
    
    # Added in modification phase
    
    # Numeric identifiers of classes that are children of the class.
    CHILDREN = "children"
    # Numeric identifiers of classes that are instance of the class.
    INSTANCES = "instances"
    # Numeric identifiers of properties that this class is a subject of based on Wikidata property constraints.
    SUBJECT_OF_CONSTS = "subjectOfConsts"
    # Numeric identifiers of properties that this class is a value of based on Wikidata property constraints.
    VALUE_OF_CONSTS = "valueOfConsts"
    
    # Added in modification phase during merging of statistics
    
    # Numeric identifiers of properties that this class is a subject of based on property usage statistics.
    # Sorted based on their scores on this class.
    SUBJECT_OF_STATS = "subjectOfStats"
    # Properties with scores and ranges that this class is a subject of based on property usage statistics.
    # The properties are the same as in SUBJECT_OF_STATS, but containing the scores and ranges.
    SUBJECT_OF_STATS_SCORES = "subjectOfStatsScores"
    # Properties with scores and ranges that this class is a subject of based on property usage statistics.
    # Sorted based on their scores on this class.
    VALUE_OF_STATS = "valueOfStats"
    # Properties with scores and ranges that this class is a subject of based on property usage statistics.
    # The properties are the same as in SUBJECT_OF_STATS, but containing the scores and ranges.
    VALUE_OF_STATS_SCORES = "valueOfStatsScores"
    
    # Counts from property usage statistics added during modification phase during merging.
    
    # Number of instances
    INSTANCE_COUNT = "instanceCount"
    # Number of Wikidata sitelinks
    SITELINKS_COUNT = "sitelinksCount"
    # Number of times a property was pointing directly to a class.
    INLINKS_COUNT = "inlinksCount"
    # Number of times a property was pointing to an instance of a class.
    INSTANCE_INLINKS_COUNT = "instanceInlinksCount"
    # Number of statements on a class.
    STATEMENT_COUNT = "statementCount"
    # Number of statements on instances of a class.
    INSTANCE_STATEMENT_COUNT = "instanceStatementCount"
    
    # Additional identifiers used for the loading phase - extension of descriptions.
    
    HAS_EFFECT = 'hasEffect'
    HAS_CAUSE = 'hasCause'
    HAS_CHARACTERISTICS = 'hasCharacteristics'
    HAS_PARTS = 'hasParts'
    PART_OF = 'partOf'
    HAS_USE = "hasUse"
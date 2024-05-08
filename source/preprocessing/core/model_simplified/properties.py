from enum import StrEnum

class PropertyFields(StrEnum):
    # A numeric identifier of the property.
    ID = "id"
    # A iri of the property, can be dereferenced to the Wikidata page.
    IRI = "iri"
    # Aliases of the class in different languages { "en": [string, ...], "cs": [...], ...}
    ALIASES = "aliases"
    # Label of the class in different languages { "en": string, "cs": string, ...}
    LABELS = "labels"
    # Description of the class in different languages { "en": string, "cs": string, ...}
    DESCRIPTIONS = "descriptions"
    # Wikidata datatype numeric identifier.
    DATATYPE = "datatype"
    # Wikidata underlying type numeric identifier.
    UNDERLYING_TYPE = "underlyingType"
    # Numeric identifiers of classes that the property is instance of - groupings.
    INSTANCE_OF = "instanceOf"
    
    # Numeric identifiers of properties that the property is subproperty of.
    SUBPROPERTY_OF = "subpropertyOf"
    # Numeric identifiers of properties that are subproperties of the property.
    SUBPROPERTIES = 'subproperties'
    RELATED_PROPERTY = "relatedProperty"
    INVERSE_PROPERTY = "inverseProperty"
    COMPLEMENTARY_PROPERTY = "complementaryProperty"
    NEGATES_PROPERTY = "negatesProperty"
    EQUIVALENT_PROPERTY = "equivalentProperty"
    
    # Wikidata property constraints.
    CONSTRAINTS = "constraints"
    
    # Number of usages of the properties.
    INSTANCE_USAGE_COUNT = "usageCount"
    
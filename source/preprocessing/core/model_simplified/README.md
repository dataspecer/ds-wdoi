# Model simplified

- The simplified model contains an enum class for each entity - class, property, constraint type and property scores.
- The easiest take on the simplified model is that it is a flattening of the proprietary Wikidata model.
- Each identifier from the Wikidata model is reduced to a `int` identifier to omit repetitions of string identifiers.
- The enum classes represents fields for each of the entity.
- We use the enum fields instead of Python classes since if was easier to work with rather than mapping everything strictly to a Python class.
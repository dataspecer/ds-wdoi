# Identification and separation with statistics phase

The two phases are separate since we do not know what entities are classes.
The identification phase identifies the classes and properties.
The separation phase separates the entities into new files.
During the phases, each entity is interleft with statistics computation of property usage.

## Identification phase

The first pass of the Wikidata dump.
It iterates over each entity in the dump and identifies classes and properties to be separated in the subsequent phases.
It also interleaves to the property usage statistics computation for each entity.

- The first phase considers an entity as a class when ([an exhaustive list based on Wikidata modelling project](https://www.wikidata.org/wiki/Wikidata:WikiProject_Ontology/Modelling)):
  - The entity is an instance of a metaclass of a class, or
  - The entity is a value of an instance of statement in any item, or
  - The entity is a value of a subclass of statement in any item, or
  - The entity contains a subclass of statement
- Properties are all extracted except:
    - `subclass of` and `instance of`
        - since it would cause serious memory usage during the computation of the statistics and their general usage.
    - Properties with type `Lexeme`, `Senses`, `Forms` 
        - Since they do not conform to the Dataspecer model.
        - In the future they could be included.

## Separation phase

The second pass of the dump file.
It separates the identified classes and properties from the dump to new files preserving the Wikidata model.
Thus creating a much smaller files that are easier to handle.

- Note that inside property constraints can be invalid classes based on the definition of a class.
- There can be also references to items that do not exists in the dump.
- The two phases are separate because we do not know which entities are classes.
- The output files of the second phase contain reduced entities:
  - `sitelinks` are removed from classes only, since properties do not contain sitelinks.
  - Since we do not use sitelinks in the application.
# Preprocessing

The preprocessing is done in three phases:

1. Extraction of classes and properties Ids into a set.
2. The set is then passes to a second phase which extracts the classes and properties into two files.
3. The extracted classes and properties are then transformed into objects that will serve as input to the server.
4. Upon the transformed classes it does semantic modification of the classes and properties.
5. Precomputation of property recommendations
6. Load labels, aliases and description into a search service (Elastic search right now).

> Note: 
> 1. Types of the properties are not checked, since wikidata does not allow to entry value that do not match the type. Such as: placing a property into subclass of statement.
> 2. I consider only the unique values from extracted properties.

## Extraction (1. and 2. phase)

The part contains 1. and 2. phase.
The main script is `1_2_extraction.py`

- input:
  - a path to the wikidata json dump in bz2 format
  - Example of running:
    
        $> python 1_2_extraction.py latest-all.json.bz2

- output:
  - `classes.json.bz2`
  - `properties.json.bz2`
  - Each output file contains an json array where on each line is a wikidata entity.
  - Example:

        [
        { ... },
        { ... },
        { ... },
        ...
        ]

- logging:
  - the logging takes place into `info_ex.log` file 

### Extraction comments

- The first phase considers a class as an entity (an exhaustive list):
  - that is an instance of a metaclass of a class, or
  - that is a value of a instance of property in any item, or
  - that is a value of a subclass of property in any item, or
  - that contains a subclass of statement
- Note that inside property constraints can be invalid classes based on the definition of a class.
- There can be also references to items that do not exists in the dump.
- The two phases are separate because we do not know which entities are classes
- The output files of the second phase contain reduced entities:
  - `sitelinks` are removed since there is no usage directly to the ontology

## Transformation (3. phase)

The part contain 3. phase which is conducted in two steps.
The first step transforms classes and the second step transforms properties.
The main script is `3_transformation.py`.

- input:
  - optional argument for languages extracration
    - `--lang`
    - accepts a list of space separated language shortcuts
      - e.g. `--lang en cs de`
    - defaults to `--lang en`
    - for available shortcuts refer to the [Wikidata language lists](https://www.wikidata.org/wiki/Help:Wikimedia_language_codes/lists/all)
  - a required parameter one of `["cls", "props", "both"]`
    - based on the parameter either the first or the second phase is skipped.
    - for conducting only specific transformation:
      - classes transformation - use `cls`
      - properties transformation - use `props`
      - for both transformations - use `both`
  - required paths to `classes.json.bz2` and `properties.json.bz2` in the given order

        $> python 3_transformation.py both classes.json.bz2 properties.json.bz2

        or

        $> python 3_transformation.py --langs en -- both classes.json.bz2 properties.json.bz2


- output:
  - `classes-tran.json`
  - `properties-tran.json`
  - the files are in the same format as in phase 1. 2. except there are not compressed

- logging:
  - the logging takes place into `info_tran.log` file 


### Transformation comments

- The language option denotes that it transforms and includes only `aliases`, `descriptions` and `labels` in the selected languages.
- Each time entity ids are used, it transformes them into numeric values to reduce the number of strings inside application that further processed the data.
  - The application needs to know whether the ids are of a class or of a property.
- For classes it includes:
  - aliases
  - labels
  - descriptions
  - instance of values
  - subclass of values
  - properties for this type
  - equivalent class (external ontology mapping)
- For properties it includes:
  - aliases
  - labels
  - descriptions
  - datatype
  - underlying type
  - instance of values
  - subproperty of values
  - related property values
  - equivalent property (external ontology mapping)
  - constraints
    - general constraints:
      - property scope - allowed placement usage - main value, qualifier, reference
      - allowed entity types - the property can be used on certain entity types - for us only Item is main focus
      - conflicts with - contains a map of `(key=property): (value=[ids])` pairs which denotes that if the property is used, the property from the constraint cannot be used or cannot be used with the given values
      - item requires statement - the negation of conflicts with
      - subject type
      - types based:
        - item:
          - value type
          - none of / one of
          - inverse 
          - symmetric
          - value requires statement
        - string: (empty)
        - quantity: (empty)
        - time: (empty)
- What might be a good idea to add?
  - exact match (external ontology mapping)
  - external subproperty of (external ontology mapping)
  - external superproperty of (external ontology mapping)
  - part of / has parts?
  - facet of
  - constraints for other types than item

## Semantic modification (4. phase)

The phase loads all the transformed data into a memory and does a semantic checking and modification to the entities.
Subsequently it saves them to two files. Which then can be loaded to the server instance and to the ES search.
This phase was moved here from server, because this part also takes quite a bit of time (which was unexpected at first).
The main script is `4_modification.py`

- input:
  - required paths to `classes-tran.json` and `properties-tran.json` in the given order from the third phase

        $> python 4_modification.py classes-tran.json properties-tran.json

- output:
  - `classes-mod.json`
  - `properties-mod.json`

- logging:
  - the logging takes place into `info_mod.log` file

### Modification comments

- The script itself works in phases that depend on one another.
  1. Remove all entities that have no label, thus cannot be search for or displayed unless you know the specific numeric id.
  2. Prepare ground for removing unrooted classes:
     1. Add fields to each class: `children`, `subjectOf` and `valueOf`. Each field is used by subsequent phases.
     2. Remove unexisting references from `subclassOf`, `propertiesForThisType` and `instanceOf` fields.
     3. Remove self cycles of `instanceOf` and `subclassOf`.
     4. Mark children to parents, so the hierarchy could be traversed in both directions.
  3. Remove unrooted classes, which poluted the root entity during traversing upwards.
  4. Post removing unrooted classes:
     1. Remove unexisting references again in case it referenced the unrooted entity.
     2. Check that all classes are rooted and that the root is still present.
  5. Modify properties
     1. remove unexisting references from the main statements
     2. remove unexisting references from the general constraints
     3. remove unexisting references from the item constraints
     4. removing self cycles from `subpropertyO
  
The removing references parts are done in order to exclude entities that were not present in the dump during its creation (it is a continual process during live hours).
If the transformation phase adds more fields to entities, it is necessary to evaluate whether they need checks.
The phases as of now are dependend on each other as well as the order of operation inside them.
The `removers` iterate over the entire ontology, in contrast with the modifiers which are stacked and used per entity basis.
This was done because it was easier to maintain certain invariants of other modifications.
The iteration over ontology is done multiple times, but still the time is uncomparable with the first and second phase.

## Precomputing recommendations (5. phase)

The phase precomputes order of properties for classes using SchemaTree recommender.
It also produces global rankings of all properties from the subject point of view and the value point of view.

The main script is `5_property_recommendations.py`.

- input:
  - required paths to `classes.json` and `properties.json` in the given order from the fourth phase

        $> python 5_property_recommendations.py classes-mod.json properties-mod.json

- output:
  - `classes-recs.json`
  - `properties-recs.json`
  - `global-recs-subject.json`
  - `global-recs-value.json`

- logging:
  - the logging takes place into `info_recs.log` file

## Comments

For each class the recommender's api is called which returns the most probable properties for the given class.
It then takes a look into the `subjectOf` field and sorts the property ids in descending order based on the score.
For each property in the `subjectOf` field it regards, firstly, the local recommendations score, secondly, if the local recommendations for the property are missing it searches global rankings of properties.
For the `valueOf` field, it computes recommendations based on the `subjectType` constraint in a way, that it walks through the classes in the contraint and collects local recommendations for the given property on the class or consults global rankings, subsequently it computes average of all such properties.

The resulting files contain also the global rankings for properties in the subject point of view and the computed rankings from the `valueOf` fields.

## Loading into search service (6. phase)

The phase loads labels and aliases into a search service - elastic search. Assuming the Elastic search runs on client from `utils.elastic_search.py`.
The main script is `5_loading.py`

- inputs:
  - optional argument for languages extracration
    - This parameter should always be equal to the one used in phase 3, since during development I use the scripts separately. Using it without the values from phase 3 could lead to missing certain classes during search. The option is present because the script needs to know the languages used beforehand, so it could create valid ES objects for classes.
    - `--lang`
    - accepts a list of space separated language shortcuts
      - e.g. `--lang en cs de`
    - defaults to `--lang en`
    - for available shortcuts refer to the [Wikidata language lists](https://www.wikidata.org/wiki/Help:Wikimedia_language_codes/lists/all)
    - it should be the same value as was given in the previous phase.
  - paths to the two files generated in the previous step - `classes.json` and `properties.json`

        $> python loading.py classes.json properties.json

- outputs:
  - none

- logging:
  - the logging takes place into `info_load.log` file 

### Helper scripts

This phase contains helper scipt `loading_es_helpers.py`
It either creates, refreshes or deletes classes and properties indices.

- Usage:

      # Creating indices
      &> python loading_es_helpers.py create

      # Deleting everything
      &> python loading_es_helpers.py delete

      # Refreshing the indices
      &> python loading_es_helpers.py refresh

      # Searching the class index
      &> python loading_es_helpers.py search "query string goes here"

      # Listing indices
      &> python loading_es_helpers.py list

      # List mappings of indices
      &> python loading_es_helpers.py mappings


### Loading comments

For each Wikidata entity an object is generated that serves as an input to the Elastic search instance.
The object contains labels and aliases for all the selected languguages. 
There could be also descriptions but the search somehow was overtaken by the descriptions and resulted in not so relevant class search.
Each language has its own nested object with the above mentioned fields.
If the values are missing from the Wikidata entity, a default value is used - empty string for description and label, empty array for aliases.
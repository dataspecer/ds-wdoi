# Preprocessing

The preprocessing is done in six phases:

1. Identification 
   - the first pass of the dump 
     - identification of classes and properties
     - *property usage statistics*
        - store instance of values for each entity in the dump for further processing 
2. Separation
   -  the second pass of the dump 
      -  separation of classes and properties from the dump into two new files preserving the Wikidata data model
      -  *property usage statistics*
           - store property usage for domain and range of classes
           - compute summary from the stored property usage for each class and property   
3. Extraction 
   - the data from separated wikidata classes and properties are extracted into a simplified data model
4. Modification
   - semantic and structural modifications are done on the simplified data model
5. Property Recommendations
   - merging of recommendations from property usage statistics with property constraints
   - boosting "properties for this type" properties
6. Loading to ElasticSearch
   - load labels and aliases into ElasticSearch service

> Note: 
> 1. During 1. and 2. phase, there are running statistics for property usage happening during the dump pases. The statistics run with during 1. and 2. phase to reduce time of the computation.
> 2. The types of property values are not checked, since the Wikidata does not allow to entry value that do not match the property type. Such as: placing a property into subclass of statement.
> 3. I consider only the unique values from extracted properties.

- **Logging**:
  - Everything is logged into `log.log` file and console (`std_out`).
  - Errors also logged separately into `log_errors.log`.
  - Each phase is prefixed with a string identifier.

## Identification and separation with statistics (1. and 2. phase)

The part contains 1. and 2. phase with computation of property usage statistics.
The statistics is run during the phases to reduce time of the statistics computation.
The main script is `p_identification_separation.py`

- input:
  - a path to the wikidata json dump in `.gz` format
  - Example of running:
    
        $> python p_identification_separation.py latest-all.json.gz

- output:
  - separated classes and propeties
    - `classes.json.gz`
    - `properties.json.gz`
    - Each output file contains an json array where on each line is a wikidata entity.
    - Example:

          [
          { ... },
          { ... },
          { ... },
          ...
          ]
  - statistics summaries
    - `classes-property-usage.json`
      - contains property usage summary for each class with probabilities
    - `properties-domain-range-usage.json`
      - contains domain and range statistics for each property without probabilities

- logging prefix: `identification_separation`

### Identification and separation comments

- The first phase considers an entity as a class when (an exhaustive list):
  - the entity is an instance of a metaclass of a class, or
  - the entity is a value of an instance of statement in any item, or
  - the entity is a value of a subclass of statement in any item, or
  - the entity contains a subclass of statement
- The second phase separated the identified classes and properties from the dump to new files preserving the Wikidata model.
- Note that inside property constraints can be invalid classes based on the definition of a class.
- There can be also references to items that do not exists in the dump.
- The two phases are separate because we do not know which entities are classes.
- The output files of the second phase contain reduced entities:
  - `sitelinks` are removed from classes only, since properties do not contain sitelinks

### Property usage statistics comments

In the 1. phase, the statistics module stores information about instance of values for each entity to later use it in the 2. phase.
In the 2. phase, the module iterates over each statement in in each entity and stores information about the usage in the identified classes from the 1. phase.
When the 2. phase is finished, the module finalizes the usage and stores summaries for each class into a file and also a domain range summaries for each properties in a separate file.
For the summaries for classes, the subject of and value of statistics contain probabilities/score for each property, hence there is no need for further recommendations in the 5. phase, and thus can be directly used in the backend.
For the summaries for properties, the domain and range do not contain probabilities/score, since there will be no additional recommendations for domains and ranges.

## Extraction (3. phase)

The part contain 3. phase which is conducted in two steps - class extraction and property extraction.
The phase extracts the data from the Wikidata model into a simplified data model.
The simplified model is simply a flattening of the hierarchical Wikidata model. 
The main script is `p_extraction.py`.

- input:
  - optional argument for languages extracration
    - `--lang`
    - accepts a list of space separated language shortcuts
      - e.g. `--lang en cs de`
    - defaults to `--lang en`
    - for available shortcuts refer to the [Wikidata language lists](https://www.wikidata.org/wiki/Help:Wikimedia_language_codes/lists/all)
  - a required parameter one of `["cls", "props", "both"]`
    - based on the parameter either the first or the second phase is skipped.
    - for conducting only specific extraction:
      - classes extraction - use `cls`
      - properties extraction - use `props`
      - for both extractions - use `both`
  - required paths to `classes.json.gz` and `properties.json.gz` from previous phase, in the given order

        $> python p_extraction.py both classes.json.gz properties.json.gz

        or

        $> python p_extraction.py --langs en -- both classes.json.gz properties.json.gz


- output:
  - `classes-ex.json`
  - `properties-ex.json`
  - the files are in the same format as in phase 1. 2. except there are not compressed

- logging prefix: `separation`


### Extraction comments

- The language option denotes that it extracts and includes only `aliases`, `descriptions` and `labels` in the selected languages.
- Each time entity ids are used, it transforms them into numeric values to reduce the number of strings inside application that further processes the data.
  - But the application still needs to know whether the ids are of a class or of a property.
- For classes it extracts:
  - aliases
  - labels
  - descriptions
  - instance of values
  - subclass of values
  - properties for this type
  - equivalent class (external ontology mapping)
- For properties it extracts:
  - aliases
  - labels
  - descriptions
  - datatype
  - underlying type
  - instance of values
  - subproperty of values
  - related property values
  - inverse property values
  - complementary property values
  - negates property values
  - equivalent property (external ontology mapping)
  - [constraints](https://www.wikidata.org/wiki/Help:Property_constraints_portal)
    - general constraints:
      - property scope - allowed placement usage - main value, qualifier, reference
      - allowed entity types - the property can be used on certain entity types - for us only Item is main focus
      - conflicts with - contains a map of `(key=property): (value=[ids])` pairs which denotes that if the property is used, the property from the constraint cannot be used or cannot be used with the given values
      - item requires statement - the negation of conflicts with
      - subject type - contains fields based on usage instance of, subclass of, or a instance of + subclass of (note this is not combincation of the first two fields, it is a separate field with different values)
      - value type based:
        - item:
          - value type
          - none of / one of
          - inverse 
          - symmetric
          - value requires statement
        - string: (empty)
        - quantity: (empty)
        - time: (empty)

## Modification (4. phase)

The phase loads all the data in the new model into memory and does a semantic and structural checking and modification to the entities.
Subsequently it saves them to two files.
This phase was moved here from server, because this part also takes quite a bit of time (which was unexpected at first).
The main script is `p_modification.py`

- input:
  - required paths to `classes-ex.json`, `properties-ex.json`, `classes-property-usage.json` and `properties-domain-range-usage.json` in the given order, from the 3. phase

        $> python p_modification.py classes-ex.json properties-ex.json classes-property-usage.json properties-domain-range-usage.json

- output:
  - `classes-mod.json`
  - `properties-mod.json`

- logging prefix: `modification`

### Modification comments

- The script itself works in steps that depend on one another.
  1. Merge property usage statistics to classes and properties.
  2. Remove all entities that have no label, thus cannot be search for or displayed unless you know the specific numeric id.
  3. Preparing a ground for removing unrooted classes:
     1. Add fields to each class: `children`, `instances`, `subjectOf` and `valueOf`. Each field is used by subsequent steps.
     2. Remove unexisting references from all fields of classes.
     3. Remove self cycles of `instanceOf` and `subclassOf` in each class.
     4. Mark children to parents, so the hierarchy could be traversed in both directions.
     5. Mark instances to parents, so we get inverse relation for instances.
  4. Remove unrooted classes recursively.
  5. Post removing unrooted classes:
     1. Remove unexisting references again in case it referenced the unrooted entity.
     2. Check that all classes are rooted and that the root is still present.
  6. Modify properties
     1. Remove unexisting references from the main statements.
     2. Remove unexisting references from the general constraints.
     3. Remove unexisting references from the item constraints.
     4. Removing self cycles from `subpropertyOf`.
     5. Mark subproperties to parents.
  7. Remove unexisting references on merged statistics on classes as a sanity check.
  
The removing references parts are done in order to exclude entities that were not present in the dump during its creation (it is a continual process during live hours).
If the extraction phase adds more fields to entities, it is necessary to evaluate whether they need checks.
The phases as of now are dependend on each other as well as the order of operation inside them.
The `removers` iterate over the entire ontology, in contrast with the modifiers which are stacked and used per entity basis.
This was done because it was easier to maintain certain invariants of other modifications.
The iteration over ontology is done multiple times, but still the time is uncomparable with the first and second phase.

## Precomputing recommendations (5. phase)

A phase that enables to change property orderings on classes.
So far only boosting of properties from properties_for_this_type field and merging property constraints to property usage statistics.
The largest part of the recommendation phase is done in the 2. phase when finilazing property usage statistics.

The main script is `p_property_recommendations.py`.

- input:
  - required paths to `classes-mod.json` and `properties-mod.json` in the given order from the fourth phase

        $> python p_property_recommendations.py classes-mod.json properties-mod.json

- output:
  - `classes-recs.json`
  - `properties-recs.json`

- logging prefix: `property_recommendations`

## Comments

Boosting properties to 1 for classes that are subject of some property based on usage statistics.
There is a lot of classes that do not contain the properties - I do not add them.

## Loading into search service (6. phase)

The phase loads labels and aliases into a search service - elastic search. Assuming the Elastic search runs on client from `utils.elastic_search.py`.
The main script is `p_loading.py`

- inputs:
  - optional argument for languages extracration
    - This parameter should always be equal to the one used in phase 3, since during development I use the scripts separately. Using it without the values from phase 3 could lead to missing certain classes during search. The option is present because the script needs to know the languages used beforehand, so it could create valid ES objects for classes.
    - `--lang`
    - accepts a list of space separated language shortcuts
      - e.g. `--lang en cs de`
    - defaults to `--lang en`
    - for available shortcuts refer to the [Wikidata language lists](https://www.wikidata.org/wiki/Help:Wikimedia_language_codes/lists/all)
    - it should be the same value as was given in the previous phase.
  - paths to the two files generated in the previous step - `classes-recs.json` and `properties-recs.json`

        $> python p_loading.py classes-recs.json properties-recs.json

- outputs:
  - none

- logging prefix: `loading`

### Helper scripts

This phase contains helper scipt `p_loading_es_helpers.py`
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

- logging prefix: `es_helpers`

### Loading comments

For each Wikidata entity an object is generated that serves as an input to the Elastic search instance.
The object contains labels and aliases for all the selected languguages. 
There could be also descriptions but the search somehow was overtaken by the descriptions and resulted in not so relevant class search.
Each language has its own nested object with the above mentioned fields.
If the values are missing from the Wikidata entity, a default value is used - empty string for description and label, empty array for aliases.

# .env

The scripts require `.env` file in the `preprocessing` folder with four values:
1. `ES_PASSWD` - a password of the elastic search instance provided with certificate
2. `ES_CA_FINGERPRINT` a cerficate fingerprint
3. `ES_URL` - an url to elastic search instance
4. `REC_URL` - an url to schema tree recommender server instance

Example (notice that `" "` are not used):

    ES_PASSWD=abcdefg
    ES_CA_FINGERPRINT=xxx...
    ES_URL=https://localhost:1234
    REC_URL=http://localhost:1235/recommender
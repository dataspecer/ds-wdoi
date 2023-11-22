## Progress

This file contains a small progress tracking containing certain decisions in a certain parts.
It is sorted chronologically.
The file does not contain ideas or design in depth.

## 1. iteration - integrate wikidata in dataspecer directly 

The first iteration encompasses an dataspecer adapter that will be used to directly communicate with the Wikidata through SPARQL endpoint and php actions api.
The adapter is a specialization of adapter class that is used for all CIMs in the dataspecer.

- The string based search:
  - For the string based search I managed to use SPARQL queries. 
  - The result contains everything - instances, properties and classes
- The hierarchy
  - For the hierarchy I followed the "subclass of" statements in both directions.
  - The parents search itself was pretty neat, however, the children search was very slow.
- The associations and attributes
  - To extract the attributes I used multiple queries.
  - I followed subject and object constraints on the properties.
  - It was pretty slow.

- Issues:
  - slow
    - working with entire wikidata
    - multiple queries for simple use cases
  - rigid
    - difficult to add new features and leave the SPARQL model
  - hard to change and maintain
  - simple model
    - everything can be a class
    - fake attributes
    - no notion of classes or constraints

To the next iteration I should prepare the backend and connect it again to the Dataspecer.

## 2. iteration - creating the backend 

- Ontology restrictions:
  - I should not care about item constraits now.
  - I should not care about qualifiers contraints now.
  - I want to use the SchemaTree recommender and Wikidata search entities.
  - A class is:
    - an entity that is used as a value inside a "subclass of" statement in another entity
    - an entity that is used as a value inside a "instance of" statement in another entity
    - an entity that contains a value Q16889133 inside a "instance of" statement (Q16889133 is a metaclass for classes)
    - an entity that contains "subclass of" statement
  - The "Entity" is a root class for all classes.
  - I will care about subject and object constraints mostly in this iteration.
- Preprocessing in python
  1. the first - ids extraction
     - With the Bz2 file handle I was iterating over the lines of the file and was marking entity ids into a set for extraction to a file in the next step.
     - This is the first pass of the dump file.
     - runs ~ 12 hours
  2. the second phase - to file extraction 
    - Using the bz2 file handle again, I was extracting classes and properties into two bz2 files - one for properties and one for classes.
    - This is the second pass of the dump file.
    - In this step I exluded `sitelinks` from entities, since there is no usefullness in them for the ontology.
    - runs ~ 14 hours and produces ~ 3M classes and ~ 11K properties
  3. the third phase - transformation    
     - Iteratig over the produced files from previous step I transformed the entities into a more usefull json format (flattening statements, qualifiers, constraints).
     - It outputs again two files - one for classes and one for properties, this time in `.json` format.
     - This step enables to select languages for extraction.
     - runs ~ 14 mins for classes and ~ 7 secs for properties
  4. the fourth phase - semantic modification
     - To tackle certain errors in the ontology, I modified the entities from previous step and outputed them again into another two files.
     - this phase was added because it took way too much time for the Node js backend.
     - For classes:
       - all classes should be rooted
       - removing self cycle references in instance of and subclass of
       - marking children to parents
       - removing unexisting references to entities (entities that are not in the extracted ontology)
     - For properties
       - removing self cycle references in the subproperty of
       - removing unexisting references from main fields
       - removing unexisting references from general constraints fields
       - removing unexisting references from item constraints fields
      - runs ~ 46 secs
      - I modified later on the phase to remove classes with no label (cannot be searched for) and removed unrooted classes recursively.
        - This was in order to mitigate a "thick" root entity with thousands of classes.
        - This behaviour can be easily removed.
        - Based on supervisors, this should be kept as an issue.
  5. the fifth phase - loading into elastic search
    - Based on the selected languages in the 3. phase, it loads elastic search with the data.
    - The data are formatted that all languages belong to one object  
    - it uses only aliases and labels (based on the php search from wikidata)
    - I use language analyzers for language fields from Wikidata.
    - runs ~ 14 mins
  - Comments:
    - The preprocessing does exclude `sitelinks` from entities.
    - Extracting values from statements always returns only unique values.
    - The values it self are not check since wikidata does not allow to intput data in different types into a statement. 
    - The preprocessing enables to select only specific langugages - 3. phase and 5. phase.
    - Semantic interpretation of constraints was left for the client of the extracted data.
      - The extracted data itself should include as much as detail (meaning even not used directly by the clients - such as all the constraints)
- Backend v1.
  - Search service is implemented using elastic search.
      - The ES contains aliases and labels
      - When descriptions were part of the ES, it somehow intruded the search with classes that I would not expect.
      - The search does two queries - phrase_prefix and best_fields - in order to include all the relevant results.
        - But another problem was sorting it - so far I use interleaving because prefix always outscored the best_fields even thought best_fields had more meaningful results.
        - I integrated php wikidata search to provide more semantics - it is still fast.
      - The ES uses dynamic templates to provide language features of the Wikidata language fields.
  - The main part is in Node js
    - It loads all the data into the server and keeps them in memory.
    - This time I use only subject of and value of constraints to assign properties to classes
      - For starters I iterate over parents hierarchy to collect the properties.
    - For hierarchy and properties it walks through the hierarchy.
- Dataspecer v2
  - I implemented Dataspecer core v1 api.
  - The new appi is waiting when stepan tells me.

- Pros from previous solution:
  - It is easier to maintain.
  - The view on ontology can be changed and we have pipeline.
  - It is much faster.
  - We have the ontology under control.

- Issues
  - We still use only subject and value constraints + we use hierarchy to show properties
  - Maybe do not remove any classes.
  - Still no qualifiers, and general properties.
  - Dont know how to handle the properties as in hierarchy.
  - No recommendations.
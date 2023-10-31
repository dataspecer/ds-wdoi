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
  - Using bz2 file handle in python I was extracting classes and properties into a bz2 files in two phases - first pass I extracted cls/props ids into a set and in the second pass I extracted the entities that had their id in the set into the output files.
  - In the next step I transformed the entities and picked only certain useful information
  - The dump I have contained about 3M classes based on the above definitions and 11k properties.
  - The preprocessing on my computer runs approximately:
    - 1. phase - 12 hours
    - 2. phase - 14 hours
    - 3. phase 
      - clases - 14 minutes
      - properties - 10 seconds
    - 4. phase - loading to elastic search - 14 minutes
  - The preprocessing does exclude `sitelinks` from entities.
  - The preprocessing enables to select only specific langugages.
  - The excluding must be done on the client of the preprocessed data.
    - Such as exlude properties that cannot be used on items.
  - Backend
    - Search service is implemented using elastic search.
      - The ES contains aliases and labels
      - When descriptions were part of the ES, it somehow intruded the search with classes that I would not expect.

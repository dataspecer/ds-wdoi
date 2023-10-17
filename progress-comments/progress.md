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
  - 


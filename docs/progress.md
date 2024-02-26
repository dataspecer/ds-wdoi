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

## Third iteration

The third iteration regards recommendations of properties.
What I used is the SchemaTree recommender.

- The pipeline is adjusted so that it contains additional fifth phase (the former was moved to the sixth phase).
  - The 5. phase:
    1. Local "subject of" recommendations
       - The phase needs a running instance of the SchemaTree recommender.  
       - For each class it makes a request to the instance and receives the recommendations for the class only (local recommendations).
       - It disregards properties that are not part of the "subject of" constraints in the class.
       - It sorts the properties according to the score and saves the scores as well to the class.
    2. Global "subject of" recommendations
       - By using empty input to the recommender tree it receives global order of all properties.
    3. Local "value of" recommendations
       - The computation is done for each property and is done as follows. The score of the "value of" is computed based on the average of all "subject of" constraints for the property -> it looks into each class and checks if the property has a score for the local "subject of" constraint.
    4. Global "value of" recommendations
       - computed based on the local "value of" recommendations
- The server was adjusted so it could work with the recommendations.
  - The walking of the parent tree when asking for the surroundings now collects all the properties and sorts them in the end.
  - The last sort is ment to sort all the available properties for the class.
  - Since we stored the local recommendations in each class directly, they can be then accessed when holding a class instance.

- Issues with recommendations:
  - The recommender is able to recommend only used properties.
  - For the missing entities we assign probability zero.
  - We are contraint by subject type and value type constraints.
  - It does not include sorting of the values it points to or originates in.
    - I would have to iterate over the dataset and for each Item property take a look at:
      - Subject item and value item.
      - Look at the items and mark that the items were of the type (instance of).
      - In other words accumulate usage of instances of both ends for each Item property.
      - Why not other properties? because only item properties can produce these outputs.
    - Why i dont want to do this?
      - Because it seems like a lot of work for a small thing

## The fourth iteration

The iteration consists of two phases.
The first one is the mockup and the second one is the upgrade of the recommendations.

- Mockup with react.
  - The aim was to create a mockup with some of my ideas from previsous figma design.
  - Itself the mockup works with the data from the backend, it is not a simple mockup with artificial data.
  - Each design includes description of what it did in each of the main phases.
  1. design
       - Root search
         - The user can search by property or by class name.
         - After clicking detail the user can browse the classes or properties and click back button as in browser history.
         - Cons:
           - The search by property is not intuitive, since it seems we are choosing property as a root.
           - Although the thought is a good one.
       - Associations hierarchy of parents
         - I tried to implement the forward list for parents.
         - The list itself is still on the right.
         - The only difference is that the user can open a small accordion and display the direct parents of the class.
         - Also in the opened accordion a user can click to forward scroll to the class as if browsing.
         - With search bar based on string.
         - Ideas:  
           - The questions is wheter do we need the parents at all.
           - The graph itself is not a good representation since it wont tell user much.
       - The property associations
         - A simple search bar based on strings
         - Displaying inherited properties and Own properties
       - **Thoughts on the design**
         -  The search by property is not intuitive, since it seems we are choosing property as a root.
         -  The question is whether do we need the parents bar.
         -  The range for properties should be displayed after the click.
         -  There should be added properties of qualifiers and other with no range or domain.
         -  Maybe I could choose a different lists based on backward or inward associations.

- A new way to assign properties to classes
  - There was an idea to try include more information from instances of clases to the surroundings.
  - This means that I had to compute usage statistics of properties.
  - I had to reimplement 1. phase and 2. phase of the pipeline to be able to include statistics.
  - There were several problems: 
    - I had to have access to instace of values of all entities to work with the range values of properties. This ment I had to create a big map of all instances to their instance of values to enable fast access during statistics computation.
    - Storing the computed statistics ment that I had to compute the whole recommendation phase in order to store the results effectively.
  - What I compute?
    - For each instance I iterate over it's statements and store them into it's class records with counts.
    - For literal properties it is easy, but for range properties I need to access the object value of the triple and find its class information, and then store it.
    - After the 1. and 2. phases are done, there is a need to finalize the statistics and compute probabilities/scores of property usage on classes. This includes:
      - The subjectOf classes.
      - The domain and range of properties based on the class usage.
      - The valueOf classes which I chose the score from the probability of the class being range of the property from it's range classes.
  - **Thoughts**:
    - There might be a problem with the number of range/domain values of properties. Depending on the usage in the ontology. Some propreties can probably have a lot of domain and range classes.
    - It is similar to the SchemaTree recommender, so maybe we could exclude it?
# Server v3

Adjusting recommendations based on instances.
This version is extension of the previous version.
The plan is to add an option to the user to display properties based on certain instances summary to include qualifiers and other properties.


## Domain and range based on instances

The domain and range of based on constraints gives sometimes a small number of possibilities for surroundings method.
There was an idea to try displaying properties based on usage on instances of the classes.

I have implemented the computation of statistics.
The computation takes place in the 1. and 2. phase of the preprocessing pipeline.
First, there is a need to extract and store instance of information for each entity to enable a fast look up during the statistics computation in the 2. phase.
In the 2. phase, the module receives each entity and extracts it's statatements (for item properties it also extracts the endpoint), subsequently, the statements are placed into a buckets based on the instance of information from the received entity (for item properties, it also stores the range value).

- What is computed?
    - For each class we have a usage of out/in properties, but also we have ranges for each of the property.
        - This will give a priority when clicking on domains/ranges in the dataspecer based on the currently selected class. 
    - We obtain the domain/range lists for properties by combining the usage from each class.
        - We also sort the ranges/domains for the properties based on the global usage.

When the 2. phase is finished, the module finilizes the statistics - compute scores, store the information to classes, store domain and range to properties.
That is done in order to store the information about statistics, since most of the information was stored in dictionaries during computation.

The statistics for classes and properties are loaded into the main files in the 4. phase before modifications, where there are merged into the main class objects.

The server itself just loads the additional data and serves them as in previous version of the backend. There is but one difference, the surroundings api does not return endpoints, and a new api was build to provide in for on property clicks in dataspecer to obtain the domain and range of the properties. This really reduced the complexity of the recommendation process.

- Serving domains/ranges when clicking on a property in dataspecer.
    - A dialog appears containing classes - either domains or ranges.
    - The dialog contains all classes from the property usage (globally) with the order from the local usage on the class.
        - Meaning: Each property has the global list of domains/ranges. This list is send to the user, but before it is sent, the order is changed to prioritize classes that were part of property usage on the class instances.
        - e.g. Property P ranges list contains classes A, B, C. In dataspecer we are in the context of a class D. The instances of D used property P with the ranges C, B (C was used more times than B). So the list displayed to the user will be C, B, A.

## Boosting properties for this type

- Boost properties for this type in a way to push its scores to 1 and resort the property scores records.
- But do not add the property usage if it is missing.

## Merge with constraints on subject type and value type

- For literal properties:
    - Add property usage to all classes mentioned in the constraint.
- For items:
    - Add property usage to all classes mentioned in the constraint iff the property does not have empty endpoints - combined both from the usage statistics and constraints.
        - e.g. - based on property usage the property does not have a range (meaning there are also no domains) but from constraints the ranges and domains are defined, so we can extend the usage to these classes. If the constraints defined only either ranges or domains, we could not do the merge.
        - e.g. - bsed on property usage the property have ranges and domains, but the constraints define only ranges, so we can still merge it by exapnding only the ranges.
  
## The reduction of properties based on instance example

2. it should reate frontend where a user would input instances and based on those i would display the properties

- Mostly questions 
    - should it be only for one selected class as a root or could user select classes from the hierarchy?
        - it could switch between the modes
    - how could the user find the instances? find with its own sparql - or just put there a search bar

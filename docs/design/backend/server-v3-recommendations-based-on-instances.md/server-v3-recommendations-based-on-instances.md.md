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

- what is computed?
    - We eventually obtain the domain/range lists for properties - which gives us global usage of properties
    - the usage on instances gives us the domains, the endpoints of item properties on instances gives us the ranges
    - we do not obtain the specific domain and range upon click on a class, but we use the globals

When the 2. phase is finished, the module finilizes the statistics - compute scores, store the information to classes, store domain and range to properties.
That is done in order to store the information about statistics.

The statistics for classes and properties are loaded into the main files in the 4. phase before modifications.

The server itself just loads the additional data and serves them as in previous version of the backend. There is but one difference, the surroundings api does not return endpoints, and a new api was build to provide in for on property clicks in dataspecer to obtain the domain and range of the properties. This really reduced the complexity of the recommendation process.

- Comments and thoughts
    - checking upon the domain and range values of properties, there was a large number of properties with domain and range in thousands
    - to deal with the number of domain and range values, i decided to try computing the domain and ranges of properties solely for classes - disregrading the globals on properties 
        - the questions are how to integrate it to the recommendation process?
            - it only does the reduction on the domain and range upon clicking on item properties, there could be api for domain and range again based on the type - give me for own class give me with inherited info (need to traverse the hierarchy)  

## The reduction of properties based on instance example

2. it should reate frontend where a user would input instances and based on those i would display the properties

- Mostly questions 
    - should it be only for one selected class as a root or could user select classes from the hierarchy?
        - it could switch between the modes
    - how could the user find the instances? find with its own sparql - or just put there a search bar


## Boosting properties for this type

- Boost properties for this type in a way to push its scores to 1 and resort the property scores records.

## Merge with constraints on subject type and value type

- For literal it is easy.
- For items it is difficult.
    - I chose to merge only properties which have defined both subject and value type constraints.
    - I tried to omit the global view that each domain class of a property (based on usage) should point to the value type constraint classes (the same for subject type constraint classes should point to range of a property (based on usage)). 
    - Why? 
        - It would lead again to an enourmous ranges/domains for properties (in thousands).
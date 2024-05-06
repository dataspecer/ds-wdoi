# Server-v2

For the second version of the backend I will be extending the returned surroundings with recommendations.
All in all, the server architecture should not change.

## Recommendations with SchemaTree

The data adjustments will be done in pipeline.
The pipeline will precompute recommendations for each class:
  1. a get request to the recommender
  2. sort subjectOf
     1. check if the properties exists in the returned recoomendations
     2. if yes pick the probability
     3. if not do a fallback where you pick the probability from the global recommendation tree
     4. sort the properties based on the probabilities
  3. sort valueOf
     1. for each valueOf property
        1. look into the subject type constraint and iterate over the classes pick the average of those probabilities
  4. for each class mantain the list of probabilities as well, it will be used during global sorting

## Limitations of recommendations

- **The recommender is able to recommend only used properties.**
- For the missing entities we assign probability zero
- **We are contraint by subject type and value type constraints**
- It does not include sorting of the values it points to or originates in.
  - I would have to iterate over the dataset and for each Item property take a look at:
    - subject item and value item
    - look at the items and mark that the items were of the type (instance of)
    - in other words accumulate usage of instances of both ends for each Item property
    - why not other properties? because only item properties can produce these outputs
  - why i dont want to do this?
    - because it seems like a lot of work for a small thing

## Surroundings changes

The surroundings will now return properties sorted based on the probabilities
Also there will be a list of properties sorted based on the parents hierarchy.
The sorting will take place inside the backend.
The dataspecer will not get the probabilities only the sorted list.
In the future, it could be adjusted to contain also the probabilities.
Maybe include the properties for this type -> but what if they are missing from the subject of and subclass of?
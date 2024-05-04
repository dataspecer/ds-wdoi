## Precomputing recommendations phase

A phase that enables to change property orderings on classes.
So far only boosting of properties from properties_for_this_type field and merging property constraints to property usage statistics.
The largest part of the recommendation phase is done in the 2. phase when finilazing property usage statistics.
This phase assumes already merged property usage statistics from modification phase.

## Comments

- Boosting 
    - Boosting properties to `score=1` for classes that are subject of some property based on usage statistics.
    - If the property is missing, it is not added.
- Merging usage statistics with property constraints.
    - We are merging property constraints into the statistics usage constraints.
        - The main assumption here is that upon request for domains or ranges of properties, the entire list is returned with only different orderings based on the selected class.
    - We expand the domains/ranges of properties with the property constraints values.
    - Also, if the domain/range is missing, it is marked to the class.
    - If the property from statistics do not have a usage and the merged property constraint is missing subject constraint or value constraint, it is not merged, Since that would mean it points nowhere.
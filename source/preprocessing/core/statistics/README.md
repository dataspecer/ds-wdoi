# Property usage statistics comments

- The idea is to compute statistics of property usage on instances of classes.
- The statistics will be used as definitions for domain and ranges of properties.
- In the 1. phase, the statistics module stores information about instance of values for each entity to later use it in the 2. phase.
- In the 2. phase, the module iterates over each statement in in each entity and stores information about the usage in the identified classes from the 1. phase.
- When the 2. phase is finished, the module finalizes the usage and stores summaries for each class into a file and also a domain range summaries for each properties in a separate file.
- For the summaries for classes, the subject of and value of statistics contain probabilities/score for each property, hence there is no need for further recommendations in the 5. phase, and thus can be directly used in the backend.
- For the summaries for properties, the domain and range also contain probabilities/score.

> Note:
>    1. All the identifiers in the outputfiles are already numeric.
>    2. During counting of inlinks, we include all properties (disregarding the not allowed properties) and for entities we allow all as well. Thats is to get the overall information for the classes.
>    3. The properties for computation match the identified properties from the 1. phase. The same applies for classes.
>    4. The entities in the 2. phase are passed into the statistics before they are passed into the separation method.

## Score

The scores are computed based on the number of usages on instances of classes.
For a class we note a total number of properties used on instances and for each single property we denote its number of usages.
The score is then division of the `(property usage count on a class)/(total count of all properties usages on a class)`.
The same infers for per class property domains and ranges. 
And laso the same infers for property domains and ranges (global usage of classes as domains and ranges). 

## Output data format

- Each line of the output file contains one entity.
- For classes it contains:
    - `ClassFields.ID` - a numeric id of the class
    - Counters:
        - `ClassFields.INSTANCE_COUNT` - number of instances of the class.
        - `ClassFields.INLINKS_COUNT` - number of direct incoming links to the class .
        - `ClassFields.STATEMENT_COUNT` - number of statements the class has.
        - `ClassFields.INSTANCE_INLINKS_COUNT` - number of incoming links to instances of the class.
        - `ClassFields.INSTANCE_STATEMENT_COUNT` - number of statements of the class instances. 
    - `ClassFields.SUBJECT_OF_STATS_SCORES` and `ClassFields.VALUE_OF_STATS_SCORES` denote the properties that the class is domain of and range of (since we need to know the reverse).
        - The fields follow the format:

                [
                    {
                        ScoresFields.PROPERTY: number,
                        ScoresFields.SCORE: float,
                        ScoresFields.RANGE_SCORES: range_score_format,
                    },
                    { ... },
                    ...
                ]  
        - `ScoresFields.PROPERTY` - denotes the property id that the class is domain of.
        - `ScoresFields.SCORE` - score of the property for the class in interval [0, 1], the higher meaning the property is used more often.
        - `ScoresFields.RANGE_SCORES` - denote endpoint classes for the property used solely on the instances of the current class and follows the format:

                [
                    {
                        ScoresFields.CLASS: number, 
                        ScoresFields.SCORE: float
                    },
                    { ... },
                    ...
                ]
            
            - `ScoresFields.CLASS` - being the endpoint class id
            - `ScoresFields.SCORE` - score of the endpoint class in interval [0, 1], the higher meaning the endpoint is used more often
- For properties:
    - we have fields `PropertyFields.ID`, `GenConstFields.SUBJECT_TYPE_STATS.value` (general constraint) and `ItemConstFields.VALUE_TYPE_STATS.value` (item property constraint), following the format `range_score_format` from above.
    - `PropertyFields.INSTANCE_USAGE_COUNT` - the number of times the property was used.
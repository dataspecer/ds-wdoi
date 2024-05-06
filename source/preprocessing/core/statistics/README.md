# Property usage statistics comments

- In the 1. phase, the statistics module stores information about instance of values for each entity to later use it in the 2. phase.
- In the 2. phase, the module iterates over each statement in in each entity and stores information about the usage in the identified classes from the 1. phase.
- When the 2. phase is finished, the module finalizes the usage and stores summaries for each class into a file and also a domain range summaries for each properties in a separate file.
- For the summaries for classes, the subject of and value of statistics contain probabilities/score for each property, hence there is no need for further recommendations in the 5. phase, and thus can be directly used in the backend.
- For the summaries for properties, the domain and range also contain probabilities/score.
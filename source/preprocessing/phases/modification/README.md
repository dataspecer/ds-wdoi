## Modification phase

The phase loads all the data in the new model into memory and does a semantic and structural checking and modification to the entities.
Subsequently it saves them to two files.
This phase was moved here from server, because this part also takes quite a bit of time (which was unexpected at first).

### Comments

The script itself works in steps that depend on one another.

<br>

- Process:
    1. Merge property usage statistics to classes and properties.
        - To enable further work with the statistics in other phases.
        - For classes:
            - Including all counters.
            - Subject of and value of statistics are merged so that:
                - We have field containg only all the sorted property identifiers,
                - and additional field that contains the sorted property identifiers with ranges and scores.
                - That is done in order to ease further work and loading into the Wikidata ontology API service.
    2. Remove all entities that have no label.
        - This one is sort of tricky since it depends on the language selection from the extraction phase.
            - Thus cannot be searched for or displayed unless you know the specific numeric id.
            - It can remove classes which have label defined only in the "local" language, but the labels are missing since the extraction phase selected only specific language, e.g English language.
            - Removing the classes can lead to breaking the hierarchy, but the question is whether the highly specific classes dependent on language form deep hierarchies.
            - On the other, it is hard to assess the benefit of highly specific classes depending on the language inside Dataspecer.
            - It can also mean that the classes were some testing case of a user and can bear no value.
        - Right now, we have decided to exclude all the classes with no label, but enforce the english language, since it is the most widely used.
    3. Modification of classes - general
        1. Add fields to each class: `children`, `instances`, `subjectOf` and `valueOf`. 
            - Each field is used by subsequent steps.
        2. Remove unexisting references from all fields of classes.
            - Since the dump can contain values which do not exists in the dump.
            - And just in case some parts did not get into the ontology.
        3. Remove self cycles of `instanceOf` and `subclassOf` in each class.
            - Only the root entity can have self cycle, but it is implicit and not noted in the data.
        4. Mark children to parents.
            - So the hierarchy could be traversed in both directions.
        5. Mark instances to parents.
            - So we get inverse relation for instances.
    4. Remove selected class instances from the ontology.
        1. Removing instances of classes - gene, protein, type of chemical entity.
            - It will keep the ancestors trees untouched, in case there was a cycle.
            - We are removing them because they form roughly 3 million classes, and contain labels/descriptions/aliases which repeat a lot.
            - There is also a question whether to remove instances of the instances (recursively).
                - For now, we will keep them in there, but remove the references.
        2. Removing the unrooted parts after removing the instances.
        3. Updating the references of classes.
    5. Modification of properties - general 
        1. Remove unexisting references from the main statements.
        2. Remove unexisting references from the general constraints.
        3. Remove unexisting references from the item constraints.
        4. Removing self cycles from `subpropertyOf`.
        5. Mark subproperties to parents.

<br>

- It is important that you never remove the root entity (Q35120). 
- The removing references parts are done in order to exclude entities that were not present in the dump during its creation (it is a continual process during live hours).
- If the extraction phase adds more fields to entities, it is necessary to evaluate whether they need checks.
- The phases as of now are dependend on each other as well as the order of operation inside them.
The 
- There are two modifiers `full` and `part`.
    - `part` modifiers work only on a single entity, can be chained to more `part` modifiers
        - Meaining there is no global dependence when applying the part modifier. 
    - `full` modifiers iterate over an entire set of entities while applying the modifier
        - There is dependence to all other modifiers, thus must be applied to all entities before continuing. 
    - This was done because it was easier to maintain certain invariants of other modifications.
- The iteration over ontology is done multiple times, but still the time is uncomparable with the first and second phase.
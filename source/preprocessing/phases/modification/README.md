## Modification phase

The phase loads all the data in the new model into memory and does a semantic and structural checking and modification to the entities.
Subsequently it saves them to two files.
This phase was moved here from server, because this part also takes quite a bit of time (which was unexpected at first).

### Dependency comments

- The script itself works in steps that depend on one another.
  1. Merge property usage statistics to classes and properties.
  2. Remove all entities that have no label, thus cannot be search for or displayed unless you know the specific numeric id.
  3. Preparing a ground for removing unrooted classes:
     1. Add fields to each class: `children`, `instances`, `subjectOf` and `valueOf`. Each field is used by subsequent steps.
     2. Remove unexisting references from all fields of classes.
     3. Remove self cycles of `instanceOf` and `subclassOf` in each class.
     4. Mark children to parents, so the hierarchy could be traversed in both directions.
     5. Mark instances to parents, so we get inverse relation for instances.
  4. Remove unrooted classes recursively.
  5. Post removing unrooted classes:
     1. Remove unexisting references again in case it referenced the unrooted entity.
     2. Check that all classes are rooted and that the root is still present.
  6. Modify properties
     1. Remove unexisting references from the main statements.
     2. Remove unexisting references from the general constraints.
     3. Remove unexisting references from the item constraints.
     4. Removing self cycles from `subpropertyOf`.
     5. Mark subproperties to parents.
  7. Remove unexisting references on merged statistics on classes as a sanity check.
  
### General comments

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
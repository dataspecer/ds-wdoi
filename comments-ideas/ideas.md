# Ideas


## UI

This is a written form of ideas of ui, I am working on an graphical images as well.
The idea of ui is devided into two parts - Root selection and Association selection.

### Root selection

  1. a user will select wikidata as input in the specification main page
  2. the classical dataspecer search bar would show up - a single line of a search bar
  3. the search bar could have settings that sets how to search: 
       - **search by class**
         1. a text based search on the classes names
         2. a user searches for a class 
         3. output would list classes as in current dataspecer
         4. the user would select a single class and show a detail
         5. then the user could finally select is as the root
         - *detail of the classes*:
           - a name (label)
           - description (different language options)
           - image?
           - **child and parent classes?** - could the user browse it?
           - **possible properties?** - but is it not a bit too much, it would be the same after root is selected?
         - *comments*:
           - the classes will be in our backend  
       - **search by instance**
         1. a text based search on the known instances in wikidata
         2. a user searches for an instance, e.g. Paris
         3. the output would list matching instances
         4. the user would expand a single instance and look at the detail
         5. the detail would show a list of "instance of" and "subclass of" classes
         6. then the user would select a class from the detail as the root
         - *detail of the instances*:
           - name, label, image, description
           - "instance of" and subclass of" classes with the same detail as in search by class 
         - *comments*:
           - this is based on the Stepans idea
           - the problem is that managing all instances locally is impossible, so the wikidata php api should be used instead  
           - [php query api in wikidata](https://www.wikidata.org/w/api.php?action=help&modules=query%2Bsearch)  
           - [php get entities api in wikidata](https://www.wikidata.org/w/api.php?action=wbsearchentities&format=json&language=en&type=item&search=Veronika%20Scheuerova) (only example link) 
       - **search by property**
         1. a text based search on the existing properties
         2. a user searches for a property that the class can have or it is pointed by (wikidata property constaints on values and subjects)
         3. the output would list matching properties
         4. the user would expand the detail and look at the property constaints that contains classes (subjects and objects)
         5. the user then selects a single class as the root node
         - *detail of the properties*:
           - name, label, description
           - maybe a bit of other contraints?
           - classes of subject and object in the same detail as in search by class
         - *comments*:
           - the properties will be in out backend 
  4. **browsing after detail of the class**
     - is it all with the detail?
     - what if the user could browse the class hierarchy as i mentioned in the **search by class** above?
     - how could they do it?
       1. following the parents and children ("subclass of hierarchy")
       2. 1 + properties? if they are actually listed in the detail - but it has multiple target object for a single property, is it even managable?
     - ideas of views:
       -  **browser as in slovnik.gov**
          - it would be either a separate page or integrated with wikidata
          - the view would show the same thigs as in slovnik.gov with a bit of detail from wikidata pages
          - the classes are simple
          - the properties should be in a form of list + search bar
          - the user would select property and the target class
       - **graph exapander**
         - a view with only single class would show up with two edges (parents and children) to the class ending with a plus sign
         - the user would click the pluses and the graph would expand
         - there would be and option for expanding all or just the selected classes
         - properties would be in a form of detail
           - there could be a third edge that would expand single properties to the selected target classes

Questions to answer:
  1. Should the detail of the classes show the properties? 
  2. Is the browser a good idea?
  3. If the browser is a good idea - 
     1. should it encompass the properties?


## Recommendation of properties

Assuming we are on a current type:

- **What to even recommend from?**
    - I need to obtain all properties, that have subject constraint equal to the current type.
    - What if there are none?
      - I could follow the hierarchy tree to the root and ask for additional properties. Basically repeat the query for my parent classes. This can be precomputed. 
      - Should this happen always, that is to say, include all properties from parent classes to the shown property list or show only properties for the current class and user should decide depth to which expand parent classes?**
      - How would that look for a user?
        1. A user could click to expand parent classes for properties. Just by setting depth.
        2. A graph of the parent classes and select a few? But in some cases or even most cases it could be very exhaustive since we saw the [graph builder](https://angryloki.github.io/wikidata-graph-builder/).
        3. If it was done always, the recommendations should be somehow sorted based on the clustering. The closest parents could have more priority or other way around. 
    - Note that I want to exclude the annoying ID properties or properties regarding the wikidata types.
- **If I obtain some properties to show.** - I must consider the intersection of the valid properties by constraint and recommended properties.
  1. I must take into an account the properties for this type values, before recommending something else. **(This must be done always.)**
  2. I could sort them with schema tree recommender only, but only if it recommends everyting for the type. 
     1. Could be precomputed in that case. 
     2. In this case the recommendation could be recomputed again and again when user selects something. But that would be pretty annoying for the user. Maybe user could click for new recommendations if he wanted? 
  3. I could sort them based on frequency on types. Basically the most used properties will be in the front.
  4. I could use both 2.-3. How ?
     1.  I could have multiple windows - one for static sorted list by frequency and another one for recommendations as the user clicks. So it would be on going recommendation. 
- **In case the clustering based on parent classes took place**.
  - I should be able to sort them with reference to each other, parent should have more pririty because it is more general. 
  - I could count coocured properties and give them more priority.
  - I could maintain the probabilities if i used schema tree, and show only the heighest ones. This makes sense, because good properties on parents want to be seen.

Dve moznosti co se zobrazi uzivateli a co by chtel a pak co jsou ve wikidataech
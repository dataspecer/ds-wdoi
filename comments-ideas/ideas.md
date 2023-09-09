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
       - **graph expander**
         - a view with only single class would show up with two edges (parents and children) to the class ending with a plus sign
         - the user would click the pluses and the graph would expand
         - there would be and option for expanding all or just the selected classes
         - properties would be in a form of detail
           - there could be a third edge that would expand single properties to the selected target classes
         - examples:
           - there is a graph builder, but it is way too general, it can follow everything
           - [graph builder children](https://angryloki.github.io/wikidata-graph-builder/?item=Q133067&property=P279&mode=reverse&graph_direction=down)
           - [graph builder parents](https://angryloki.github.io/wikidata-graph-builder/?item=Q133067&property=P279&graph_direction=down)

Questions to answer:
  1. Should the detail of the classes show the properties? 
  2. Is the browser a good idea?
  3. If the browser is a good idea - 
     1. should it encompass the properties?

### Association selection

This comes after the root is selected and user clicks + in the dataspecer
The view should be similar to what we have in dataspecer now.

- There will be a list of properties shown to the use with basic description
- Filtering options
  1. text based filtering on names
    - can be extended with text based filtering in description
  2. filter by selecting target classes of properties
    - the view could then group the properties by target classes
  3. filter by selecting subject classes of properties
    - the view could then group the properties by subject classes   
  4. **by parent**
     - this depends on whether we are showing all properties to the user (even inherited) or just the ones pertaining to the selected class:
        1. show everything
           - might be too much for the user but he can search it faster
           - okey so if i got everything i would need to know from which parent class came something
           - i could show either graph or text selection - user would either click to select specific class or select multiple ones, or if we grouped it, we could just follow links directly in the list?
           - there are multiple points to imagine it generically:
             1. starting point is - everything is selected so the user sees everything from parents
             2. what can he do?
                1. use a graph to select classes he wants to see properties from (graph could be searchable with text)
                2. if he wanted to navigate, he could use grouping view (based on parent class) and then the group headers could be links to other parents in the shown list -> so it is not a selection but just scroll to a different position in the list
                3. it could be the same as in dataspecer sidebar, only it could be serialized and show depth + maybe some search options or just navigate as in the previous example (3.) user could maybe select the ones he wants to see
        2. show only the ones pertainign to the class (by constraints on edges) (this is in current dataspecer?)
           - I dont like this very much, because there can be a lot of classes, so how should a user be able to search all of them?
           - what can user do?  
             1. we could use the same graph and he would select what classes he wants to see properties from
             2. or the expansion can be done by clicking headers in the list as in the above (1.2.3)
             3. above (1.2.4)
      - viable options seems to be a graph with selection or a grouping by parents with expansion or a side panel with navigation and selection
- view options
  - by parent grouping
  - by subject grouping
  - by object grouping 
- there could be a 

Questions to answer:
  1. Should the properties for the given class show only its pertaining properties (given by constraint) or all from parents (inherited)
  2. What seems as the best option for parent classes management?
     1. a graph
     2. a view in which we group properties by parents, the header will be a navigation to the parents in the given list (scroll to that posision or expand the list)
     3. the side panel would handle the navigation and selection

## Recommendation of properties

Assuming we are on a current type:

- **What to even recommend from?**
    - I need to obtain all properties, that have subject constraint equal to the current type.
    - What if there are none?
      - I could follow the hierarchy tree to the root and ask for additional properties. Basically repeat the query for my parent classes. This can be precomputed. 
      - Should this happen always, that is to say, include all properties from parent classes to the shown property list or show only properties for the current class and user should decide depth to which expand parent classes or maybe just by clicking the classes he wants?**
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
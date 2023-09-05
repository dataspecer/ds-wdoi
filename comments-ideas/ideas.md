# Ideas

## How user chooses first type?

Stepan had nice idea, that the user could choose a type based on existing instances of.
But I would have to maintain the instances and their values, which is unmanagable.
Maybe I could just say it to the user... hey! choose from wikidata.
If this was needed eventually, I could integrate search based on the:

1. [php query api in wikidata](https://www.wikidata.org/w/api.php?action=help&modules=query%2Bsearch)
2. [php get entities api in wikidata](https://www.wikidata.org/w/api.php?action=wbsearchentities&format=json&language=en&type=item&search=Veronika%20Scheuerova) (only example link)

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
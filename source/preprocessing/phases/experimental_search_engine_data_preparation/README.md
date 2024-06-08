# Experimental search engine data preparation phase

The phase aims to create a new data entities that will represent the entities of the ontology inside the Search engine. 
There are five phases each focusing on a specific aspect of the data preparation.

- The phases are:
  1. Reduction of property usage
  2. Expanding ids fields to language fields
  3. Lexicalization
  4. Vectorization
  5. Minimization  

## 1. Reduction of property usage

The aim of this phase is to prepare the data for filtering classes by a property.
The idea is that there will be a filter in the search engine that will allow users to select a set of properties that the class must have and the subsequent search will retrieve classes that contain the selected properties.
The problem is that we have to work with inheritance.

The simplest solution would be to precompute all available properties for a class and store it to the database and then filter based on the ids of the properties.
We have tested the approach but quickly noticed that the amount of data generated exceeds 20GB in the output json file.
One of the main problems with the solution was that it contained many duplicities, for instance, all ~ 70k of subclasses of a class Human (Q5) would contain all 5K properties defined on the Human.

Thus, we have implemented a different approach.
Instead of storing properties to classes and searching by a property ids, we will store ancestors of classes that define a property usage.
We know that the number of classes definining a property usage is rather low compared to the overall number of classes.
The ancestors will be stored alongside the entities in the databases and the filter will be implemented as a filter on ancestors.
To realize the solution, we must assign each property a list of classes that define the usage of the property.
When a user selects a property into the filter, the search engine will retrieva all the ancestors that define the property, and reduce the search space to classes containing the usage classes of the property.

To tackle duplicities of a property usage within a hiearchy, we allow only the highest class defining the property, since every subclass containing the property usage would be redundant. 

## 2. Expanding ids fields to language fields.

The idea is to use values of handpicked properties for classes that provide additional information useful for retrieval.

Here we focus only on classes.
We have chosen properties: has parts, has characteristics, has effect, has cause, is part of, and has use.
In the dump, the properties have a value of entity id.
It was required to iterate over the dump once again to obtain the needed labels.
Since we knew what entities to retreive, the entire process could be speeded up by not loading all entities into json, but check only the initial id in the entity string before using json load.
This reduced the iteration to a mere 1.5 hour.

The labels are stored into a separate file not to store duplicit strings among classes.

## 3. Lexicalization

To prepare entities for vectorization we had to lexicalize entities.
We have picked properties to lexicalize and create sentences with regard to the property meaning.
We also chose to iterate the name of the entity for each sentence to boost the "title" of the entity in the text.
It was shown that it bolsters the search capabilities of the language models.

Since some entities could be rather long if we chose all the information.
We have kept the number of items lexicalized inside the sentences to minimum.
For example, we used alises to be lexicalized into: "Insert name" is also known as [list of aliases].
Some classes can have even 20+ aliases, se we chose only the first three.
This was also done, because the language models have a limited token input.

Just in case, even this reduction did not create the lexicalization short enough.
We stored each sentence separately in a map.
The map can be then used to create the full lexicalization of the entity, and in case it is too long, remove specific sentences.

## 4. Vectorizing

After the lexicalization was done, we could move to the vectorization of the entities.
We have noticed that the sentence length never exceeded the number of maximum tokens.
So we used all of the sentences for each entity.

We vectorize for dense and learned sparse embeddings.
Internally, we use `sentence transformers` library for the dense embeddings and `pytorch` for sprase embeddings.
The paralelization takes place on the level of `pytorch` library (used also inside `sentence-transformers`).
Even then the process takes around 14 hours.

The time taken can be imporoved with the GPU or more CPUs.

## 5. Minimzation

Minimization is done in order to provide the smallest amount of data to the Search service.
Since the Search service still needs some data about entities, and loading the dataset with the vectors would be tremendously slow.
We have created this phase to tackle the loading speed.
We store only the most necessary information into the output file that will be subsequently loaded by the Search service.



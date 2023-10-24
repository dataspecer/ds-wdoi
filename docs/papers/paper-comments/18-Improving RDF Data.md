# Improving RDF Data with Data Mining

We have heterogenity of LOD and large datasets.
We want to automate generation of meta information, such as ontological dependencies, range definitions, and topical classifications.

Before association rule mining was used for sales analysis on transactional databses.
They did adaptation of the association rule mining technique to mine RDF data with the concept of "mining configurations" which enables mining RDF data in various ways depending on certain use cases.

- What they did?
  - Autocompletion
    - Auto-completion remedies the problem of inconsistent ontology usage, providing an editing user with a sorted list of commonly used predicates
  - New facts generation
    -  User-based approach where a user selects the entity to be amended with new facts
    -  A data-driven approach where an algorithm discovers entities that have to be amended with missing facts
  - Improving usage of RDF data
    - An association rule based approach to reconcile ontology and data. Interlacing different mining configurations, we infer an algorithm to discover synonymously used predicates. Those predicates can be used to expand query results and to support users during query formulation

- Main LOD problems: 
  - Incompleteness: missing meta information, ontological structures
  - Inconsistency: ontologies do not capture all aspects that are needed for domain-specific content od many datasets.
  
All in all, it empedes utilization of the data.
Manual improvemets are cumbersome and handcrafted ontologies are way too rigid.

## Mining RDF data - concept of configurations

### Association rule mining in transactional databases

We have a set of transactions and corresponding transaction IDs. Each transaction is a set of items from universe I. In ecommerce, I is a set of all sold products. A transaction could represent products purchased by a customer at a specific time (in a shopping basket). In another scenario a transaction could be all purchased items of a customer since the beginning of a shop. We discover correlations and behaviours of customers. We want to transform RDF data into transactional view.

What are the rules?
It is implication X -> Y where X, Y are itemsets from I with an empty intersection. There can be exponential number of itemsets X ∪ Y ⊆ I. To mitigate the problem we remove non-relevant options with a frequent patterns (frequent itemsets). The rule tells us to concentrate only on frequent patterns X (subset) I that occur in significant number of transations.

We use support and confidence to mark relevance of rules.

- Support s of a rule X -> Y
  - s % of transactions that include union of left and right side of the rule. We set a threshold for minimum % to mark relevant rules.
- Confidence c of a rule X -> Y
  -  c % of the transactions T that contain X also contain Y
  
Given a set of transactions T = {t|t ⊆ I}, the core task for mining association rules is to count the occurrences of each item combination i ⊆ I in all t ∈ T in order to discover frequent patterns

1. Discover all large itemsets, i.e., itemsets that hold minimum support.
2. For each frequent itemset a, generate all rules of the form l → a − l with
l ⊂ a that hold minimum confidence.

The paper uses FP-Growth, it creates a prefix tree and tranverses it to generate frequent itemsets.

! Algorithms in the paper (yet only briefly), not going to rewrite it.

(I think that the wikidata uses P1 -> P2 rules where transaction ids are entities and transaction set contains the entity properties, rules are of properties existing together + context (classifying properties instance of subclass of), refer to creation scripts for the rules. So it is one iteration algorithm, pretty neat.)

### Mining configurations 

Uses Subject-predicate-obect view. The triple is a statement.
They choose context which is one part of the triple and the rest is target (we assume one target from the remaining). So transaction is a set of target elements associated with one context element that represents the transaction id. Combination of context and target are the configurations. We have 6 combinations.

Examples on page 26 and forth. When reading the examples, think about what will the rules look like.
Basically explaining what we get when we fix the subject, predicate or object. All 6 combinations give us different use-cases.

## Enriching RDF data 

We want to suggest properties when creating new facts about subject (Wikipedia infoboxes or Wikidata).
An instance-based approach for suggesting new facts
entries based on predicate mining is better suited to solve this task. Once it is possible to infer property u  sage based on data mining, it is obvious to apply the suggestion system for remaining parts of a statement.

1. Auto-completion of new fact entries through predicate or object value suggestion for the given subject.
2. Amendment of Rdf data with completely new triples, based on patterns over existing triples and the previous suggestion step

There are two pathways, first we suggest predicate and then ammend with object or the other way around.

1. Suggesting predicates first
   - The target of mining are predicates
   - They use FP-Growth algorithm for generating all association rules between predicates.
   - Then they create predicate-predicate matrix when one index is the left side and the other is the right side of a rules. Each entry specfies confidence of the rule involning the specific antecedent and consequent.
   - Then based on already inserted facts on an item, they can compute suggestions with formula:
   - (above,s)P′_0 = {p ∈ P |aConf(sP_0, p) ≥ minConf}, The set sP′0 contains all predicates from P , for which the function aConf exceeds the minimum confidence threshold minConf.
   - Here, aConf aggregates the confidence values of all available rules conf(Q → p) with Q ⊆ sP_0 and creates one overall confidence value between 0 and 1.
   - aConf (sP_0, p) = (∑(Q∈sP_0) conf(Q → p)2 ) /|sP_0| 
   - The formula says that small number of high confidence rules have a priority over higher number of low confidence rules. The computed set is sorted based on the confidence values.
2. Suggesting values first
  - It is equivalent but the number of values is much greater.

1. For the first case, suggested predicate and we want object
   - Then ammendment comes into a play. Basically after the first suggestion, suggest the missing part.
   - There are two ways to achieve this, by user selecting an item and ammending it or let the system choose itself.
   - Not sure how they can reach meaningful results with this step.
   - If we suggested the predicate for a subject. We want to suggest its value as well.
   - To do so, we need all association rules involving objects sO = {o|(s, ∗, o) ∈ KB}, from the existing facts of the current subject s. But we know the predicate. So we prune all objects that have never been in the range of this predicate within the data set and consider only the rules that have pO = {o|(∗, p, o) ∈ KB} in their consequence.

The rest of the paper is not in my interest.
But I will try to look on the FP Growth algorithm.

### FP Growth

https://www.javatpoint.com/fp-growth-algorithm-in-data-mining

https://www.geeksforgeeks.org/ml-frequent-pattern-growth-algorithm/
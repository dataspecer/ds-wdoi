from experiments.initial_search_class_selection.initial_search_class_selection import main_initial_search_class_selection
from experiments.create_search_queries.create_search_queries import main_create_search_queries
from experiments.execute_seach_queries.execute_search_queries import main_methods_without_reranking, main_methods_with_boost_reranker

#main_initial_search_class_selection("./output/classes-recs.json", "./statistics-and-logs/with-diploma/classes_number_of_instances_and_normalize.json", "./statistics-and-logs/with-diploma/classes_ancestors_count.json", "./statistics-and-logs/with-diploma/classes_children_count.json")
#main_create_search_queries("./output/classes-recs.json", ["./statistics-and-logs/with-diploma/initial_search_class_selection.json", "./statistics-and-logs/with-diploma/initial_search_class_selection_substitution.json"], "./statistics-and-logs/with-diploma/user-generated-queries.csv")
#main_methods_without_reranking("./search_queries.json")
main_methods_with_boost_reranker("./search_queries.json")
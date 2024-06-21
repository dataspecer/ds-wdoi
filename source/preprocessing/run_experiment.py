from experiments.initial_search_class_selection.initial_search_class_selection import main_initial_search_class_selection
from experiments.create_search_queries.create_search_queries import main_create_search_queries

#main_initial_search_class_selection("./output/classes-recs.json", "./statistics-and-logs/with-diploma/classes_number_of_instances_and_normalize.json", "./statistics-and-logs/with-diploma/classes_ancestors_count.json", "./statistics-and-logs/with-diploma/classes_children_count.json")

main_create_search_queries("./output/classes-recs.json", ["./statistics-and-logs/with-diploma/initial_search_class_selection.json", "./statistics-and-logs/with-diploma/initial_search_class_selection_substitution.json"], "./statistics-and-logs/with-diploma/user-generated-queries.csv")
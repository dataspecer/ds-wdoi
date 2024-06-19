from experiments.initial_search_class_selection.initial_search_class_selection import main_initial_search_class_selection
##from experiments.post_initial_search_class_selection.post_initial_search_class_selection import main_post_initial_search_class_selection

main_initial_search_class_selection("./output/classes-recs.json", "./statistics-and-logs/with-diploma/classes_number_of_instances_and_normalize.json", "./statistics-and-logs/with-diploma/classes_ancestors_count.json", "./statistics-and-logs/with-diploma/classes_children_count.json")

##main_post_initial_search_class_selection(["./output/initial_search_class_selection.json", "./output/initial_search_class_selection_substitution.json"])
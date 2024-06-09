import core.utils.decoding as decoding
import core.utils.logging as ul
from core.utils.timer import timed
from core.model_simplified.classes import ClassFields
from summaries.summaries import main_logger
import pathlib

logger = main_logger.getChild("classes_subjects_objects")

@timed(logger)
def main_classes_subjects_objects(classes_json_file_path: pathlib.Path):
    with open(classes_json_file_path, "rb") as classes_input_file:
        results = []
        for cls in decoding.entities_from_file(classes_input_file, logger, ul.CLASSES_PROGRESS_STEP):
            results.append({
                "subject_of_count_consts": len(cls[ClassFields.SUBJECT_OF_CONSTS.value]),
                "value_of_count_consts": len(cls[ClassFields.VALUE_OF_CONSTS.value]),
                "subject_of_count_stats": len(cls[ClassFields.SUBJECT_OF_STATS.value]),
                "value_of_count_stats": len(cls[ClassFields.VALUE_OF_STATS.value]),
                "id": cls[ClassFields.ID.value],
                "label": cls[ClassFields.LABELS.value]["en"],
            })

        results.sort(reverse=True, key=lambda x: x['subject_of_count_consts'])    
        with open("classes_subjects_objects_sorted_subjects.json", "wb") as o:
            decoding.init_json_array_in_files([o])
            for cls in results:
                decoding.write_wd_entity_to_file(cls, o)
            decoding.close_json_array_in_files([o])
        
        results.sort(reverse=True, key=lambda x: x['value_of_count_consts'])    
        with open("classes_subjects_objects_sorted_objects.json", "wb") as o:
            decoding.init_json_array_in_files([o])
            for cls in results:
                decoding.write_wd_entity_to_file(cls, o)
            decoding.close_json_array_in_files([o])
            
        results.sort(reverse=True, key=lambda x: x['subject_of_count_stats'])    
        with open("classes_subjects_objects_sorted_subjects_stats.json", "wb") as o:
            decoding.init_json_array_in_files([o])
            for cls in results:
                decoding.write_wd_entity_to_file(cls, o)
            decoding.close_json_array_in_files([o])
        
        results.sort(reverse=True, key=lambda x: x['value_of_count_stats'])      
        with open("classes_subjects_objects_sorted_objects_stats.json", "wb") as o:
            decoding.init_json_array_in_files([o])
            for cls in results:
                decoding.write_wd_entity_to_file(cls, o)
            decoding.close_json_array_in_files([o])
                
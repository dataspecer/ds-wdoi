import argparse
import pathlib
from phases.extraction.extraction_phase import main_extraction, Phases

if __name__ == "__main__":
    parser = argparse.ArgumentParser(
                prog="Classes and properties extractor",
                description="""The script extracts classes and properties from previous step (extraction) into a new simplified data model.
                               The outputs are two files "classes-ex.json" and "properties-ex.json" uncompressed.
                               The algorithm works in two phases.
                               The first phase extracts classes and the second phase extracts properties.
                            """)
    parser.add_argument("phase",
                        type=str,
                        choices=[Phases.BOTH, Phases.CLASSES, Phases.PROPERTIES],
                        help="cls - transform only classes, props - transform only properties, both - transform both")
    parser.add_argument("classesGzipFile",
                        type=pathlib.Path, 
                        help="A path to the extracted classes json dump .gz file.")
    parser.add_argument("propertiesGzipFile",
                        type=pathlib.Path, 
                        help="A path to the extracted properties json dump .gz file.")
    args = parser.parse_args()
    
    main_extraction(args.phase, args.classesGzipFile, args.propertiesGzipFile)
      
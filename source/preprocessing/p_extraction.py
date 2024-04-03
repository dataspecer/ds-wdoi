import argparse
import pathlib
from core.default_languages import DEFAULT_LANGUAGES
from phases.extraction.extraction_phase import main_extraction

if __name__ == "__main__":
    parser = argparse.ArgumentParser(
                prog="Classes and properties extractor",
                description="""The script extracts classes and properties from previous step (extraction) into a new simplified data model.
                               The outputs are two files "classes-ex.json" and "properties-ex.json" uncompressed.
                               The algorithm works in two phases.
                               The first phase extracts classes and the second phase extracts properties.
                            """)
    parser.add_argument("--lang",
                        nargs="+",
                        action="store",
                        dest="lang",
                        default=DEFAULT_LANGUAGES,
                        type=str,
                        help="Usage \"--langs en cs ... -- posArg1 posArg2 ...\" or at the end \"... posArgN --lang en cs ...")
    parser.add_argument("phase",
                        type=str,
                        choices=["cls", "both", "props"],
                        help="cls - transform only classes, props - transform only properties, both - transform both")
    parser.add_argument("classesGzipFile",
                        type=pathlib.Path, 
                        help="A path to the extracted classes json dump .gz file.")
    parser.add_argument("propertiesGzipFile",
                        type=pathlib.Path, 
                        help="A path to the extracted properties json dump .gz file.")
    args = parser.parse_args()
    
    main_extraction(args.phase, args.lang, args.classesGzipFile, args.propertiesGzipFile)
      
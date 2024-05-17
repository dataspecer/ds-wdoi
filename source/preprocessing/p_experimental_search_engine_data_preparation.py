import argparse
import pathlib
from phases.experimental_search_engine_data_preparation.search_engine_data_preparation_phase import main_search_engine_data_preparation, Phases

if __name__ == "__main__":
    parser = argparse.ArgumentParser(
                prog="Prepare data for loading to search engine.",
                description="""The script transforms the entities into a new format.
                                Reduces property usage, assign additional lexical information to classes, lexicalizes entities and vectorizes them.
                            """)
    parser.add_argument("phase",
                        type=str,
                        choices=[Phases.ALL, Phases.PROPERTY_USAGE_REDUCTION, Phases.EXPAND_TO_LANGUAGE_FIELDS, Phases.LEXICALIZE, Phases.VECTORIZE],
                        help="Selects a phase to execute. Note that there are dependencies between the phases -> reduction, then expanding, then lexicalize and lastly vectorize.")
    parser.add_argument("classJsonFile",
                        type=pathlib.Path, 
                        help="A path to the extracted classes json dump .gz file.")
    parser.add_argument("propertiesJsonFile",
                        type=pathlib.Path, 
                        help="A path to the extracted properties json dump .gz file.")
    parser.add_argument("gzipDumpFile",
                        type=pathlib.Path, 
                        help="A path to the Wikidata .gz json dump file, needed for assignment of additional lexical information.")
    args = parser.parse_args()
    
    main_search_engine_data_preparation(args.phase, args.classJsonFile, args.propertiesJsonFile, args.gzipDumpFile)
      
import argparse
import pathlib
from phases.experimental_search_engine_loading.search_engine_loading_phase import main_search_engine_loading, Phases

if __name__ == "__main__":
    parser = argparse.ArgumentParser(
                prog="Loads aliases and labels into the search service (Elastic search)",
                description="""The script load data to Qdrant and Elastic search.
                            """)
    parser.add_argument("phase",
                        type=str,
                        choices=[Phases.BOTH, Phases.QDRANT, Phases.ELASTIC],
                        help="Selects a phase to execute.")
    parser.add_argument("classesJsonFile",
                        type=pathlib.Path, 
                        help="A path to the preprocessed classes json file.")
    parser.add_argument("propertiesJsonFile",
                        type=pathlib.Path, 
                        help="A path to the preprocessed properties json file.")
    args = parser.parse_args()
    
    main_search_engine_loading(args.phase, args.classesJsonFile, args.propertiesJsonFile)
      
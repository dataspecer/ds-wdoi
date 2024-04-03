import argparse
import pathlib
from phases.modification.modification_phase import main_modification

if __name__ == "__main__":
    parser = argparse.ArgumentParser(
                prog="Modify strcture and semantics of classes and properties.",
                description="""The scripts loads all the data from previous step and modifies them.
                                For futher information refer to the project readme.
                            """)
    parser.add_argument("classesJsonFile",
                        type=pathlib.Path, 
                        help="A path to the separated classes json file.")
    parser.add_argument("propertiesJsonFile",
                        type=pathlib.Path, 
                        help="A path to the separated properties json file.")
    parser.add_argument("classesPropertyStatsJsonFile",
                        type=pathlib.Path, 
                        help="A path to the property usage statistics on classes json file.")
    parser.add_argument("propertiesStatsJsonFile",
                        type=pathlib.Path, 
                        help="A path to the property domain and range statistics on properties json file.")
    args = parser.parse_args()
    
    main_modification(args.classesJsonFile, args.propertiesJsonFile, args.classesPropertyStatsJsonFile, args.propertiesStatsJsonFile)
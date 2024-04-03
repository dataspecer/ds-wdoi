import argparse
import pathlib
from phases.property_recommendations.property_recommendations_phase import main_property_recommendations

if __name__ == "__main__":
    parser = argparse.ArgumentParser(
                prog="A phase for changing ordering of properties that require precomputation.",
                description="""The scripts loads all the data from previous step and precomputes recommendations of properties for classes.
                               It boosts properties of classes enclosed in the properties_for_this_type property.
                            """)
    parser.add_argument("classesJsonFile",
                        type=pathlib.Path, 
                        help="A path to the modified classes json file.")
    parser.add_argument("propertiesJsonFile",
                        type=pathlib.Path, 
                        help="A path to the modified properties json file.")
    args = parser.parse_args()
    
    main_property_recommendations(args.classesJsonFile, args.propertiesJsonFile)
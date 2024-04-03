import argparse
import pathlib
from phases.identification_separation.identification_separation_phase import main_identification_separation

if __name__ == "__main__":
    parser = argparse.ArgumentParser(
                prog="Wikidata class and properties identification and separation",
                description="""The script identifies and separates classes and properties from the wikidata .gz json dump to two new files.
                            For the given dump, it iterates over each json line and checks whether the entity is a class or a property.
                            It creates corresponding two files "classes.json.gz" and "properties.json.gz".
                            Each file contains a json array where on each line is a wikidata entity preserving the Wikidata data model of entities.
                            The algorithm runs in two phases. 
                            The first phase identifies classes and properties Ids from the dump into a set.
                            The second phase iterates over the dump again separating classes and properties into separate files.
                            During this phases, the statistics of property usage are computed.
                            For the statistics it creates two files: classes-property-usage.json and properties-domain-range-usage.json.
                            """)
    parser.add_argument("gzipDumpFile",
                        type=pathlib.Path, 
                        help="A path to the Wikidata .gz json dump file.")
    args = parser.parse_args()
    
    main_identification_separation(args.gzipDumpFile)
      
import argparse
from core.default_languages import DEFAULT_LANGUAGES
from phases.run_all import main_run_all, Phases

if __name__ == "__main__":
    parser = argparse.ArgumentParser(
                prog="Runs all phases of the preprocessing pipeline.",
                description="""Last phase assumes there is a running elastic search.
                               You can set a flag to download the gzip file, otherwise it expects there is a gzip dump file.
                               You can also set a flag to exlude the loading to Elastic search.
                            """)
    parser.add_argument('--download', default=False, action=argparse.BooleanOptionalAction, help="If set, the pipeline downloads the newest Wikidata json gzip dump, before preprocessing starts. Is disregarded if --continue-from is used.")
    parser.add_argument('--restart', default=False, action=argparse.BooleanOptionalAction, help="If set, the script tries to restart the API service at the end of the pipeline.")
    parser.add_argument('--exclude-load', default=False, action=argparse.BooleanOptionalAction, help="If set, the loading phase is exluded from the pipeline.")
    parser.add_argument("--continue-from",
                        type=str,
                        choices=[Phases.ID_SEP, Phases.EXT, Phases.MOD, Phases.RECS, Phases.LOAD],
                        default=Phases.ALL,
                        help="Continue from a phase. Defaults to running all. Downloading can be done only if not continuing from a phase and download option is set.")    
    args = parser.parse_args()
    
    main_run_all(args.lang, args.download, args.continue_from, args.exclude_load, args.restart)
import argparse
from core.default_languages import DEFAULT_LANGUAGES
from phases.run_all import main_run_all, Phases

if __name__ == "__main__":
    parser = argparse.ArgumentParser(
                prog="Runs all phases of the preprocessing pipeline.",
                description="""Last phase assumes there is a running elastic search.
                               You can set a flag to download the gzip file, otherwise it expects there is a gzip dump file.
                               You can set the languages used during extraction - defaults to "en".
                               If you set your languages but do not include "en", then it would automatically be included.
                            """)
    parser.add_argument("--lang",
                        nargs="+",
                        action="store",
                        dest="lang",
                        default=DEFAULT_LANGUAGES,
                        type=str,
                        help="Usage \"--langs en cs ... -- posArg1 posArg2 ...\" or at the end \"... posArgN --lang en cs ... ALWAYS INCLUDE \"en\" language.")
    parser.add_argument('--download', default=False, action=argparse.BooleanOptionalAction, help="Downloads new Wikidata json gzip dump, before preprocessing in the pipeline. Is disregarded if --continue-from is used.")
    parser.add_argument("--continue-from",
                        type=str,
                        choices=[Phases.ID_SEP, Phases.EXT, Phases.MOD, Phases.RECS, Phases.LOAD],
                        default=Phases.ALL,
                        help="Continue from a phase. Defaults to running all. Downloading can be done only if not continuing from a phase and download option is set.")    
    args = parser.parse_args()
    
    main_run_all(args.lang, args.download, args.continue_from)
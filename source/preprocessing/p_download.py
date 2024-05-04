import argparse
import pathlib
from core.default_languages import DEFAULT_LANGUAGES
from phases.download.download_phase import main_download

if __name__ == "__main__":
    parser = argparse.ArgumentParser(
                prog="Downloads wikidata latest-all.json.gz dump.",
                description="""Overwrites the current file if it exists.
                            """)
    main_download()
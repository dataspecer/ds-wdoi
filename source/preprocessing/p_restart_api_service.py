import argparse
from phases.restart_service import main_restart_api_service, DEFAULT_TIMEOUT

if __name__ == "__main__":
    parser = argparse.ArgumentParser(
                prog="Restart api service",
                description="""Restarts the running Wikidata ontology API service.
                            """)
    parser.add_argument("--timeout", type=int, default=DEFAULT_TIMEOUT,
                    help="The number of seconds before timeout error.")
    args = parser.parse_args()
    
    main_restart_api_service(args.timeout)
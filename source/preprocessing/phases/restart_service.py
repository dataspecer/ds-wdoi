from dotenv import load_dotenv, find_dotenv
import core.utils.logging as ul
from core.utils.timer import timed
import requests
import os

load_dotenv(find_dotenv())

main_logger = ul.root_logger.getChild("restart_service")

DEFAULT_TIMEOUT = 360 # s

def __restart_service(url_env, restart_key_env, timeout: int | None) -> bool:
    try:
        url = os.getenv(url_env)
        restart_key = os.getenv(restart_key_env)
        timeout = timeout if timeout != None else DEFAULT_TIMEOUT
        
        requests.get(url, params={
            "restartKey": restart_key
        }, timeout=timeout)
        
        return True
    except Exception as e:
        main_logger.exception("There was an error that cannot be handled")
        main_logger.critical("Exiting phase...")
        return False
    
@timed(main_logger)
def main_restart_api_service(timeout: int | None) -> bool:
    return __restart_service("API_SERVICE_RESTART", "API_SERVICE_RESTART_KEY", timeout)
    
@timed(main_logger)
def main_restart_search_service(timeout: int | None) -> bool:
    return __restart_service("SEARCH_SERVICE_RESTART", "SEARCH_SERVICE_RESTART_KEY", timeout)
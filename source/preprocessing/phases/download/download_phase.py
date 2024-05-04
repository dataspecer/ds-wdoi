import requests
from pathlib import Path
from tqdm import tqdm
from core.utils.timer import timed
import core.utils.logging as ul
import time

"""
I am reusing retryable download with requests lib from:
https://tobiasraabe.github.io
https://gist.github.com/tobiasraabe/58adee67de619ce621464c1a6511d7d9

The code below is adjusted for my use case.
"""
main_logger = ul.root_logger.getChild("download")

WIKIDATA_GZ_DUMP_URL = 'https://dumps.wikimedia.org/wikidatawiki/entities/latest-all.json.gz'
WAIT_TIME = 30 # s
MAX_RETRIES = 8

DUMP_OUTPUT_FILE = WIKIDATA_GZ_DUMP_URL.split('/')[-1]
DOWNLOAD_FOLDER = Path('.')

class RetryFlag:
    def __init__(self) -> None:
        self.loaded_chunk = False
        self.count = 0
        
    def reset(self):
        self.loaded_chunk = True
        self.count = 0

    def set_up(self):
        self.loaded_chunk = False
        self.count += 1

class InitialFlag:
    def __init__(self) -> None:
        self.is_initial = True
        
    def set(self):
        self.is_initial = False

def __wait_before_retry(retries: int):
    wait_time = WAIT_TIME
    if retries != 0:
        for _ in range(retries):
            wait_time *= 2
    main_logger.info(f"Waiting {wait_time}s before retry")
    time.sleep(wait_time)

@timed(main_logger)
def __downloader(url, retry_flag: RetryFlag, initial_flag: InitialFlag, resume_byte_pos: int = None):
    """
    Donwloads dump from url.
    If given the resume_byte_pos, it resumes the download from the position.
    """

    # Get size of file
    r = requests.head(url)
    file_size = int(r.headers.get('content-length', 0))

    # Append information to resume download at specific byte position to header
    resume_header = ({'Range': f'bytes={resume_byte_pos}-'}
                     if resume_byte_pos else None)

    # Establish connection
    r = requests.get(url, stream=True, headers=resume_header)

    # Set configuration
    block_size = 1024
    initial_pos = resume_byte_pos if resume_byte_pos else 0
    mode = 'ab' if resume_byte_pos else 'wb'
    file = DOWNLOAD_FOLDER / DUMP_OUTPUT_FILE

    with open(file, mode) as f:
        with tqdm(total=file_size, unit='B',
                  unit_scale=True, unit_divisor=1024,
                  desc=file.name, initial=initial_pos,
                  ascii=True, miniters=1) as pbar:
            for chunk in r.iter_content(64 * block_size):
                f.write(chunk)
                # Reset retries when successfuly downloaded chunk.
                retry_flag.reset()
                # Set that the initial chunk was loaded.
                initial_flag.set()
                pbar.update(len(chunk))

def __download_dump() -> bool:
    url = WIKIDATA_GZ_DUMP_URL
    initial_flag = InitialFlag()
    retry_flag = RetryFlag()
    
    while True:
        try:
            # Establish connection to header of file
            r = requests.head(url)

            # Get filesize of online and offline file
            file_size_online = int(r.headers.get('content-length', 0))
            file = DOWNLOAD_FOLDER / DUMP_OUTPUT_FILE
            
            if not initial_flag.is_initial and file.exists():
                file_size_offline = file.stat().st_size
                
                if file_size_online != file_size_offline:
                    main_logger.info(f'File {file} is incomplete. Resume download.')
                    __downloader(url, retry_flag, initial_flag, file_size_offline)
                else:
                    main_logger.info(f'File {file} is complete. Skip download.')
            else:
                main_logger.info(f'Starting full download.')
                __downloader(url, retry_flag, initial_flag)
            
            # On success return
            main_logger.info("Download is complete.")
            return True
        except requests.exceptions.RequestException as e:
            main_logger.exception("There was an error during download.")
            # Set entries flag
            if retry_flag.count < MAX_RETRIES:
                main_logger.info("Will try again.")
                __wait_before_retry(retry_flag.count)
                retry_flag.set_up()
                main_logger.info(f"Retrying download. Attempt {retry_flag.count}.")
            else:
                main_logger.info("Exceeded maximum number of retries, exiting phase.")
                return False
            
@timed(main_logger)    
def main_download():
    try:
        return __download_dump()
    except Exception as e:
        main_logger.exception("There was an error that cannot be handled.")
        main_logger.critical("Exiting phase...")
        return False
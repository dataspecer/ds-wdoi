import time
from datetime import timedelta

def get_time():
    return time.time()

def get_formated_elapsed_time(start, end):
    elapsed = end - start
    return str(timedelta(seconds=elapsed))
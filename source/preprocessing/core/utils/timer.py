import time
import functools
from datetime import timedelta

def get_time():
    return time.time()

def get_formated_elapsed_time(start, end):
    elapsed = end - start
    return str(timedelta(seconds=elapsed))

def timed(logger):
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kvargs):
            logger.info(f"Starting phase - {func.__name__}")
            phase_start_time = get_time()
           
            value = func(*args, **kvargs)
           
            phase_end_time = get_time()
            logger.info(f"Ending phase - {func.__name__}. Elapsed time %s", get_formated_elapsed_time(phase_start_time, phase_end_time))
           
            return value
        return wrapper
    return decorator


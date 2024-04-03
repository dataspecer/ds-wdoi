import logging
import logging.config

log_config = {
    "version":1,
    "root":{
        "handlers" : ["console", "file"],
        "level": "INFO"
    },
    "handlers":{
        "console":{
            "formatter": "basic_formatter",
            "class": "logging.StreamHandler",
            "level": "INFO",
            "stream": "ext://sys.stdout"
        },
        "file":{
            "class": "logging.handlers.RotatingFileHandler",
            "level":"INFO",
            "filename":"log.log",
            "maxBytes": 2147483648, # 2 GiB
            "backupCount": 1,
            "encoding": "utf8"
        }
    },
    "formatters":{
        "basic_formatter": {
            "format": "%(asctime)s %(levelname)-8s %(name)s : %(message)s",
            "datefmt": "%Y-%m-%d %H:%M:%S"
        }
    },
}

logging.config.dictConfig(log_config)
root_logger = logging.getLogger("root")

ENTITY_PROGRESS_STEP = 100_000
CLASSES_PROGRESS_STEP = 100_000
PROPERTIES_PROGRESS_STEP = 1_000
RECS_PROGRESS_STEP = 10_000

def __log_progress_message(i, context_message):
    return f"Processed {i:,} entities. {context_message}"

def log_progress(logger, i, context_message = ""):
    logger.info(__log_progress_message(i, context_message))

def try_log_progress(logger, i, step, context_message = ""):
    if i % step == 0:
        log_progress(logger, i, context_message)
        
def log_loading_to_map(logger, entity_map):
        logger.info(f"Loaded {len(entity_map)} entities")

        
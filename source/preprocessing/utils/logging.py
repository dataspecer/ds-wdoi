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

        
WIKIDATA_ENTITY_PREFIX = "http://www.wikidata.org/entity/"

def construct_wd_iri(str_id: str) -> str:
    return WIKIDATA_ENTITY_PREFIX + str_id
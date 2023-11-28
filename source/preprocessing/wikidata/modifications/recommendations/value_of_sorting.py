from source.preprocessing.wikidata.modifications.context import Context
from wikidata.modifications.modifier_full import ModifierFull
from wikidata.modifications.context import *

class ValueOfSorting(ModifierFull):
    
    def __init__(self, logger, context: RecommendationContext) -> None:
        super().__init__(logger, context)
        self.context = context
    
    def modify_all(self) -> None:
        pass
    
    def report_status(self) -> None:
        pass
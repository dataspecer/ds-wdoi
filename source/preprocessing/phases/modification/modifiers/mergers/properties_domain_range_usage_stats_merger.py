from source.preprocessing.phases.modification.modifiers.modifier_all import ModifierAll
from phases.modification.modifiers.context import *
import core.utils.logging as ul
import pathlib
import core.utils.decoding as decoding
from core.model_wikidata.properties import UnderlyingTypes
from core.model_simplified.properties import PropertyFields
from core.model_simplified.constraints import GenConstFields, ItemConstFields
from core.model_simplified.scores import ScoresFields

class PropertiesDomainRangeUsageStatsMerger(ModifierAll):
    
    def __init__(self, logger, context: Context, properties_domain_range_usage_stats_filename: pathlib.Path) -> None:
        super().__init__(logger.getChild("properties_domain_range_stats_merger"), context)
        self.properties_domain_range_usage_stats_filename = properties_domain_range_usage_stats_filename
        self.missing_properties = set()
    
    def modify_all(self) -> None:
        self.logger.info("Starting loading of property domain and range statistics")
        properties_domain_range_usage_stats: dict = decoding.load_entities_to_dict(self.properties_domain_range_usage_stats_filename, self.logger, ul.PROPERTIES_PROGRESS_STEP)
        for idx, stats_property in enumerate(properties_domain_range_usage_stats.values()):
            property_id = stats_property[PropertyFields.ID.value]
            if property_id in self.context.properties_dict:
                wd_property = self.context.properties_dict[property_id]
                wd_property[PropertyFields.CONSTRAINTS.value][GenConstFields.SUBJECT_TYPE_STATS.value] = list(map(lambda x: x[ScoresFields.CLASS.value], stats_property[GenConstFields.SUBJECT_TYPE_STATS.value]))
                if wd_property[PropertyFields.UNDERLYING_TYPE.value] == UnderlyingTypes.ENTITY:
                    wd_property[PropertyFields.CONSTRAINTS.value][GenConstFields.TYPE_DEPENDENT.value][ItemConstFields.VALUE_TYPE_STATS.value] = list(map(lambda x: x[ScoresFields.CLASS.value], stats_property[ItemConstFields.VALUE_TYPE_STATS.value]))
                else:
                    pass
            else:
                self.missing_properties.add(property_id)
                self.logger.info(f"Found missing property = {property_id}")
            ul.try_log_progress(self.logger, idx, ul.PROPERTIES_PROGRESS_STEP)
            
    def report_status(self) -> None:
        self.logger.info(f"Merged properties with domain and range statistics, but missed {len(self.missing_properties)} properties.")
        
    


from wikidata.modifications.modifier_full import ModifierFull
from wikidata.modifications.context import *
import utils.logging as ul
import pathlib
import utils.decoding as decoding
from wikidata.model.properties import Datatypes
from wikidata.model_simplified.properties import PropertyFields
from wikidata.model_simplified.constraints import GenConstFields, ItemConstFields

class PropertiesDomainRangeUsageStatsMerger(ModifierFull):
    
    def __init__(self, logger, context: Context, properties_domain_range_usage_stats_filename: pathlib.Path) -> None:
        super().__init__(logger.getChild("properties-domain-range-stats-merger"), context)
        self.properties_domain_range_usage_stats_filename = properties_domain_range_usage_stats_filename
        self.missing_properties = set()
    
    def modify_all(self) -> None:
        properties_domain_range_usage_stats: dict = decoding.load_entities_to_map(self.properties_domain_range_usage_stats_filename, self.logger, ul.PROPERTIES_PROGRESS_STEP)
        for idx, stats_property in enumerate(properties_domain_range_usage_stats.values()):
            property_id = stats_property[PropertyFields.ID.value]
            if property_id in self.context.property_map:
                wd_property = self.context.property_map[property_id]
                wd_property[PropertyFields.CONSTRAINTS.value][GenConstFields.SUBJECT_TYPE_STATS.value] = stats_property[GenConstFields.SUBJECT_TYPE_STATS.value]
                if wd_property[PropertyFields.DATATYPE.value] == Datatypes.ITEM:
                    wd_property[PropertyFields.CONSTRAINTS.value][GenConstFields.TYPE_DEPENDENT.value][ItemConstFields.VALUE_TYPE_STATS.value] = stats_property[ItemConstFields.VALUE_TYPE_STATS.value]
                else:
                    pass
            else:
                self.missing_properties.add(property_id)
                self.logger.info(f"Found missing property = {property_id}")
            ul.try_log_progress(self.logger, idx, ul.PROPERTIES_PROGRESS_STEP)
            
    def report_status(self) -> None:
        self.logger.info(f"Merged properties with domain and range statistics, but missed {len(self.missing_properties)} properties.")
        
    


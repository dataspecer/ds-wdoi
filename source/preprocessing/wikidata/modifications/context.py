class Context:
    def __init__(self, class_map: dict, property_map: dict) -> None:
        self.class_map = class_map
        self.property_map = property_map
        
class RecommendationContext(Context):
    def __init__(self, class_map: dict, property_map: dict, global_recs: dict) -> None:
        super.__init__(class_map, property_map)
        self.global_recs = global_recs
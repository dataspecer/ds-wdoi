import wikidata.modifications.modifier as mods

CHILDREN_FIELD = "children"

class MarkChildrenToParents(mods.Modifier):
    
    def add_children_field_if_missing(self, wd_entity):
        if CHILDREN_FIELD not in wd_entity:
            wd_entity[CHILDREN_FIELD] = []
    
    def __init__(self, logger) -> None:
        super().__init__()
        self.missing_parent_set = set()
        self.logger = logger.getChild("mark-children-to-parents")
    
    def __call__(self, wd_entity, context: mods.Context) -> None:
        entityId = wd_entity['id']
        self.add_children_field_if_missing(wd_entity)
        for parentId in wd_entity['subclassOf']:
            if parentId in context.class_map:
                parent = context.class_map[parentId]
                self.add_children_field_if_missing(parent)
                parent[CHILDREN_FIELD].append(entityId)
            else:
                self.logger.info(f"Missing class {parentId}")
                self.missing_parent_set.add(parentId)
    
    def report_status(self) -> None:
        self.logger.info(f"Missing {len(self.missing_parent_set)} parents")
        
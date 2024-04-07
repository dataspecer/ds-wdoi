import type { EntityId, EntityIdsList } from '../../entities/common';
import { WdClass } from '../../entities/wd-class';
import { WdEntity } from '../../entities/wd-entity';
import type { WdProperty } from '../../entities/wd-property';

export class FilterPropertyRecord {
  readonly propertyId: EntityId;
  rangeIds: EntityId[] = [];

  constructor(propertyId: EntityId) {
    this.propertyId = propertyId;
  }
}

export class InstanceFilterReturnWrapper {
  readonly instanceOfIds: EntityIdsList;
  readonly subjectOfFilterRecords: FilterPropertyRecord[];
  readonly valueOfFilterRecords: FilterPropertyRecord[];

  constructor(instanceOfIds: EntityIdsList, subjectOfFilterRecords: FilterPropertyRecord[], valueOfFilterRecords: FilterPropertyRecord[]) {
    this.instanceOfIds = instanceOfIds;
    this.subjectOfFilterRecords = subjectOfFilterRecords;
    this.valueOfFilterRecords = valueOfFilterRecords;
  }
}

export class FilterByInstance {
  private readonly classes: ReadonlyMap<EntityId, WdClass>;
  private readonly properties: ReadonlyMap<EntityId, WdProperty>;

  private static buildQueryOutward(instanceId: number): string {
    return `
    # Properties with no class either mean it is a literal property or that the value pointed to was not an instance of a class, which needs to be checked.
    SELECT ?instanceOfId ?propertyId ?classId
    WHERE
    {
        wd:Q${instanceId} ?p ?value ;
            wdt:P31 ?instanceOfValue .
        
        # Get only properties pointing to statement nodes values extracted directly in the entity. 
        FILTER(STRSTARTS(STR(?p), CONCAT(STR(wdt:), "P")))
        
        # The property can point to an entity which can be instance of a class.
        OPTIONAL {
            ?value wdt:P31 ?class . 
        } 
        
        BIND(STRDT(STRAFTER(STR(?instanceOfValue), CONCAT(STR(wd:), "Q")), xsd:integer) as ?instanceOfId)
        BIND(STRDT(STRAFTER(STR(?p), CONCAT(STR(wdt:), "P")), xsd:integer) as ?propertyId)
        BIND(STRDT(STRAFTER(STR(?class), CONCAT(STR(wd:), "Q")), xsd:integer) as ?classId)
    }`;
  }

  private static buildQueryInward(instanceId: number): string {
    return `
    # Properties with no class either mean it is a literal property or that the value pointed to was not an instance of a class.
    SELECT ?instanceOfId ?propertyId
    WHERE
    {
        ?item ?p wd:Q${instanceId} ;
            wdt:P31 ?instanceOfValue .
        
        # Get only properties pointing from items directly while skipping statement nodes.
        FILTER(STRSTARTS(STR(?p), CONCAT(STR(wdt:), "P")))
        
        # Filter out properties and other types, except items.
        FILTER(STRSTARTS(STR(?item), CONCAT(STR(wd:), "Q")))
        
        BIND(STRDT(STRAFTER(STR(?instanceOfValue), CONCAT(STR(wd:), "Q")), xsd:integer) as ?instanceOfId)
        BIND(STRDT(STRAFTER(STR(?p), CONCAT(STR(wdt:), "P")), xsd:integer) as ?propertyId)
    }`;
  }

  constructor(classes: ReadonlyMap<EntityId, WdClass>, properties: ReadonlyMap<EntityId, WdProperty>) {
    this.classes = classes;
    this.properties = properties;
  }

  public async createFilter(instanceUri: string): Promise<[EntityId | null, InstanceFilterReturnWrapper]> {
    const instanceId = this.tryExtractUri(instanceUri);
    if (instanceId != null) {
      return [instanceId, await this.createFilterInternal(instanceId)];
    }
    return [null, new InstanceFilterReturnWrapper([], [], [])];
  }

  private tryExtractUri(instanceUri: string): EntityId | null {
    if (WdEntity.URI_REGEXP.test(instanceUri)) {
      const [entityType, entityId] = WdEntity.parseEntityURI(instanceUri);
      if (entityType != null && WdClass.isURIType(entityType) && entityId != null) {
        return entityId;
      }
    }
    return null;
  }

  private async createFilterInternal(instanceId: EntityId): Promise<InstanceFilterReturnWrapper> {
    return new InstanceFilterReturnWrapper([], [], []);
  }
}

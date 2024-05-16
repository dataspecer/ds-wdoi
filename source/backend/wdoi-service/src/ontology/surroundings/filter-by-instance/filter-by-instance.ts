import type internal from 'stream';
import type { EntityId, EntityIdsList } from '../../entities/common.js';
import { WdClass } from '../../entities/wd-class.js';
import { WdEntity } from '../../entities/wd-entity.js';
import { WdProperty } from '../../entities/wd-property.js';
import SparqlClient from 'sparql-http-client';
import { type ClassHierarchyWalker } from '../../hierarchy-walker/class-hierarchy-walker.js';
import { logError } from '../../../logging/log.js';

interface SparqlSelectRowItem {
  value: string;
  language: string;
}

interface SparqlSelectInwardRow {
  instanceOfId?: SparqlSelectRowItem;
  propertyId?: SparqlSelectRowItem;
}

interface SparqlSelectOutwardRow {
  instanceOfId?: SparqlSelectRowItem;
  propertyId?: SparqlSelectRowItem;
  classId?: SparqlSelectRowItem;
}

export class FilterPropertyRecord {
  readonly propertyId: EntityId;
  rangeIds: EntityId[] = [];

  constructor(propertyId: EntityId) {
    this.propertyId = propertyId;
  }
}

export class FilterByInstanceReturnWrapper {
  readonly instanceOfIds: EntityIdsList;
  readonly subjectOfFilterRecords: FilterPropertyRecord[];
  readonly valueOfFilterRecords: FilterPropertyRecord[];
  readonly classIdsHierarchy: EntityIdsList;

  constructor(
    instanceOfIds: EntityIdsList,
    subjectOfFilterRecords: FilterPropertyRecord[],
    valueOfFilterRecords: FilterPropertyRecord[],
    classIdsHierarchy: EntityIdsList,
  ) {
    this.instanceOfIds = instanceOfIds;
    this.subjectOfFilterRecords = subjectOfFilterRecords;
    this.valueOfFilterRecords = valueOfFilterRecords;
    this.classIdsHierarchy = classIdsHierarchy;
  }
}

export class FilterByInstance {
  private readonly classes: ReadonlyMap<EntityId, WdClass>;
  private readonly properties: ReadonlyMap<EntityId, WdProperty>;
  private readonly hierarchyWalker: ClassHierarchyWalker;
  private readonly WIKIDATA_SPARQL_ENDPOINT = 'https://query.wikidata.org/sparql';
  private readonly wikidataSparqlClient = new SparqlClient({
    endpointUrl: this.WIKIDATA_SPARQL_ENDPOINT,
  });

  constructor(
    classes: ReadonlyMap<EntityId, WdClass>,
    properties: ReadonlyMap<EntityId, WdProperty>,
    hierarchyWalker: ClassHierarchyWalker,
  ) {
    this.classes = classes;
    this.properties = properties;
    this.hierarchyWalker = hierarchyWalker;
  }

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

  public async createFilter(instanceUri: string): Promise<FilterByInstanceReturnWrapper> {
    const instanceId = this.tryExtractUri(instanceUri);
    if (instanceId != null) {
      try {
        if (!this.classes.has(instanceId)) {
          return await this.createFilterInternal(instanceId);
        }
      } catch (e) {
        logError(e);
      }
    }
    return new FilterByInstanceReturnWrapper([], [], [], []);
  }

  private tryExtractUri(instanceUri: string): EntityId | null {
    if (WdClass.URI_REGEXP.test(instanceUri)) {
      const [entityType, entityId] = WdEntity.parseEntityURI(instanceUri);
      if (entityType != null && WdClass.isURIType(entityType) && entityId != null) {
        return entityId;
      }
    }
    return null;
  }

  private async createFilterInternal(instanceId: EntityId): Promise<FilterByInstanceReturnWrapper> {
    const outwardsResponse = this.wikidataSparqlClient.query.select(
      FilterByInstance.buildQueryOutward(instanceId),
    );
    const inwardsResponse = this.wikidataSparqlClient.query.select(
      FilterByInstance.buildQueryInward(instanceId),
    );

    const instanceOfIds: EntityId[] = [];
    const outwardFilterRecords = new Map<EntityId, FilterPropertyRecord>();
    const inwardFilterRecords = new Map<EntityId, FilterPropertyRecord>();

    await this.parseOutwardsResponse(outwardsResponse, outwardFilterRecords, instanceOfIds);
    await this.parseInwardsResponse(inwardsResponse, inwardFilterRecords);
    const classIdsHierarchy = this.getClassIdsHierarchy(instanceOfIds);

    if (instanceOfIds.length !== 0) {
      return new FilterByInstanceReturnWrapper(
        instanceOfIds,
        [...outwardFilterRecords.values()],
        [...inwardFilterRecords.values()],
        classIdsHierarchy,
      );
    } else {
      return new FilterByInstanceReturnWrapper([], [], [], []);
    }
  }

  private getClassIdsHierarchy(instanceOfIds: EntityIdsList): EntityIdsList {
    const classIdsHierarchy: EntityId[] = [];
    instanceOfIds.forEach((clsId) => {
      const cls = this.classes.get(clsId) as WdClass;
      const hierarchyResultsWrapper = this.hierarchyWalker.getHierarchy(cls, 'parents');
      classIdsHierarchy.push(
        hierarchyResultsWrapper.startClassId,
        ...hierarchyResultsWrapper.parentsIds,
      );
    });

    return classIdsHierarchy;
  }

  private parseOutwardResponseRow(
    row: SparqlSelectOutwardRow,
  ): [EntityId | undefined, EntityId | undefined, EntityId | undefined] {
    const instanceOfId = this.parseIdFromString(row.instanceOfId?.value);
    const propertyId = this.parseIdFromString(row.propertyId?.value);
    const classId = this.parseIdFromString(row.classId?.value);
    return [instanceOfId, propertyId, classId];
  }

  private parseInwardResponseRow(
    row: SparqlSelectInwardRow,
  ): [EntityId | undefined, EntityId | undefined] {
    const instanceOfId = this.parseIdFromString(row.instanceOfId?.value);
    const propertyId = this.parseIdFromString(row.propertyId?.value);
    return [instanceOfId, propertyId];
  }

  private parseIdFromString(value: any): number | undefined {
    if (typeof value === 'string') {
      const parsedId = Number(value);
      if (!Number.isNaN(parsedId)) return parsedId;
    }
    return undefined;
  }

  private addToFilterRecordsIfMissing(
    propertyId: number,
    filterRecords: Map<EntityId, FilterPropertyRecord>,
    classId: number | undefined = undefined,
  ): void {
    const record = filterRecords.get(propertyId);
    if (record == null) {
      const newRecord: FilterPropertyRecord = {
        rangeIds: classId != null ? [classId] : [],
        propertyId,
      };
      filterRecords.set(propertyId, newRecord);
    } else if (classId != null && !record.rangeIds.includes(classId)) {
      record.rangeIds.push(classId);
    }
  }

  private addToInstanceOfIdsIfMissing(instanceOfId: number, instanceOfIds: EntityId[]): void {
    if (!instanceOfIds.includes(instanceOfId)) {
      instanceOfIds.push(instanceOfId);
    }
  }

  private isValidClassId(classId: number | undefined): boolean {
    if (classId != null && this.classes.has(classId)) return true;
    else return false;
  }

  private isValidPropertyId(propertyId: number | undefined): boolean {
    if (propertyId != null && this.properties.has(propertyId)) return true;
    else return false;
  }

  private async parseOutwardsResponse(
    responseStream: internal.Readable,
    filterRecords: Map<EntityId, FilterPropertyRecord>,
    instanceOfIds: EntityId[],
  ): Promise<void> {
    for await (const row of responseStream) {
      const [instanceOfId, propertyId, classId] = this.parseOutwardResponseRow(row);
      if (this.isValidClassId(instanceOfId) && this.isValidPropertyId(propertyId)) {
        const property = this.properties.get(propertyId as number) as WdProperty;
        if (!WdProperty.isItemProperty(property)) {
          this.addToInstanceOfIdsIfMissing(instanceOfId as number, instanceOfIds);
          this.addToFilterRecordsIfMissing(propertyId as number, filterRecords);
        } else if (this.isValidClassId(classId)) {
          this.addToInstanceOfIdsIfMissing(instanceOfId as number, instanceOfIds);
          this.addToFilterRecordsIfMissing(propertyId as number, filterRecords, classId as number);
        }
      }
    }
  }

  private async parseInwardsResponse(
    responseStream: internal.Readable,
    filterRecords: Map<EntityId, FilterPropertyRecord>,
  ): Promise<void> {
    for await (const row of responseStream) {
      const [instanceOfId, propertyId] = this.parseInwardResponseRow(row);
      if (this.isValidClassId(instanceOfId) && this.isValidPropertyId(propertyId)) {
        const property = this.properties.get(propertyId as number) as WdProperty;
        if (WdProperty.isItemProperty(property)) {
          this.addToFilterRecordsIfMissing(
            propertyId as number,
            filterRecords,
            instanceOfId as number,
          );
        }
      }
    }
  }
}

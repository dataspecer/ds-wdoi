import fs from 'fs';
import readline from 'readline';
import { WdClass } from '../entities/wd-class.js';
import { WdProperty } from '../entities/wd-property.js';
import type { EntityId } from '../entities/common.js';

import { tryLog, log } from '../../logging/log.js';

function processLine(line: string, processEntityFunc: (jsonEntity: any) => void): void {
  const decodedLine = line.trim();
  if (decodedLine.startsWith('{')) {
    const jsonEntity: any = JSON.parse(decodedLine.slice(0, -1));
    processEntityFunc(jsonEntity);
  }
}

async function processWdJsonFile(pathToJsonFile: string, processEntityFunc: (jsonEntity: any) => void, logStep: number): Promise<void> {
  const fileStream = fs.createReadStream(pathToJsonFile);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  let i = 0;
  for await (const line of rl) {
    processLine(line, processEntityFunc);
    i += 1;
    tryLog(i, logStep);
  }
  log(`${i} entities`);
}

export function processFuncClassesCapture(entitiesMap: Map<EntityId, WdClass>): (jsonEntity: any) => void {
  return (jsonEntity: any) => {
    const newWdClass = new WdClass(jsonEntity);
    entitiesMap.set(newWdClass.id, newWdClass);
  };
}

export function processFuncPropertiesCapture(entitiesMap: Map<EntityId, WdProperty>): (jsonEntity: any) => void {
  return (jsonEntity: any) => {
    const newWdProperty = WdProperty.factory(jsonEntity);
    entitiesMap.set(newWdProperty.id, newWdProperty);
  };
}

export async function loadEntities<T>(
  pathToJsonFile: string,
  processFuncCapture: (entitiesMap: Map<EntityId, T>) => (jsonEntity: any) => void,
  logStep: number,
): Promise<ReadonlyMap<EntityId, T>> {
  const entitiesMap = new Map<EntityId, T>();
  await processWdJsonFile(pathToJsonFile, processFuncCapture(entitiesMap), logStep);
  return entitiesMap;
}

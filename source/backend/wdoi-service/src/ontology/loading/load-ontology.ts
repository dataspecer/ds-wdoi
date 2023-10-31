import fs from 'fs';
import readline from 'readline';
import { WdClass } from '../entities/wd-class';
import { WdProperty } from '../entities/wd-property';

function processLine(line: string, processEntityFunc: (jsonEntity: any) => void): void {
  const decodedLine = line.trim();
  if (decodedLine.startsWith('{')) {
    const jsonEntity: any = JSON.parse(decodedLine.slice(0, -1));
    processEntityFunc(jsonEntity);
  }
}

async function processWdJsonFile(pathToJsonFile: string, processEntityFunc: (jsonEntity: any) => void): Promise<void> {
  const fileStream = fs.createReadStream(pathToJsonFile);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  console.log('start');
  let i = 0;
  for await (const line of rl) {
    processLine(line, processEntityFunc);
    i += 1;
    if (i % 100_000 === 0) {
      console.log(i);
    }
  }
  console.log('done');
}

export function processFuncClassesCapture(entitiesMap: Map<number, WdClass>): (jsonEntity: any) => void {
  return (jsonEntity: any) => {
    const newWdClass = new WdClass(jsonEntity);
    entitiesMap.set(newWdClass.id, newWdClass);
  };
}

export function processFuncPropertiesCapture(entitiesMap: Map<number, WdProperty>): (jsonEntity: any) => void {
  return (jsonEntity: any) => {
    const newWdProperty = WdProperty.Factory(jsonEntity);
    entitiesMap.set(newWdProperty.id, newWdProperty);
  };
}

export async function loadEntities<T>(
  pathToJsonFile: string,
  processFuncCapture: (entitiesMap: Map<number, T>) => (jsonEntity: any) => void,
): Promise<Map<number, T>> {
  const entitiesMap = new Map<number, T>();
  await processWdJsonFile(pathToJsonFile, processFuncCapture(entitiesMap));
  return entitiesMap;
}

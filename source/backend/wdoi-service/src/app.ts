/**
 * // import { Index } from 'flexsearch';
// import { isWdEntity } from './input/input-types';
// import { createIndexEntryFromEntity } from './index/index-types';

// const idx: lunr.Index = lunr(function () {
//   this.ref('id');
//   this.field('aliases');
//   this.field('description');
//   this.field('label');

//   let i = 0;

//   const liner = new LineByLine('c:/AAA/ds-wdoi/source/preprocessing/classes.json');

//   let bufferLine = liner.next();
//   while (bufferLine != null) {
//     const line = bufferLine.toString('utf-8');
//     if (line.startsWith('{')) {
//       const entity: any = JSON.parse(line.slice(0, -1));
//       if (isWdEntity(entity)) {
//         const p = createIndexEntryFromEntity(entity, 'en');
//         this.add(p);
//       }
//     }
//     i += 1;
//     if (i % 100_000 === 0) {
//       console.log(i);
//     }
//     bufferLine = liner.next();
//   }
// });

// console.log('done');

// let i = 0;
// const idx = new Index({
//   tokenize: 'reverse',
//   charset: 'latin:extra',
// });

// lr.eachLine('c:/AAA/ds-wdoi/source/preprocessing/classes.json', function (line, last) {
//   if (!last) {
//     const decodedLine = line.trim();
//     if (decodedLine.startsWith('{')) {
//       const entity: any = JSON.parse(decodedLine.slice(0, -1));
//       if (isWdEntity(entity)) {
//         const p = createIndexEntryFromEntity(entity, 'en');
//         idx.add(entity.id, p.label + ' . ' + p.description + ' . ' + p.aliases);
//       }
//     }
//   }
//   i += 1;
//   if (i % 100_000 === 0) {
//     console.log(i);
//   }
// });

// // console.log('done');

// async function name(): Promise<void> {
//   await fetch('https://javascript.info/fetch');
//   console.log('done');
// }

// name().catch();

import fs from 'fs';
import readline from 'readline';

async function processLineByLine(storage: any[]): Promise<any[]> {
  try {
    const fileStream = fs.createReadStream('c:/AAA/ds-wdoi/source/preprocessing/classes.json');
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });

    console.log('start');
    let i = 0;
    for await (const line of rl) {
      const decodedLine = line.trim();
      if (decodedLine.startsWith('{')) {
        const entity: any = JSON.parse(decodedLine.slice(0, -1));
        storage.push(entity);
      }
      i += 1;
      if (i % 100_000 === 0) {
        console.log(i);
      }
    }
    console.log('done');
    return storage;
  } catch (err) {
    console.log(err);
    return [];
  }
}

const objs: any[] = [];
processLineByLine(objs)
  .then((value) => {
    console.log(value.length);
  })
  .catch(() => {});

 * 
 * 
 */

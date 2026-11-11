import {readFile} from 'node:fs/promises';import {databaseSchema} from '../src/domain/schema';
for(const file of ['public/data/matches.json','public/data/demo.json']) {databaseSchema.parse(JSON.parse(await readFile(file,'utf8')));console.log(`✓ ${file}`);}

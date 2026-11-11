import {readFile} from 'node:fs/promises';import {databaseSchema} from '../src/domain/schema';
for(const file of ['public/data/matches.json','public/data/demo.json']) {databaseSchema.parse(JSON.parse(await readFile(file,'utf8')));console.log(`✓ ${file}`);}

import {parseClubCatalog} from '../src/domain/matchmaker';
const catalog=parseClubCatalog(JSON.parse(await readFile('public/data/club-catalog.json','utf8')));
console.log(`✓ club-catalog: ${catalog.leagues.length} ligas / ${catalog.clubs.length} clubes`);

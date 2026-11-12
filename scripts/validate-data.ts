import {readFile} from 'node:fs/promises';import {databaseSchema} from '../src/domain/schema';
const matchesPath = 'public/data/matches.json';
databaseSchema.parse(JSON.parse(await readFile(matchesPath, 'utf8')));
console.log(`✓ ${matchesPath}`);

import {parseClubCatalog} from '../src/domain/matchmaker';
const catalog=parseClubCatalog(JSON.parse(await readFile('public/data/club-catalog.json','utf8')));
console.log(`✓ club-catalog: ${catalog.leagues.length} ligas / ${catalog.clubs.length} clubes`);

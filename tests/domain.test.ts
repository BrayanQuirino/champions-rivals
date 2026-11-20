import {test} from 'node:test';import assert from 'node:assert/strict';
import {databaseSchema,matchSchema} from '../src/domain/schema';import {standings,winner,trophiesForCoach} from '../src/domain/statistics';
const players=[{id:'a',name:'A',initials:'A'},{id:'b',name:'B',initials:'B'}];
const fixture={id:'1',date:'2026-11-10',season:'1',competition:'champions-league' as const,stage:'final' as const,home:{playerId:'a',team:'A',goals:2},away:{playerId:'b',team:'B',goals:2},extraTime:false,penalties:null,stats:null,source:{type:'manual' as const,reference:null,notes:null}};
test('Empates reparten un punto y contabilizan los goles',()=>{const rows=standings(players,[matchSchema.parse(fixture)]);assert.equal(rows[0].points,1);assert.equal(rows[1].draws,1);assert.equal(rows[0].goalsFor,2);});
test('Penales deciden ganador sin inflar goles',()=>{const m=matchSchema.parse({...fixture,penalties:{home:4,away:5}});assert.equal(winner(m),'b');const rows=standings(players,[m]);assert.equal(rows[0].id,'b');assert.equal(rows[0].points,3);assert.equal(rows[0].goalsFor,2);});
test('Rechaza duplicados y jugadores desconocidos',()=>{assert.equal(databaseSchema.safeParse({schemaVersion:1,players,matches:[fixture,fixture]}).success,false);assert.equal(databaseSchema.safeParse({schemaVersion:1,players:players.map(p=>({...p,id:p.id+'x'})),matches:[fixture]}).success,false);});
test('Rechaza penales contradictorios, goles negativos y fechas inválidas',()=>{for(const m of [{...fixture,penalties:{home:4,away:4}},{...fixture,home:{...fixture.home,goals:-1}},{...fixture,date:'2026-02-30'}])assert.equal(matchSchema.safeParse(m).success,false);});
test('Estadísticas incompletas pueden ser null, contradictorias no',()=>{const s={possession:null,shots:2,shotsOnTarget:3};assert.equal(matchSchema.safeParse({...fixture,stats:{home:s,away:s}}).success,false);assert.equal(matchSchema.safeParse(fixture).success,true);});
test('Sin partidos no inventa líder ni divide entre cero',()=>{for(const row of standings(players,[])){assert.equal(row.points,0);assert.equal(row.played,0);}});

test('Los títulos se calculan solo en finales ganadas y por competición',()=>{
 const champions=matchSchema.parse({...fixture,home:{...fixture.home,goals:3},away:{...fixture.away,goals:2}});
 const worldCup=matchSchema.parse({...fixture,id:'2',competition:'world-cup',home:{...fixture.home,goals:1},away:{...fixture.away,goals:2}});
 const tied=matchSchema.parse({...fixture,id:'3'});
 assert.deepEqual(trophiesForCoach([champions,worldCup,tied],'a'),{champions:1,worldCup:0,total:1});
 assert.deepEqual(trophiesForCoach([champions,worldCup,tied],'b'),{champions:0,worldCup:1,total:1});
 assert.deepEqual(trophiesForCoach([champions,worldCup,tied],'peter'),{champions:0,worldCup:0,total:0});
});

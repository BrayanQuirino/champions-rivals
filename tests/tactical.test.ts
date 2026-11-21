import { test } from 'node:test';
import assert from 'node:assert/strict';
import { profileFor } from '../src/domain/tactical';
import type { TacticalCatalog } from '../src/domain/tactical';
import type { Match } from '../src/domain/schema';

const axes = ['ataque','defensa','posesion','precision','creacion','efectividad'] as const;
const base = {ataque:60,defensa:50,posesion:60,precision:80,creacion:55,efectividad:68};
const catalog: TacticalCatalog = {
 schemaVersion:2,methodology:{origin:'test',scale:'0 a 100',sampleMinimumForStableArchetype:8,requiredDimensions:6,notes:''},
 dimensions:axes.map(id=>({id,label:id,source:id,method:'test'})),
 archetypes:[
  {id:'a',name:'A',description:'',radar:base},
  {id:'b',name:'B',description:'',radar:{...base,ataque:62}},
  {id:'c',name:'C',description:'',radar:{ataque:10,defensa:10,posesion:10,precision:10,creacion:10,efectividad:10}}
 ],styles:[]
};
const makeMatch=(id:number,withStats=true):Match=>({
 id:String(id),date:'2026-11-19',season:'1',competition:'champions-league',stage:'final',
 home:{playerId:'brayan',team:'Team A',goals:2},away:{playerId:'joni',team:'Team B',goals:1},
 extraTime:false,penalties:null,
 stats:withStats?{home:{possession:60,shots:10,shotsOnTarget:null,expectedGoals:2.2,passAccuracy:85,shotAccuracy:70,tackles:10,successfulTackles:6,recoveries:10,lineBreakAttempts:10},
  away:{possession:40,shots:8,shotsOnTarget:null,expectedGoals:1.5,passAccuracy:78,shotAccuracy:55,tackles:10,successfulTackles:5,recoveries:10,lineBreakAttempts:10}}:null,
 source:{type:'manual',reference:null,notes:null}
});
test('Four detailed matches assign a provisional archetype and six real axes',()=>{
 const p=profileFor(Array.from({length:4},(_,i)=>makeMatch(i)),'brayan',catalog);
 assert.equal(p.detailedMatches,4);assert.equal(p.completeAxes,6);
 assert.ok(p.archetype);assert.equal(p.status,'provisional');
 assert.ok(p.similarity!==null);assert.equal(p.candidates.length,2);
});
test('Even close templates have a provisional winner, not an empty archetype',()=>{
 const p=profileFor(Array.from({length:8},(_,i)=>makeMatch(i)),'brayan',catalog);
 assert.ok(p.archetype);assert.ok(['stable','provisional'].includes(p.status));
});
test('Score-only matches preserve a clearly provisional low-information estimate',()=>{
 const p=profileFor([makeMatch(1,false)],'joni',catalog);
 assert.equal(p.detailedMatches,0);assert.equal(p.completeAxes,2);
 assert.ok(p.archetype);assert.equal(p.status,'provisional');
 assert.equal(p.values.posesion,null);assert.equal(p.values.creacion,null);
});
test('No games means no invented tactical identity',()=>{
 const p=profileFor([],'brayan',catalog);
 assert.equal(p.archetype,null);assert.equal(p.status,'none');
});
test('All radar metrics are bounded and measured from player perspective',()=>{
 const match=makeMatch(1);
 const home=profileFor([match],'brayan',catalog);
 const away=profileFor([match],'joni',catalog);
 assert.equal(home.values.posesion,60);assert.equal(away.values.posesion,40);
 for(const v of Object.values(home.values))assert.ok(v!==null&&v>=0&&v<=100);
});

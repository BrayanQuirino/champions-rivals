import { test } from 'node:test';
import assert from 'node:assert/strict';
import { profileFor } from '../src/domain/tactical';
import type { TacticalCatalog } from '../src/domain/tactical';
import type { Match } from '../src/domain/schema';

const axes = ['posesion', 'pases', 'finalizacion', 'entradas', 'recuperaciones', 'progresion'] as const;
const base = {posesion:60,pases:85,finalizacion:70,entradas:50,recuperaciones:50,progresion:50};
const catalog: TacticalCatalog = {
  schemaVersion:1,methodology:{origin:'test',scale:'0 a 100',sampleMinimumForStableArchetype:8,requiredDimensions:6,notes:''},
  dimensions:axes.map(id=>({id,label:id,source:id,method:'test'})),
  archetypes:[
    {id:'a',name:'A',description:'',radar:base},
    {id:'b',name:'B',description:'',radar:{...base,posesion:62}},
    {id:'c',name:'C',description:'',radar:{...base,posesion:10,pases:10}}
  ],styles:[]
};
const makeMatch=(id:number,overrides:Partial<NonNullable<Match['stats']>['home']>={}):Match=>({
 id:String(id),date:'2026-11-19',season:'1',competition:'champions-league',stage:'final',
 home:{playerId:'brayan',team:'Team A',goals:2},away:{playerId:'joni',team:'Team B',goals:1},
 extraTime:false,penalties:null,
 stats:{home:{possession:60,shots:10,shotsOnTarget:null,passAccuracy:85,shotAccuracy:70,tackles:10,recoveries:10,lineBreakAttempts:10,...overrides},
 away:{possession:40,shots:10,shotsOnTarget:null,tackles:10,recoveries:10,lineBreakAttempts:10}},
 source:{type:'manual',reference:null,notes:null}
});
test('Four detailed matches do not force an archetype',()=>{
 const p=profileFor(Array.from({length:4},(_,i)=>makeMatch(i)),'brayan',catalog);
 assert.equal(p.detailedMatches,4);assert.equal(p.completeAxes,6);
 assert.equal(p.archetype,null);assert.equal(p.status,'provisional');
 assert.equal(p.reason,'insufficient-data');assert.equal(p.candidates.length,2);
});
test('Ambiguous top two templates do not assign an archetype even with enough matches',()=>{
 const p=profileFor(Array.from({length:8},(_,i)=>makeMatch(i)),'brayan',catalog);
 assert.equal(p.reason,'ambiguous');assert.equal(p.archetype,null);
});
test('Strong and distinct profile can be classified after sufficient matches',()=>{
 const distinct={...catalog,archetypes:[catalog.archetypes[0],catalog.archetypes[2]]};
 const p=profileFor(Array.from({length:8},(_,i)=>makeMatch(i)),'brayan',distinct);
 assert.equal(p.status,'stable');assert.equal(p.archetype?.id,'a');
});

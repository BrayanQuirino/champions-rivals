import test from 'node:test';
import assert from 'node:assert/strict';
import {clubsForDraw,clubsForMinimumRating,pickBalancedMatch,parseClubCatalog} from '../src/domain/matchmaker';
import type {Club} from '../src/domain/matchmaker';
const clubs:Club[]=[
{id:'a',name:'A',leagueId:'l',country:'X',rating:4,elo:1800,logoUrl:null},
{id:'b',name:'B',leagueId:'l',country:'X',rating:4,elo:1795,logoUrl:null},
{id:'c',name:'C',leagueId:'l',country:'X',rating:3,elo:1600,logoUrl:null}
];
test('selection always yields distinct clubs within one star',()=>{
 for(const random of [()=>0,()=>0.3,()=>0.99]){const match=pickBalancedMatch(clubs,random);assert.ok(match);assert.notEqual(match.home.id,match.away.id);assert.ok(Math.abs(match.home.rating-match.away.rating)<=1);}
});
test('filters honor league and star level',()=>{assert.equal(clubsForDraw({schemaVersion:1,updatedAt:'',ratingMethod:'',source:'',leagues:[],clubs},'l',4).length,2);});
test('single eligible club cannot be drawn',()=>assert.equal(pickBalancedMatch([clubs[0]]),null));
test('invalid club ratings are rejected',()=>assert.throws(()=>parseClubCatalog({schemaVersion:1,leagues:[{id:'l',name:'L'}],clubs:[{...clubs[0],rating:8}]})));

test('minimum-rating filter includes the selected tier and every higher tier',()=>{
 const fixture={schemaVersion:1,updatedAt:'',ratingMethod:'',source:'',leagues:[],clubs:[...clubs,{...clubs[0],id:'elite',rating:5}]};
 assert.deepEqual(clubsForMinimumRating(fixture,'l',3).map(c=>c.id),['a','b','c','elite']);
 assert.deepEqual(clubsForMinimumRating(fixture,'l',4).map(c=>c.id),['a','b','elite']);
 assert.deepEqual(clubsForMinimumRating(fixture,'l',5).map(c=>c.id),['elite']);
 assert.equal(clubsForMinimumRating(fixture,'other',3).length,0);
});
test('minimum-rating filter rejects out-of-range tier values',()=>{
 const fixture={schemaVersion:1,updatedAt:'',ratingMethod:'',source:'',leagues:[],clubs};
 assert.deepEqual(clubsForMinimumRating(fixture,'all',0),[]);
 assert.deepEqual(clubsForMinimumRating(fixture,'all',6),[]);
});

test('half-star selection is inclusive and keeps balanced draws',()=>{
 const fixture={schemaVersion:1,updatedAt:'',ratingMethod:'',source:'',leagues:[],clubs:[
 {...clubs[0],id:'3half-a',rating:3.5},
 {...clubs[1],id:'3half-b',rating:3.5},
 {...clubs[2],id:'4stars',rating:4},
 {...clubs[2],id:'3stars',rating:3},
 ]};
 const eligible=clubsForMinimumRating(fixture,'l',3.5);
 assert.deepEqual(eligible.map(c=>c.id),['3half-a','3half-b','4stars']);
 const pair=pickBalancedMatch(eligible,()=>0);
 assert.ok(pair);
 assert.equal(pair.home.rating,3.5);
 assert.equal(pair.away.rating,3.5);
 assert.equal(clubsForMinimumRating(fixture,'l',3.25).length,0);
 assert.doesNotThrow(()=>parseClubCatalog({...fixture,leagues:[{id:'l',name:'L',country:'X',clubCount:4}]}));
 assert.throws(()=>parseClubCatalog({...fixture,leagues:[{id:'l',name:'L',country:'X',clubCount:4}],clubs:[{...clubs[0],rating:3.25}]}));
});

test('one-star difference is allowed, larger differences are excluded',()=>{
 const a={...clubs[0],rating:3};
 const b={...clubs[1],rating:4};
 const c={...clubs[2],rating:5};
 const valid=pickBalancedMatch([a,b],()=>0);
 assert.ok(valid);
 assert.equal(valid.starDifference,1);
 assert.equal(pickBalancedMatch([a,c],()=>0),null);
});
test('half-star gap and full one-star gap are both eligible',()=>{
 const a={...clubs[0],rating:3.5};
 const half={...clubs[1],rating:4};
 const full={...clubs[2],rating:4.5};
 assert.equal(pickBalancedMatch([a,half],()=>0)?.starDifference,0.5);
 assert.equal(pickBalancedMatch([a,full],()=>0)?.starDifference,1);
});

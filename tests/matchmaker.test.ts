import test from 'node:test';
import assert from 'node:assert/strict';
import {clubsForDraw,clubsForMinimumRating,pickBalancedMatch,parseClubCatalog} from '../src/domain/matchmaker';
import type {Club} from '../src/domain/matchmaker';
const clubs:Club[]=[
{id:'a',name:'A',leagueId:'l',country:'X',rating:4,elo:1800,logoUrl:null},
{id:'b',name:'B',leagueId:'l',country:'X',rating:4,elo:1795,logoUrl:null},
{id:'c',name:'C',leagueId:'l',country:'X',rating:3,elo:1600,logoUrl:null}
];
test('selection always yields distinct clubs of equal star level',()=>{
 for(const random of [()=>0,()=>0.3,()=>0.99]){const match=pickBalancedMatch(clubs,random);assert.ok(match);assert.notEqual(match.home.id,match.away.id);assert.equal(match.home.rating,match.away.rating);}
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

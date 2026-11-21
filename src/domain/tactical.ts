import type {Match} from './schema';

export type RadarAxisId='ataque'|'defensa'|'posesion'|'precision'|'creacion'|'efectividad';
export interface ArchetypeDefinition {id:string;name:string;description:string;radar:Record<RadarAxisId,number>}
export interface TacticalCatalog {
 schemaVersion:number;
 methodology:{origin:string;scale:string;sampleMinimumForStableArchetype:number;requiredDimensions:number;notes:string};
 dimensions:{id:RadarAxisId;label:string;source:string;method:string}[];
 archetypes:ArchetypeDefinition[];
 styles:{id:string;name:string;description:string}[];
}
export interface TacticalProfile {
 values:Record<RadarAxisId,number|null>;
 detailedMatches:number;
 totalMatches:number;
 completeAxes:number;
 archetype:ArchetypeDefinition|null;
 similarity:number|null;
 candidates:{archetype:ArchetypeDefinition;similarity:number}[];
 reason:'insufficient-data'|'ambiguous'|'low-similarity'|null;
 status:'none'|'provisional'|'stable';
}
export const axisIds:RadarAxisId[]=['ataque','defensa','posesion','precision','creacion','efectividad'];
const clamp=(n:number)=>Math.max(0,Math.min(100,n));
function metric(stats:Record<string,unknown>,key:string):number|null{
 const x=stats[key];return typeof x==='number'&&Number.isFinite(x)?x:null;
}
function share(ours:number|null,theirs:number|null):number|null{
 if(ours===null||theirs===null||ours+theirs<=0)return null;
 return clamp(100*ours/(ours+theirs));
}
function average(...values:(number|null)[]):number|null{
 const valid=values.filter((v):v is number=>v!==null);
 return valid.length?valid.reduce((a,b)=>a+b,0)/valid.length:null;
}
function weighted(values:[number|null,number][]):number|null{
 const valid=values.filter((v):v is [number,number]=>v[0]!==null);
 const total=valid.reduce((sum,[,w])=>sum+w,0);
 return total?valid.reduce((sum,[v,w])=>sum+v*w,0)/total:null;
}
/** All per-game axes use actual game stats. Missing fields never become fabricated zeros. */
function observed(m:Match,playerId:string):Record<RadarAxisId,number|null>{
 const home=m.home.playerId===playerId;
 const ours=home?m.home:m.away,opponent=home?m.away:m.home;
 const mine=(home?m.stats?.home:m.stats?.away) as Record<string,unknown>|undefined;
 const theirs=(home?m.stats?.away:m.stats?.home) as Record<string,unknown>|undefined;
 const read=(key:string)=>mine?metric(mine,key):null;
 const other=(key:string)=>theirs?metric(theirs,key):null;
 const shotShare=share(read('shots'),other('shots'));
 const xgShare=share(read('expectedGoals'),other('expectedGoals'));
 const conversion=read('shots')!==null&&read('shots')!>0?clamp(100*(ours.goals/read('shots')!)/0.3):null;
 const saves=read('successfulTackles');
 const defending=weighted([
  [shotShare===null?null:100-shotShare,0.45],
  [share(saves,other('successfulTackles')),0.25],
  [share(read('recoveries'),other('recoveries')),0.30]
 ]);
 return {
  ataque:weighted([[shotShare,0.55],[xgShare,0.45]]),
  defensa:defending,
  posesion:read('possession'),
  precision:weighted([[read('passAccuracy'),0.7],[read('shotAccuracy'),0.3]]),
  creacion:weighted([[xgShare,0.65],[share(read('lineBreakAttempts'),other('lineBreakAttempts')),0.35]]),
  efectividad:weighted([[conversion,0.65],[read('shotAccuracy'),0.35]])
 };
}
export function profileFor(matches:Match[],playerId:string,definitions:TacticalCatalog):TacticalProfile{
 const played=matches.filter(m=>m.home.playerId===playerId||m.away.playerId===playerId);
 const samples:Record<RadarAxisId,number[]>={ataque:[],defensa:[],posesion:[],precision:[],creacion:[],efectividad:[]};
 let detailedMatches=0;
 for(const m of played){
  if(m.stats)detailedMatches++;
  const values=observed(m,playerId);
  for(const axis of axisIds)if(values[axis]!==null)samples[axis].push(values[axis]!);
 }
 const values={} as Record<RadarAxisId,number|null>;
 for(const axis of axisIds)values[axis]=samples[axis].length?
  Math.round(samples[axis].reduce((a,b)=>a+b,0)/samples[axis].length*10)/10:null;
 // Score-only games cannot establish possession, creation or precision.
 // They still provide a small, explicitly provisional signal for attack/defence.
 if(played.length&&detailedMatches===0){
  const goalsFor=played.reduce((s,m)=>s+(m.home.playerId===playerId?m.home.goals:m.away.goals),0)/played.length;
  const goalsAgainst=played.reduce((s,m)=>s+(m.home.playerId===playerId?m.away.goals:m.home.goals),0)/played.length;
  values.ataque=clamp(Math.round(50+12*(goalsFor-1.5)));
  values.defensa=clamp(Math.round(50+12*(1.5-goalsAgainst)));
 }
 const common=axisIds.filter(id=>values[id]!==null);
 const completeAxes=common.length;
 const ordered=completeAxes&&definitions.archetypes.length?definitions.archetypes.map(a=>{
  const distance=common.reduce((sum,id)=>sum+(values[id]!-a.radar[id])**2,0)/common.length;
  return {a,distance};
 }).sort((a,b)=>a.distance-b.distance):[];
 const best=ordered[0],runnerUp=ordered[1];
 const similarity=best?Math.round(clamp(100-Math.sqrt(best.distance))):null;
 const separation=best&&runnerUp?Math.sqrt(runnerUp.distance)-Math.sqrt(best.distance):Infinity;
 const sufficientSample=detailedMatches>=definitions.methodology.sampleMinimumForStableArchetype;
 const stable=completeAxes>=definitions.methodology.requiredDimensions&&sufficientSample&&similarity!==null&&similarity>=80&&separation>=4;
 const reason:TacticalProfile['reason']=!best? 'insufficient-data':stable?null:!sufficientSample||completeAxes<definitions.methodology.requiredDimensions?'insufficient-data':similarity!<80?'low-similarity':'ambiguous';
 return {
  values,totalMatches:played.length,detailedMatches,completeAxes,
  archetype:best?.a??null,similarity,
  candidates:ordered.slice(0,2).map(({a,distance})=>({archetype:a,similarity:Math.round(clamp(100-Math.sqrt(distance)))})),
  reason,status:!best?'none':stable?'stable':'provisional'
 };
}

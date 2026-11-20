import type {Match} from './schema';

export type RadarAxisId='posesion'|'pases'|'finalizacion'|'entradas'|'recuperaciones'|'progresion';
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
const axisIds:RadarAxisId[]=['posesion','pases','finalizacion','entradas','recuperaciones','progresion'];
const clamp=(n:number)=>Math.max(0,Math.min(100,n));
function metric(stats:Record<string,unknown>,key:string):number|null{
 const x=stats[key];return typeof x==='number'&&Number.isFinite(x)?x:null;
}
/** Relative event share is explicitly not a pressing/territorial metric. */
function share(ours:number|null,theirs:number|null){
 if(ours===null||theirs===null||ours+theirs<=0)return null;
 return clamp(100*ours/(ours+theirs));
}
export function profileFor(matches:Match[],playerId:string,definitions:TacticalCatalog):TacticalProfile{
 const samples:Record<RadarAxisId,number[]>={posesion:[],pases:[],finalizacion:[],entradas:[],recuperaciones:[],progresion:[]};
 const played=matches.filter(m=>m.home.playerId===playerId||m.away.playerId===playerId);
 let detailedMatches=0;
 for(const m of played){
  if(!m.stats)continue;
  detailedMatches++;
  const our=m.home.playerId===playerId?m.stats.home:m.stats.away;
  const their=m.home.playerId===playerId?m.stats.away:m.stats.home;
  const mine=our as Record<string,unknown>;
  const theirs=their as Record<string,unknown>;
  const measures:Record<RadarAxisId,number|null>={
   posesion:metric(mine,'possession'),pases:metric(mine,'passAccuracy'),
   finalizacion:metric(mine,'shotAccuracy'),
   entradas:share(metric(mine,'tackles'),metric(theirs,'tackles')),
   recuperaciones:share(metric(mine,'recoveries'),metric(theirs,'recoveries')),
   progresion:share(metric(mine,'lineBreakAttempts'),metric(theirs,'lineBreakAttempts'))
  };
  for(const axis of axisIds)if(measures[axis]!==null)samples[axis].push(measures[axis]);
 }
 const values={} as Record<RadarAxisId,number|null>;
 for(const axis of axisIds)values[axis]=samples[axis].length?Math.round(samples[axis].reduce((a,b)=>a+b,0)/samples[axis].length*10)/10:null;
 const completeAxes=axisIds.filter(a=>values[a]!==null).length;
 const enough=completeAxes>=definitions.methodology.requiredDimensions;
 const ordered= enough?definitions.archetypes.map(a=>{
  const common=axisIds.filter(id=>values[id]!==null);
  const distance=common.reduce((sum,id)=>sum+(values[id]!-a.radar[id])**2,0)/common.length;
  return {a,distance};
 }).sort((a,b)=>a.distance-b.distance):[];
 const best=ordered[0];
 const runnerUp=ordered[1];
 const similarity=best?Math.round(clamp(100-Math.sqrt(best.distance))):null;
 const separation=best&&runnerUp?Math.sqrt(runnerUp.distance)-Math.sqrt(best.distance):Infinity;
 // A nearest-neighbour result is not a reliable tactical identity by itself.
 // Four detailed games cannot establish adaptability, pressing height or defensive block.
 const sufficientSample=detailedMatches>=definitions.methodology.sampleMinimumForStableArchetype;
 const clearFit=similarity!==null&&similarity>=80;
 const distinctFit=separation>=4;
 const classificationReady=enough&&sufficientSample&&clearFit&&distinctFit;
 const reason: TacticalProfile['reason']=!enough||!sufficientSample?'insufficient-data':!clearFit?'low-similarity':!distinctFit?'ambiguous':null;
 return {
  values,totalMatches:played.length,detailedMatches,completeAxes,
  archetype:classificationReady?best.a:null,
  similarity:classificationReady?similarity:null,
  candidates:ordered.slice(0,2).map(({a,distance})=>({archetype:a,similarity:Math.round(clamp(100-Math.sqrt(distance)))})),
  reason,
  status:!enough?'none':classificationReady?'stable':'provisional'
 };
}

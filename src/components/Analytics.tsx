import { useMemo, useState } from 'react';
import { Activity, BarChart3, CheckCircle2, Info, Target } from 'lucide-react';
import type { Database, Match } from '../domain/schema';
import type { ClubCatalog } from '../domain/matchmaker';
import {getClub} from '../hooks/useClubCatalog';
import {TeamBadge} from './TeamBadge';

type StatKey = NonNullable<Match['stats']>['home'];
type Metric = { key: keyof StatKey; label: string; unit?: string; kind?: 'rate' | 'average' };
const metrics: Metric[] = [
  { key:'possession', label:'Posesión', unit:'%', kind:'rate' },
  { key:'shots', label:'Tiros' },
  { key:'expectedGoals', label:'Goles esperados (xG)', kind:'average' },
  { key:'passes', label:'Pases' },
  { key:'tackles', label:'Entradas' },
  { key:'successfulTackles', label:'Entradas exitosas' },
  { key:'recoveries', label:'Recuperaciones' },
  { key:'saves', label:'Atajadas' },
  { key:'fouls', label:'Faltas' },
  { key:'offsides', label:'Fueras de juego' },
  { key:'corners', label:'Tiros de esquina' },
  { key:'freeKicks', label:'Tiros libres' },
  { key:'penalties', label:'Penales' },
  { key:'yellowCards', label:'Tarjetas amarillas' },
  { key:'redCards', label:'Tarjetas rojas' },
  { key:'dribbleSuccessRate', label:'Éxito en regates', unit:'%', kind:'rate' },
  { key:'shotAccuracy', label:'Precisión en tiros', unit:'%', kind:'rate' },
  { key:'passAccuracy', label:'Precisión de pases', unit:'%', kind:'rate' },
  { key:'lineBreaksMiddle', label:'Rupturas por el centro' },
  { key:'lineBreaksWide', label:'Rupturas por bandas' },
  { key:'lineBreaksOver', label:'Rupturas por arriba' },
  { key:'lineBreakAttempts', label:'Intentos de ruptura' },
];
const groups = [
  { label:'Dominio y ataque', keys:['possession','shots','expectedGoals','passes','corners'] },
  { label:'Defensa y disciplina', keys:['tackles','successfulTackles','recoveries','saves','fouls','offsides','freeKicks','penalties','yellowCards','redCards'] },
  { label:'Eficacia y progresión', keys:['dribbleSuccessRate','shotAccuracy','passAccuracy','lineBreaksMiddle','lineBreaksWide','lineBreaksOver','lineBreakAttempts'] },
];
type Summary = Record<string,{ value:number; count:number }>;
function getValue(s:Summary,key:keyof StatKey,aggregate:boolean,kind?:Metric['kind']):number|null{
  const entry=s[key]; if(!entry?.count)return null;
  return aggregate && kind==='rate' ? entry.value/entry.count : entry.value;
}
function summarize(matches:Match[],playerId:string):Summary{
  const data:Summary={};
  for(const m of matches){
    const stats=m.home.playerId===playerId?m.stats?.home:m.away.playerId===playerId?m.stats?.away:null;
    if(!stats)continue;
    for(const metric of metrics){
      const v=stats[metric.key];
      if(typeof v!=='number')continue;
      const r=data[metric.key]??{value:0,count:0};
      r.value+=v;r.count++;data[metric.key]=r;
    }
  }
  return data;
}
function format(v:number|null,metric:Metric){
  if(v===null)return '—';
  const dec=metric.key==='expectedGoals'?1:(metric.kind==='rate'&&!Number.isInteger(v)?1:0);
  return v.toLocaleString('es-MX',{minimumFractionDigits:dec,maximumFractionDigits:dec})+(metric.unit??'');
}
function Radial({value,label,color}:{value:number|null;label:string;color:string}){
  const valid=value!==null;const progress=valid?Math.min(100,Math.max(0,value)):0;
  return <div className="analytics-ring"><div className="analytics-ring-circle" style={{background:`conic-gradient(${color} ${progress}%,#263453 ${progress}% 100%)`}}><div><strong>{valid?`${Math.round(value)}%`:'—'}</strong></div></div><span>{label}</span></div>;
}
export function Analytics({data,matches,catalog}:{data:Database;matches:Match[];catalog:ClubCatalog|null}){
  const [selected,setSelected]=useState('all');
  const [category,setCategory]=useState('all');
  const withStats=useMemo(()=>matches.filter(m=>m.stats!==null),[matches]);
  const active=selected==='all'?null:withStats.find(m=>m.id===selected)??null;
  const scope=active?[active]:matches;
  const players=data.players;
  const sides=players.map(p=>({player:p,stats:summarize(scope,p.id)}));
  const aggregate=!active;
  const visibleGroups=groups.filter(g=>category==='all'||g.label===category);
  const available=withStats.length;
  const countStats=scope.filter(m=>m.stats!==null).length;
  const coverage=`${countStats} de ${scope.length} partidos con estadísticas detalladas`;
  const get=(side:number,key:keyof StatKey)=>getValue(sides[side].stats,key,aggregate,metrics.find(x=>x.key===key)?.kind);
  function teamMarks(playerId:string){
    const used=scope.flatMap(m=>{
      const side=m.home.playerId===playerId?m.home:m.away.playerId===playerId?m.away:null;
      return side?[side]:[];
    }).filter((side,index,array)=>array.findIndex(c=>c.clubId===side.clubId)===index);
    return <div className="analytics-team-logos" aria-label="Equipos utilizados">{used.map(side=><TeamBadge key={side.clubId??side.team} compact club={getClub(catalog,side.clubId)} name={side.team}/>)}</div>;
  }
  const headerCards = [
    { key:'shots',title:'Tiros totales' },{key:'expectedGoals',title:'xG acumulados'},
    {key:'passes',title:'Pases registrados' },{key:'corners',title:'Tiros de esquina'}
  ] as const;
  return <section className="analytics-section" id="estadisticas" aria-labelledby="analytics-title">
    <div className="analytics-heading"><div><span className="eyebrow"><Activity size={13}/> INTELIGENCIA DE PARTIDO</span><h2 id="analytics-title">El juego en números<span>.</span></h2><p>Visualiza cómo juega cada DT. Explora el encuentro o compara los datos acumulados de la rivalidad.</p></div><span className="analytics-index"><BarChart3 size={20}/> MATCH INTELLIGENCE</span></div>
    <div className="analytics-panel">
      <div className="analytics-toolbar"><div className="analytics-toggle"><button className={selected==='all'?'active':''} onClick={()=>setSelected('all')}>Acumulado</button><button className={selected!=='all'?'active':''} onClick={()=>setSelected(withStats[0]?.id??'all')} disabled={!available}>Por partido</button></div><label>Encuentro<select aria-label="Seleccionar encuentro estadístico" value={selected} onChange={e=>setSelected(e.target.value)}><option value="all">Todos los partidos</option>{withStats.map(m=><option key={m.id} value={m.id}>{m.date} · {m.home.team} {m.home.goals}–{m.away.goals} {m.away.team}</option>)}</select></label></div>
      <div className="analytics-coverage"><Info size={15}/><span>{coverage}. {aggregate?'Las sumas solo incluyen encuentros con datos disponibles; los porcentajes son medias de los partidos registrados.':'Datos del partido seleccionado.'}</span></div>
      <div className="analytics-versus"><div className="analytics-contender"><span>DIRECTOR TÉCNICO</span><h3>{sides[0].player.name}</h3><small>{active?(active.home.playerId===sides[0].player.id?active.home.team:active.away.team):'Rendimiento acumulado'}</small>{teamMarks(sides[0].player.id)}</div><div className="analytics-versus-symbol"><span>VS</span><small>{aggregate?'GENERAL':'PARTIDO'}</small></div><div className="analytics-contender right"><span>DIRECTOR TÉCNICO</span><h3>{sides[1].player.name}</h3><small>{active?(active.home.playerId===sides[1].player.id?active.home.team:active.away.team):'Rendimiento acumulado'}</small>{teamMarks(sides[1].player.id)}</div></div>
      <div className="analytics-feature-grid">{headerCards.map(card=><div className="analytics-feature" key={card.key}><span>{card.title}</span><div><b>{format(get(0,card.key),metrics.find(x=>x.key===card.key)!)}</b><span>:</span><b>{format(get(1,card.key),metrics.find(x=>x.key===card.key)!)}</b></div><div className="analytics-mini-track"><i style={{width:`${((get(0,card.key)??0)/Math.max(1,(get(0,card.key)??0)+(get(1,card.key)??0)))*100}%`}}/></div></div>)}</div>
      <div className="analytics-efficiency">{(['possession','shotAccuracy','passAccuracy','dribbleSuccessRate'] as const).map(key=><div className="analytics-efficiency-card" key={key}><span>{metrics.find(m=>m.key===key)?.label}</span><div className="analytics-rings"><Radial value={get(0,key)} label={sides[0].player.initials} color="#65e6fc"/><Radial value={get(1,key)} label={sides[1].player.initials} color="#b398ff"/></div></div>)}</div>
      <div className="analytics-breakdown-head"><div><span className="eyebrow">COMPARATIVA AVANZADA</span><h3>Métrica a métrica</h3></div><div className="analytics-categories">{['all',...groups.map(g=>g.label)].map(c=><button key={c} className={category===c?'active':''} onClick={()=>setCategory(c)}>{c==='all'?'Todas':c}</button>)}</div></div>
      {visibleGroups.map(group=><div className="analytics-group" key={group.label}><h4>{group.label}</h4><div className="analytics-bars">{group.keys.map(key=>{const metric=metrics.find(m=>m.key===key)!;const left=get(0,metric.key),right=get(1,metric.key);const max=Math.max(1,left??0,right??0);return <div className="analytics-bar-row" key={key}><span className="analytics-number">{format(left,metric)}</span><div className="analytics-bar-side left"><i style={{width:`${left===null?0:left/max*100}%`}}/></div><span className="analytics-bar-label">{metric.label}</span><div className="analytics-bar-side right"><i style={{width:`${right===null?0:right/max*100}%`}}/></div><span className="analytics-number">{format(right,metric)}</span></div>})}</div></div>)}
      {!available&&<div className="analytics-no-data"><Target size={24}/><p>Los gráficos se completarán con las próximas capturas de estadísticas.</p></div>}
      <div className="analytics-footnote"><CheckCircle2 size={14}/><span>Los valores ausentes se indican con «—»; nunca se convierten en cero. La captura indica «Pases» sin aclarar si son completados. Las medias porcentuales no están ponderadas por intentos.</span></div>
    </div>
  </section>;
}

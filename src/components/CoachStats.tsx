import { X, Trophy, Shield, Swords, Target } from 'lucide-react';
import type { Match, Player } from '../domain/schema';
import type { ClubCatalog } from '../domain/matchmaker';
import { getClub } from '../hooks/useClubCatalog';
import { winner } from '../domain/statistics';
import { GoalTimeline, RateRing, statGroups, summaryFor, formatMetric, rateKeys } from './StatVisuals';
export function CoachStats({player,matches,catalog,onClose}:{player:Player;matches:Match[];catalog:ClubCatalog|null;onClose:()=>void}){
 const played=matches.filter(m=>m.home.playerId===player.id||m.away.playerId===player.id);
 const won=played.filter(m=>winner(m)===player.id).length;
 const lost=played.filter(m=>winner(m)!==null&&winner(m)!==player.id).length;
 const drawn=played.length-won-lost;
 const scored=played.reduce((n,m)=>n+(m.home.playerId===player.id?m.home.goals:m.away.goals),0);
 const against=played.reduce((n,m)=>n+(m.home.playerId===player.id?m.away.goals:m.home.goals),0);
 const s=summaryFor(played,player.id);
 // Use the actual team controlled by this coach, not the opponent's rating.
 const tiers=new Map<number,{wins:number;losses:number;draws:number}>();
 for(const m of played){
  const side=m.home.playerId===player.id?m.home:m.away;
  const club=getClub(catalog,side.clubId);
  if(!club)continue;
  const tier=tiers.get(club.rating)??{wins:0,losses:0,draws:0};
  if(winner(m)===player.id)tier.wins++;
  else if(winner(m)===null)tier.draws++;
  else tier.losses++;
  tiers.set(club.rating,tier);
 }
 const sortedTiers=[...tiers.entries()].sort((a,b)=>a[0]-b[0]);
 const classified=sortedTiers.reduce((n,[,r])=>n+r.wins+r.losses+r.draws,0);
 return <div id="coach-stats-panel" className="coach-stats-dialog inline-stats-panel" role="region" aria-labelledby="coach-stat-title">
  <div className="dialog-head"><span className="eyebrow">PERFIL DE RENDIMIENTO · DATOS INDIVIDUALES</span><button onClick={onClose} aria-label="Cerrar estadísticas del DT"><X/></button></div>
  <div className="coach-stats-hero"><span className="coach-stats-avatar">{player.initials}</span><div><span className="eyebrow">TEMPORADA EN NÚMEROS</span><h2 id="coach-stat-title">{player.name}</h2><p>Únicamente los resultados y las estadísticas de este director técnico</p></div></div>
  <div className="coach-stats-kpis">{[{icon:Trophy,label:'Victorias',value:won},{icon:Shield,label:'Derrotas',value:lost},{icon:Target,label:'Goles anotados',value:scored},{icon:Swords,label:'Goles recibidos',value:against},{icon:Trophy,label:'Empates',value:drawn},{icon:Target,label:'Partidos jugados',value:played.length}].map(({icon:Icon,label,value})=><div key={label}><Icon size={18}/><span>{label}</span><strong>{value}</strong></div>)}</div>
  <section className="coach-trend-section"><div className="coach-panel-head"><span className="eyebrow">EVOLUCIÓN INDIVIDUAL</span><h3>Historia de los últimos 20 partidos</h3></div><GoalTimeline player={player} matches={played}/></section>
  <section className="coach-advanced-section"><div className="coach-panel-head"><span className="eyebrow">RENDIMIENTO POR CALIDAD DEL EQUIPO</span><h3>Efectividad según estrellas</h3><p>Los niveles son estimaciones del catálogo; se agrupan según el equipo que dirigió {player.name}, no el rival. {catalog?`${classified} de ${played.length} partidos clasificados.`:'Cargando clasificación de equipos…'}</p></div>
  {sortedTiers.length?<div className="coach-star-chart"><div className="coach-star-legend"><span className="is-win">Ganados</span><span className="is-draw">Empatados</span><span className="is-loss">Perdidos</span></div>{sortedTiers.map(([rating,r])=>{const total=r.wins+r.losses+r.draws;return <div key={rating} className="coach-star-row"><div className="coach-star-label"><strong>{rating} ★</strong><small>{total} {total===1?'partido':'partidos'} · {Math.round(r.wins/total*100)}% efectividad</small></div><div className="coach-star-track" role="img" aria-label={`${rating} estrellas: ${r.wins} ganados, ${r.draws} empates y ${r.losses} perdidos`}><span className="is-win" style={{flex:r.wins}}/><span className="is-draw" style={{flex:r.draws}}/><span className="is-loss" style={{flex:r.losses}}/></div><div className="coach-star-results"><b>{r.wins} G</b><b>{r.draws} E</b><b>{r.losses} P</b></div></div>})}</div>:<div className="stat-empty"><p>{catalog?'Los equipos de sus partidos aún no tienen una calificación vinculada en el catálogo.':'Cargando niveles de estrellas del catálogo…'}</p></div>}
  </section>
  <section className="coach-advanced-section"><div className="coach-panel-head"><span className="eyebrow">ESTADÍSTICAS PERSONALES ACUMULADAS</span><h3>Radiografía individual</h3><p>Datos registrados en {s.coverage} de {played.length} partidos. Los conteos y xG se suman; los porcentajes son medias simples. No se incluyen cifras de otros DT.</p></div>
   {s.coverage?<><div className="coach-personal-rings">{(['possession','shotAccuracy','passAccuracy','dribbleSuccessRate'] as const).map(key=><RateRing key={key} label={({possession:'Posesión',shotAccuracy:'Precisión en tiros',passAccuracy:'Precisión de pases',dribbleSuccessRate:'Éxito en regates'} as Record<string,string>)[key]??key} value={s.values[key]??null} color="#65e6fc"/>)}</div><div className="coach-personal-grid">{statGroups.map(group=><section className="coach-personal-group" key={group.title}><h4>{group.title}</h4>{group.items.filter(([key])=>!rateKeys.has(key)).map(([key,label])=><div key={key}><span>{label}</span><strong>{formatMetric(s.values[key]??null)}</strong></div>)}</section>)}</div></>:<div className="stat-empty"><p>Todavía no hay capturas con estadísticas detalladas de este DT. Los marcadores y la evolución histórica sí están disponibles.</p></div>}
  </section>
 </div>;
}

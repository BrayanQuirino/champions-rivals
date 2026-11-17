import { X, Trophy, Shield, Swords, Target } from 'lucide-react';
import type { Match, Player } from '../domain/schema';
import { winner } from '../domain/statistics';
import { GoalTimeline, StatComparison, summaryFor } from './StatVisuals';
export function CoachStats({player,matches,onClose}:{player:Player;matches:Match[];onClose:()=>void}){
 const played=matches.filter(m=>m.home.playerId===player.id||m.away.playerId===player.id);
 const won=played.filter(m=>winner(m)===player.id).length;
 const lost=played.filter(m=>winner(m)!==null&&winner(m)!==player.id).length;
 const drawn=played.length-won-lost;
 const scored=played.reduce((n,m)=>n+(m.home.playerId===player.id?m.home.goals:m.away.goals),0);
 const against=played.reduce((n,m)=>n+(m.home.playerId===player.id?m.away.goals:m.home.goals),0);
 const s=summaryFor(played,player.id);
 const otherNames=matches.flatMap(m=>[m.home.playerId,m.away.playerId]).filter(id=>id!==player.id);
 const opponentId=otherNames[0]??'';
 const opponentStats=summaryFor(played,opponentId);
 const otherName=opponentId==='brayan'?'Brayan':opponentId==='hermano'?'Joni':'Rival';
 return <div id="coach-stats-panel" className="coach-stats-dialog inline-stats-panel" role="region" aria-labelledby="coach-stat-title">
  <div className="dialog-head"><span className="eyebrow">PERFIL DE RENDIMIENTO · DIRECTOR TÉCNICO</span><button autoFocus onClick={onClose} aria-label="Cerrar estadísticas del DT"><X/></button></div>
  <div className="coach-stats-hero"><span className="coach-stats-avatar">{player.initials}</span><div><span className="eyebrow">TEMPORADA EN NÚMEROS</span><h2 id="coach-stat-title">{player.name}</h2><p>Análisis histórico y rendimiento acumulado</p></div></div>
  <div className="coach-stats-kpis">{[{icon:Trophy,label:'Victorias',value:won},{icon:Shield,label:'Derrotas',value:lost},{icon:Target,label:'Goles anotados',value:scored},{icon:Swords,label:'Goles recibidos',value:against},{icon:Trophy,label:'Empates',value:drawn},{icon:Target,label:'Partidos jugados',value:played.length}].map(({icon:Icon,label,value})=><div key={label}><Icon size={18}/><span>{label}</span><strong>{value}</strong></div>)}</div>
  <section className="coach-trend-section"><div className="coach-panel-head"><span className="eyebrow">EVOLUCIÓN DEL RENDIMIENTO</span><h3>Historia de los últimos 20 partidos</h3></div><GoalTimeline player={player} matches={played}/></section>
  <section className="coach-advanced-section"><div className="coach-panel-head"><span className="eyebrow">DATOS ACUMULADOS</span><h3>Radiografía del DT</h3><p>Comparativa contra {otherName}. Cobertura: {s.coverage} de {played.length} partidos con estadísticas detalladas. Los porcentajes muestran promedios simples; las demás cifras son sumas.</p></div>
   {s.coverage?<StatComparison left={s.values} right={opponentStats.values} leftName={player.name} rightName={otherName}/>:<div className="stat-empty"><p>Todavía no hay capturas con estadísticas de este DT. Los marcadores y la gráfica histórica sí están disponibles.</p></div>}
  </section>
 </div>;
}

import { X } from 'lucide-react';
import type { Database, Match } from '../domain/schema';
import { dateLabel } from './MatchCard';
import { metricValue, StatComparison, statGroups } from './StatVisuals';
export function MatchDetails({match:m,onClose,venues}:{match:Match;onClose:()=>void;venues?:Database['venues']}){
 const left:Record<string,number|null>={},right:Record<string,number|null>={};
 for(const group of statGroups)for(const [key] of group.items){left[key]=metricValue(m.stats?.home,key);right[key]=metricValue(m.stats?.away,key);}
 return <div className="match-stat-dialog inline-stats-panel" role="region" aria-labelledby="detail-title">
   <div className="dialog-head"><span className="eyebrow">MATCH INTELLIGENCE · FICHA DEL PARTIDO</span><button autoFocus onClick={onClose} aria-label="Cerrar detalle"><X/></button></div>
   <div className="stat-match-score"><div><small>LOCAL</small><h2 id="detail-title">{m.home.team}</h2></div><strong>{m.home.goals}<span>:</span>{m.away.goals}</strong><div><small>VISITANTE</small><h2>{m.away.team}</h2></div></div>
   <p className="stat-meta">{dateLabel(m.date)} · {m.season}{m.venueId?' · '+(venues?.find(v=>v.id===m.venueId)?.name ?? m.venueId):''}</p>
   {m.penalties&&<p className="stat-meta">Penales: {m.penalties.home}–{m.penalties.away}</p>}
   {m.stats?<StatComparison left={left} right={right} leftName={m.home.team} rightName={m.away.team}/>:<div className="stat-empty"><h3>Estadísticas pendientes</h3><p>Este encuentro solo tiene marcador registrado. Cuando compartas capturas, aquí aparecerán los gráficos y las métricas sin alterar el resultado.</p></div>}
   <p className="stat-source">{m.source.type==='photo'?'Fuente: fotografías del partido.':'Fuente: marcador registrado manualmente.'} {m.source.notes}</p>
 </div>;
}

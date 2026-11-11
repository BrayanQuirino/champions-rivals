import type { Database, Match } from '../domain/schema';
export const dateLabel=(date:string)=>new Intl.DateTimeFormat('es-MX',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'}).format(new Date(`${date}T12:00:00Z`));
export function MatchCard({match:m,players,onSelect}:{match:Match;players:Database['players'];onSelect:(m:Match)=>void}) {
 const name=(id:string)=>players.find(p=>p.id===id)?.name ?? id;
 return <button className="match-row" onClick={()=>onSelect(m)} aria-label={`Ver partido ${name(m.home.playerId)} ${m.home.goals} a ${m.away.goals} ${name(m.away.playerId)}`}>
 <span className="match-date">{dateLabel(m.date)}<small>{m.season}</small></span><span className="team home-team"><b>{m.home.team}</b><small>{name(m.home.playerId)}</small></span><span className="score-small">{m.home.goals}<i>:</i>{m.away.goals}{m.penalties&&<small>Pen. {m.penalties.home}–{m.penalties.away}</small>}</span><span className="team"><b>{m.away.team}</b><small>{name(m.away.playerId)}</small></span><span className="row-arrow" aria-hidden="true">↗</span></button>
}

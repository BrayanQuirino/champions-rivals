import { MapPin } from 'lucide-react';
import type { Database, Match } from '../domain/schema';
import type {ClubCatalog} from '../domain/matchmaker';
import {getClub} from '../hooks/useClubCatalog';
import {TeamBadge} from './TeamBadge';
export const dateLabel=(date:string)=>new Intl.DateTimeFormat('es-MX',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'}).format(new Date(`${date}T12:00:00Z`));
export function MatchCard({match:m,players,onSelect,venues,catalog}:{match:Match;players:Database['players'];onSelect:(m:Match)=>void;venues?:Database['venues'];catalog:ClubCatalog|null}) {
 const name=(id:string)=>players.find(p=>p.id===id)?.name ?? id;
 const initials=(id:string)=>players.find(p=>p.id===id)?.initials ?? 'DT';
 return <button className="match-row" onClick={()=>onSelect(m)} aria-label={`Ver partido ${name(m.home.playerId)} ${m.home.goals} a ${m.away.goals} ${name(m.away.playerId)}`}>
 <span className="match-date">{dateLabel(m.date)}<small>{m.season}</small>{m.venueId&&<small className="match-venue"><MapPin size={11}/>{venues?.find(v=>v.id===m.venueId)?.name ?? m.venueId}</small>}</span><span className="match-team-with-badge home-team"><span className="team"><b>{m.home.team}</b><small>{name(m.home.playerId)}</small></span><TeamBadge compact club={getClub(catalog,m.home.clubId)} name={m.home.team} logoUrl={m.home.logoUrl} initials={initials(m.home.playerId)}/></span><span className="score-small">{m.home.goals}<i>:</i>{m.away.goals}{m.penalties&&<small>Pen. {m.penalties.home}–{m.penalties.away}</small>}</span><span className="match-team-with-badge away-team"><TeamBadge compact club={getClub(catalog,m.away.clubId)} name={m.away.team} logoUrl={m.away.logoUrl} initials={initials(m.away.playerId)}/><span className="team"><b>{m.away.team}</b><small>{name(m.away.playerId)}</small></span></span><span className="row-arrow" aria-hidden="true">↗</span></button>
}

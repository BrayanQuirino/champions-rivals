import { useEffect,useRef } from 'react';
import { X } from 'lucide-react';
import type { Match } from '../domain/schema';
import { dateLabel } from './MatchCard';
export function MatchDetails({match:m,onClose}:{match:Match;onClose:()=>void}){
 const ref=useRef<HTMLDialogElement>(null);
 useEffect(()=>{const d=ref.current;d?.showModal();return()=>d?.close();},[]);
 return <dialog ref={ref} onCancel={onClose} onClick={e=>{if(e.target===e.currentTarget)onClose()}} aria-labelledby="detail-title"><div className="dialog-head"><span className="eyebrow">FICHA DEL PARTIDO</span><button autoFocus onClick={onClose} aria-label="Cerrar detalle"><X/></button></div><h2 id="detail-title">{m.home.team} {m.home.goals}–{m.away.goals} {m.away.team}</h2><p>{dateLabel(m.date)} · {m.season}</p>{m.extraTime&&<p>Incluye tiempo extra</p>}{m.penalties&&<p>Penales: {m.penalties.home}–{m.penalties.away}</p>}<div className="detail-stats">{(['possession','shots','shotsOnTarget'] as const).map((key,i)=><div key={key}><b>{m.stats?.home[key]??'—'}</b><span>{['Posesión (%)','Tiros','Tiros a puerta'][i]}</span><b>{m.stats?.away[key]??'—'}</b></div>)}</div><p className="muted">{m.source.type==='demo'?'Partido ficticio de demostración.':m.source.type==='photo'?'Registrado desde una fotografía.':'Registrado manualmente.'} {m.source.notes}</p></dialog>
}

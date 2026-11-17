import {useEffect,useState} from 'react';
import {Shield} from 'lucide-react';
import type {Club} from '../domain/matchmaker';

/** Escudo del equipo. Si no hay imagen, representa al DT mediante sus iniciales. */
export function TeamBadge({club,name,compact=false,initials}:{club:Club|null;name:string;compact?:boolean;initials?:string}){
 const [index,setIndex]=useState(0);
 useEffect(()=>setIndex(0),[club?.id]);
 const urls=[club?.logoUrl,club?.logoFallbackUrl].filter((v):v is string=>Boolean(v));
 return <span className={`team-badge ${compact?'team-badge--compact':''}`} title={name}>
 {index<urls.length?<img key={urls[index]} src={urls[index]} alt={`Escudo de ${name}`} loading="lazy" onError={()=>setIndex(n=>n+1)}/>:
 initials?<span className="team-badge-initials" aria-label={`DT: ${initials}`}>{initials}</span>:<Shield size={compact?22:30} aria-label={`Sin escudo para ${name}`}/>}
 </span>;
}

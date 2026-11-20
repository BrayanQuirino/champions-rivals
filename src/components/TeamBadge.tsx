import {useEffect,useState} from 'react';
import {Shield} from 'lucide-react';
import type {Club} from '../domain/matchmaker';

/** Usa la imagen del partido, luego el catálogo y, si falla, la bandera nacional. */
export function TeamBadge({club,name,compact=false,initials,logoUrl}:{club:Club|null;name:string;compact?:boolean;initials?:string;logoUrl?:string|null}){
 const [index,setIndex]=useState(0);
 useEffect(()=>setIndex(0),[club?.id,logoUrl]);
 const urls=[logoUrl,club?.logoUrl,club?.logoFallbackUrl].filter((v):v is string=>Boolean(v)).filter((v,i,a)=>a.indexOf(v)===i);
 return <span className={`team-badge ${compact?'team-badge--compact':''}`} title={name}>
 {index<urls.length?<img key={urls[index]} src={urls[index]} alt={`Emblema de ${name}`} loading="lazy" onError={()=>setIndex(n=>n+1)}/>:
 club?.flag?<span role="img" aria-label={`Bandera de ${name}`}>{club.flag}</span>:
 initials?<span className="team-badge-initials" aria-label={`DT: ${initials}`}>{initials}</span>:<Shield size={compact?22:30} aria-label={`Sin escudo para ${name}`}/>}
 </span>;
}

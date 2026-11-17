import {useEffect,useState} from 'react';
import {Shield} from 'lucide-react';
import type {Club} from '../domain/matchmaker';
export function TeamBadge({club,name,compact=false}:{club:Club|null;name:string;compact?:boolean}){
 const [index,setIndex]=useState(0);
 useEffect(()=>setIndex(0),[club?.id]);
 const urls=[club?.logoUrl,club?.logoFallbackUrl].filter((v):v is string=>Boolean(v));
 return <span className={`team-badge ${compact?'team-badge--compact':''}`} title={name}>
 {index<urls.length?<img key={urls[index]} src={urls[index]} alt={`Escudo de ${name}`} loading="lazy" onError={()=>setIndex(n=>n+1)}/>:
 club?.flag?<span role="img" aria-label={`Bandera de ${name}`}>{club.flag}</span>:<Shield size={compact?22:30} aria-label="Escudo no disponible"/>}
 </span>;
}

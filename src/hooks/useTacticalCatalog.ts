import {useEffect,useState} from 'react';
import type {TacticalCatalog} from '../domain/tactical';
export function useTacticalCatalog(){
 const [catalog,setCatalog]=useState<TacticalCatalog|null>(null);
 useEffect(()=>{
  const controller=new AbortController();
  fetch(`${import.meta.env.BASE_URL}data/tactical-archetypes.json`,{signal:controller.signal,cache:'no-cache'})
   .then(r=>{if(!r.ok)throw Error('Catálogo táctico no disponible');return r.json() as Promise<TacticalCatalog>})
   .then(value=>{if(value.schemaVersion!==1||value.archetypes.length!==10||value.dimensions.length!==6)throw Error('Catálogo táctico inválido');setCatalog(value)})
   .catch(e=>{if(!controller.signal.aborted)console.warn(e)});
  return ()=>controller.abort();
 },[]);
 return catalog;
}

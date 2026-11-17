import {useEffect,useState} from 'react';
import {parseClubCatalog} from '../domain/matchmaker';
import type {ClubCatalog,Club} from '../domain/matchmaker';
export function useClubCatalog(){
 const [catalog,setCatalog]=useState<ClubCatalog|null>(null);
 useEffect(()=>{
  const ctrl=new AbortController();
  fetch(`${import.meta.env.BASE_URL}data/club-catalog.json`,{signal:ctrl.signal,cache:'no-cache'})
   .then(r=>{if(!r.ok)throw Error('Error al cargar catálogo de equipos');return r.json() as Promise<unknown>;})
   .then(json=>setCatalog(parseClubCatalog(json)))
   .catch(e=>{if(!ctrl.signal.aborted)console.warn('Catálogo no disponible:',e);});
  return ()=>ctrl.abort();
 },[]);
 return catalog;
}
export function getClub(catalog:ClubCatalog|null,clubId?:string):Club|null{
 return catalog?.clubs.find(c=>c.id===clubId)??null;
}

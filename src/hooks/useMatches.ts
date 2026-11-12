import { useEffect, useState } from 'react';
import type { Database } from '../domain/schema';
import { loadDatabase } from '../services/matchRepository';
export function useMatches() {
  const [data,setData]=useState<Database|null>(null);
  const [error,setError]=useState('');
  const [attempt,setAttempt]=useState(0);
  useEffect(()=>{
    const controller=new AbortController(); setData(null);setError('');
    loadDatabase(controller.signal).then(setData).catch(e=>{if(!controller.signal.aborted)setError(e instanceof Error?e.message:'Error al leer los datos.');});
    return ()=>controller.abort();
  },[attempt]);
  return {data,error,retry:()=>setAttempt(n=>n+1)};
}

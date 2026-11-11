import { useEffect, useMemo, useState } from 'react';
import { ArrowLeftRight, Dices, RotateCcw, Shield } from 'lucide-react';
import { clubsForDraw, parseClubCatalog, pickBalancedMatch } from '../domain/matchmaker';
import type { Club, ClubCatalog, Pair } from '../domain/matchmaker';

function ClubLogo({club}:{club:Club}){
  const [broken,setBroken]=useState(false);
  useEffect(()=>setBroken(false),[club.id]);
  return <div className="draw-logo">{club.logoUrl&&!broken
    ? <img src={club.logoUrl} alt={`Escudo de ${club.name}`} loading="lazy" referrerPolicy="no-referrer" onError={()=>setBroken(true)}/>
    : <Shield size={39} aria-label="Escudo no disponible" />}</div>;
}
export function MatchGenerator(){
  const [catalog,setCatalog]=useState<ClubCatalog|null>(null);
  const [error,setError]=useState('');
  const [leagueId,setLeagueId]=useState('all');
  const [rating,setRating]=useState('all');
  const [pair,setPair]=useState<Pair|null>(null);
  const [previous,setPrevious]=useState('');
  useEffect(()=>{
    const controller=new AbortController();
    fetch(`${import.meta.env.BASE_URL}data/club-catalog.json`,{signal:controller.signal})
      .then(response=>{if(!response.ok)throw Error(`No se pudo cargar el catálogo (${response.status})`);return response.json() as Promise<unknown>})
      .then(data=>setCatalog(parseClubCatalog(data)))
      .catch(reason=>{if(!controller.signal.aborted)setError(reason instanceof Error?reason.message:'No se pudo leer el catálogo.');});
    return ()=>controller.abort();
  },[]);
  const clubs=useMemo(()=>catalog?clubsForDraw(catalog,leagueId,rating==='all'?null:Number(rating)):[],[catalog,leagueId,rating]);
  const eligible=useMemo(()=>{
    const counts=new Map<number,number>();clubs.forEach(c=>counts.set(c.rating,(counts.get(c.rating)??0)+1));
    return [...counts.values()].some(n=>n>=2);
  },[clubs]);
  function draw(){
    // Prefer a new pairing if more than one is possible, without changing the selected filters.
    let next:Pair|null=null;
    for(let i=0;i<8;i++){
      next=pickBalancedMatch(clubs);
      if(!next)break;
      const key=[next.home.id,next.away.id].sort().join('|');
      if(key!==previous || i===7){setPrevious(key);break;}
    }
    setPair(next);
  }
  function changeLeague(value:string){setLeagueId(value);setPair(null);setPrevious('');}
  function changeRating(value:string){setRating(value);setPair(null);setPrevious('');}
  return <section id="generador" className="match-generator" aria-labelledby="generator-title">
    <div className="generator-head"><div><span className="eyebrow">RIVALS · MATCH LAB</span>
      <h2 id="generator-title">El próximo desafío se decide al azar.</h2>
      <p>Sortea dos clubes de las mismas estrellas. Sin ventaja predeterminada, sin registrar partidos.</p>
    </div><Dices size={37} aria-hidden="true"/></div>
    {error?<p className="generator-error" role="alert">{error}</p>:!catalog?<p className="generator-loading" role="status">Cargando equipos y ligas…</p>:
    <>
      <div className="generator-filters">
        <label>Liga<select value={leagueId} onChange={e=>changeLeague(e.target.value)}>
          <option value="all">Todas las ligas ({catalog.leagues.length})</option>
          {catalog.leagues.map(l=><option key={l.id} value={l.id}>{l.name} · {l.country}</option>)}
        </select></label>
        <label>Nivel<select value={rating} onChange={e=>changeRating(e.target.value)}>
          <option value="all">Todas las estrellas</option>
          {[5,4,3,2,1].map(stars=><option key={stars} value={String(stars)}>{'★'.repeat(stars)}{'☆'.repeat(5-stars)}</option>)}
        </select></label>
        <span className="generator-count">{clubs.length} clubes disponibles</span>
      </div>
      <div className="generator-versus">
        {pair?<>
          <div className="generator-team"><ClubLogo club={pair.home}/><span className="eyebrow">BRAYAN</span><h3>{pair.home.name}</h3><div className="generator-stars" aria-label={`${pair.home.rating} de 5 estrellas`}>{'★'.repeat(pair.home.rating)}<span>{'☆'.repeat(5-pair.home.rating)}</span></div><small>{catalog.leagues.find(l=>l.id===pair.home.leagueId)?.name}</small></div>
          <strong className="generator-vs">VS</strong>
          <div className="generator-team"><ClubLogo club={pair.away}/><span className="eyebrow">JONI</span><h3>{pair.away.name}</h3><div className="generator-stars" aria-label={`${pair.away.rating} de 5 estrellas`}>{'★'.repeat(pair.away.rating)}<span>{'☆'.repeat(5-pair.away.rating)}</span></div><small>{catalog.leagues.find(l=>l.id===pair.away.leagueId)?.name}</small></div>
        </>:<p className="generator-placeholder">{eligible?'Dos equipos. Un solo desafío. Presiona «Sortear enfrentamiento».':'No hay dos clubes del mismo nivel con estos filtros.'}</p>}
      </div>
      <div className="generator-actions">
        <button className="generator-primary" onClick={draw} disabled={!eligible}><Dices size={19}/>{pair?'Volver a sortear':'Sortear enfrentamiento'}</button>
        {pair&&<button className="generator-secondary" onClick={()=>setPair({...pair,home:pair.away,away:pair.home})}><ArrowLeftRight size={17}/>Intercambiar</button>}
        <button className="generator-secondary" onClick={()=>{changeLeague('all');changeRating('all');setPair(null)}}><RotateCcw size={16}/>Restablecer</button>
      </div>
      <p className="generator-disclaimer">{catalog.clubs.length} clubes · {catalog.leagues.length} ligas · Estrellas orientativas no oficiales: basadas en Elo en las cinco grandes ligas y estimaciones provisionales en las demás. Los escudos aparecen solo cuando existe una URL verificada. No se guardan resultados.</p>
    </>}
  </section>;
}

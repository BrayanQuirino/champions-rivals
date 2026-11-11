import { useEffect, useMemo, useState } from 'react';
import { ArrowLeftRight, Dices, RotateCcw, Shield } from 'lucide-react';
import { clubsForMinimumRating, parseClubCatalog, pickBalancedMatch } from '../domain/matchmaker';
import type { Club, ClubCatalog, Pair } from '../domain/matchmaker';

function ClubLogo({club}:{club:Club}){
  const [imageIndex,setImageIndex]=useState(0);
  useEffect(()=>setImageIndex(0),[club.id]);
  const urls=[club.logoUrl,club.logoFallbackUrl].filter((url):url is string=>Boolean(url));
  return <div className="draw-logo">{imageIndex<urls.length
    ? <img key={urls[imageIndex]} src={urls[imageIndex]} alt={`Escudo de ${club.name}`} loading="lazy" decoding="async" onError={()=>setImageIndex(i=>i+1)}/>
    : club.flag ? <span className="draw-flag" role="img" aria-label={`Bandera de ${club.name}`}>{club.flag}</span> : <Shield size={39} aria-label="Escudo no disponible" />}</div>;
}
function StarRating({rating}:{rating:number}){
  return <div className="generator-stars" aria-label={`${rating} de 5 estrellas`} role="img">
    {[0,1,2,3,4].map(index=><span className="generator-star-unit" key={index} aria-hidden="true">
      <span className="generator-star-empty">★</span>
      <span className="generator-star-filled" style={{width:`${Math.max(0,Math.min(100,(rating-index)*100))}%`}}>★</span>
    </span>)}
  </div>;
}
export function MatchGenerator(){
  const [catalog,setCatalog]=useState<ClubCatalog|null>(null);
  const [error,setError]=useState('');
  const [leagueId,setLeagueId]=useState('all');
  const [minRating,setMinRating]=useState(1);
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
  const clubs=useMemo(()=>catalog?clubsForMinimumRating(catalog,leagueId,minRating):[],[catalog,leagueId,minRating]);
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
  function changeRating(value:number){setMinRating(value);setPair(null);setPrevious('');}
  return <section id="generador" className="match-generator" aria-labelledby="generator-title">
    <div className="generator-head"><div><span className="eyebrow">RIVALS · MATCH LAB</span>
      <h2 id="generator-title">El próximo desafío se decide al azar.</h2>
      <p>Elige desde cuántas estrellas quieres jugar. Cada sorteo mantiene rivales del mismo nivel. No se registran resultados.</p>
    </div><Dices size={37} aria-hidden="true"/></div>
    {error?<p className="generator-error" role="alert">{error}</p>:!catalog?<p className="generator-loading" role="status">Cargando equipos y ligas…</p>:
    <>
      <div className="generator-filters">
        <label className="generator-league-field">
          <span className="generator-filter-label">LIGA</span>
          <select value={leagueId} onChange={e=>changeLeague(e.target.value)}>
            <option value="all">Todas las ligas ({catalog.leagues.length})</option>
            {catalog.leagues.map(l=><option key={l.id} value={l.id}>{l.name} · {l.country}</option>)}
          </select>
        </label>
        <div className="generator-level-picker" role="group" aria-label="Nivel mínimo de estrellas">
          <div className="generator-level-header">
            <span className="generator-filter-label">ESTRELLAS MÍNIMAS</span>
            <span className="generator-level-value" aria-live="polite">{minRating === 1 ? 'Todos' : `${minRating}★+`}</span>
          </div>
          <div className="generator-star-track">
            {[1,1.5,2,2.5,3,3.5,4,4.5,5].map(star=>(
              <button type="button" key={star}
                className={`generator-star-step ${star>=minRating?'generator-star-step--included':''} ${star===minRating?'generator-star-step--selected':''}`}
                aria-pressed={star===minRating}
                aria-label={star===1?'Desde 1 estrella, todos los niveles':`Desde ${star} estrellas en adelante`}
                onClick={()=>changeRating(star)}>
                <span aria-hidden="true">{star}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      <p className="generator-filter-summary" aria-live="polite">{clubs.length} equipos disponibles · {minRating===1?'Sin límite mínimo':`Desde ${minRating} estrellas`} · Rivales del mismo nivel</p>
      <div className="generator-versus">
        {pair?<>
          <div className="generator-team"><ClubLogo club={pair.home}/><span className="eyebrow">RIVAL 1</span><h3>{pair.home.name}</h3><StarRating rating={pair.home.rating}/><small>{catalog.leagues.find(l=>l.id===pair.home.leagueId)?.name}</small></div>
          <strong className="generator-vs">VS</strong>
          <div className="generator-team"><ClubLogo club={pair.away}/><span className="eyebrow">RIVAL 2</span><h3>{pair.away.name}</h3><StarRating rating={pair.away.rating}/><small>{catalog.leagues.find(l=>l.id===pair.away.leagueId)?.name}</small></div>
        </>:<p className="generator-placeholder">{eligible?'Dos equipos. Un solo desafío. Presiona «Sortear enfrentamiento».':'No hay dos equipos del mismo nivel con estos filtros.'}</p>}
      </div>
      <div className="generator-actions">
        <button className="generator-primary" onClick={draw} disabled={!eligible}><Dices size={19}/>{pair?'Volver a sortear':'Sortear enfrentamiento'}</button>
        {pair&&<button className="generator-secondary" onClick={()=>setPair({...pair,home:pair.away,away:pair.home})}><ArrowLeftRight size={17}/>Intercambiar</button>}
        <button className="generator-secondary" onClick={()=>{changeLeague('all');changeRating(1);setPair(null)}}><RotateCcw size={16}/>Restablecer</button>
      </div>
      <p className="generator-disclaimer">{catalog.clubs.length} equipos · {catalog.leagues.length} ligas · Estrellas orientativas no oficiales: basadas en Elo en las cinco grandes ligas y estimaciones provisionales en las demás. Los escudos y banderas se muestran cuando están disponibles. No se guardan resultados.</p>
    </>}
  </section>;
}

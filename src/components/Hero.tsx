import {useRef,useState} from 'react';
import type {TouchEvent} from 'react';
import {ArrowDown,ArrowLeft,ArrowRight,Newspaper,Trophy} from 'lucide-react';
import type {Database,Match} from '../domain/schema';
import type {ClubCatalog} from '../domain/matchmaker';
import {getClub} from '../hooks/useClubCatalog';
import {TeamBadge} from './TeamBadge';
import {winner} from '../domain/statistics';

export function Hero({latest,players,catalog,onSelect}:{latest?:Match;players:Database['players'];catalog:ClubCatalog|null;onSelect:(m:Match)=>void}){
 const [slide,setSlide]=useState(0);
 const touchStart=useRef<number|null>(null);
 const name=(id:string)=>players.find(p=>p.id===id)?.name??id;
 const initials=(id:string)=>players.find(p=>p.id===id)?.initials??'DT';
 const winningSide=latest?(winner(latest)===latest.home.playerId?latest.home:winner(latest)===latest.away.playerId?latest.away:null):null;
 const losingSide=latest&&winningSide?(winningSide===latest.home?latest.away:latest.home):null;
 const summary=latest?.news?.summary??(latest&&winningSide&&losingSide?`${name(winningSide.playerId)} conquistó la final con ${winningSide.team}, tras vencer ${winningSide.goals}–${losingSide.goals} a ${losingSide.team}.`:latest?`Una final que terminó ${latest.home.goals}–${latest.away.goals} entre ${latest.home.team} y ${latest.away.team}.`:'');
 const headline=latest?.news?.headline??(winningSide?`¡${winningSide.team.replace(/^Selección de /,'').toUpperCase()} SE CORONA!`:'FINAL DE INFARTO');
 const onTouchEnd=(event:TouchEvent<HTMLElement>)=>{
   if(touchStart.current===null)return;
   const dx=event.changedTouches[0].clientX-touchStart.current;
   if(Math.abs(dx)>65)setSlide(dx<0?1:0);
   touchStart.current=null;
 };
 return <section className="hero hero-carousel" id="inicio" aria-label="Carrusel del resumen y noticias" onTouchStart={(e)=>{touchStart.current=e.touches[0].clientX;}} onTouchEnd={onTouchEnd}>
   <div className="orb orb-one"/><div className="orb orb-two"/>
   <div className="hero-slides" aria-live="polite">
    {slide===0?
     <div className="hero-slide hero-slide--summary" key="summary">
       <div className="hero-copy"><span className="eyebrow"><span className="live-dot"/> DOS HERMANOS. UNA RIVALIDAD.</span><h1>Las noches son<br/>de <em>campeones.</em></h1><p>El silbatazo final es solo el principio.<br/>Cada gol, cada revancha, toda nuestra historia.</p><a className="primary-button" href="#historial">Explorar partidos <ArrowDown size={16}/></a><div className="hero-signature">RIVALS LEAGUE <span>·</span> HISTORIAL DE ENCUENTROS</div></div>
       <div className="scoreboard"><div className="scoreboard-top"><Trophy size={15}/><span>{latest?'ÚLTIMO ENFRENTAMIENTO':'EL PRÓXIMO CAPÍTULO'}</span><span className="status">{latest?'FINAL':'POR JUGAR'}</span></div>
        <div className="versus"><div>{latest?<div className="hero-team-logo"><TeamBadge club={getClub(catalog,latest.home.clubId)} name={latest.home.team} logoUrl={latest.home.logoUrl} initials={initials(latest.home.playerId)}/></div>:<div className="crest">{players[0].initials}</div>}<h3>{latest?name(latest.home.playerId):players[0].name}</h3><p>{latest?latest.home.team:'Jugador 01'}</p></div>
         <div className="big-score">{latest?<>{latest.home.goals}<span>:</span>{latest.away.goals}</>:<span>VS</span>}</div>
         <div>{latest?<div className="hero-team-logo"><TeamBadge club={getClub(catalog,latest.away.clubId)} name={latest.away.team} logoUrl={latest.away.logoUrl} initials={initials(latest.away.playerId)}/></div>:<div className="crest crest-violet">{players[1].initials}</div>}<h3>{latest?name(latest.away.playerId):players[1].name}</h3><p>{latest?latest.away.team:'Jugador 02'}</p></div></div>
        {latest?<button className="scoreboard-bottom" onClick={()=>onSelect(latest)}>Ver estadísticas del partido <span>↗</span></button>:<div className="scoreboard-bottom">La historia empieza con su primer partido <span>✦</span></div>}
       </div>
     </div>:
     <div className="hero-slide hero-slide--news" key="news">
       {latest?.news?.imageUrl&&<div className="hero-news-photo" style={{backgroundImage:`url("${latest.news.imageUrl}")`}} role="img" aria-label={latest.news.imageNote??'Imagen ilustrativa de fútbol'}/>}
       <div className="hero-news-gradient"/>
       <div className="hero-news-content">
        <span className="hero-news-kicker"><Newspaper size={17}/> RIVALS SPORT · ÚLTIMA HORA</span>
        <span className="hero-news-category">{latest?.competition==='world-cup'?'FINAL DE LA COPA DEL MUNDO':'FINAL DE CHAMPIONS LEAGUE'}</span>
        <h2>{latest?headline:'EL PRÓXIMO TITULAR LO ESCRIBES TÚ'}</h2>
        <p>{latest?summary:'Registra un partido y aquí aparecerá su crónica deportiva.'}</p>
        {latest&&<div className="hero-news-footer"><span className="hero-news-result">{latest.home.team} <b>{latest.home.goals}–{latest.away.goals}</b> {latest.away.team}</span><button onClick={()=>onSelect(latest)}>Ver ficha del encuentro <ArrowRight size={16}/></button></div>}
        {latest?.news?.imageSourceUrl&&<p className="hero-news-credit"><a href={latest.news.imageSourceUrl} target="_blank" rel="noreferrer">{latest.news.imageCredit??'Fotografía de archivo'}</a> · {latest.news.imageNote}</p>}
       </div>
     </div>}
   </div>
   <div className="hero-carousel-controls" aria-label="Navegación del carrusel">
     <button type="button" className="hero-carousel-arrow" onClick={()=>setSlide(s=>(s+1)%2)} aria-label="Diapositiva anterior"><ArrowLeft size={19}/></button>
     <div className="hero-carousel-dots"><button type="button" className={slide===0?'active':''} aria-label="Ver resumen" aria-current={slide===0?'true':undefined} onClick={()=>setSlide(0)}/><button type="button" className={slide===1?'active':''} aria-label="Ver noticia del último partido" aria-current={slide===1?'true':undefined} onClick={()=>setSlide(1)}/></div>
     <span className="hero-carousel-indicator">{slide+1} / 2</span>
     <button type="button" className="hero-carousel-arrow" onClick={()=>setSlide(s=>(s+1)%2)} aria-label="Siguiente diapositiva"><ArrowRight size={19}/></button>
   </div>
 </section>;
}

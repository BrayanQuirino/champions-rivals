import type {Match,Player} from '../domain/schema';
import {profileFor} from '../domain/tactical';
import type {TacticalCatalog,RadarAxisId} from '../domain/tactical';

const center=190;
const radius=128;
const axes:RadarAxisId[]=['ataque','defensa','posesion','precision','creacion','efectividad'];
function xy(index:number,value:number){
 const angle=-Math.PI/2+Math.PI*2*index/axes.length;
 return [center+Math.cos(angle)*radius*value/100,center+Math.sin(angle)*radius*value/100] as const;
}
function polygon(values:number[]){
 return values.map((value,index)=>xy(index,value).join(',')).join(' ');
}
export function CoachRadar({player,matches,catalog}:{player:Player;matches:Match[];catalog:TacticalCatalog|null}){
 if(!catalog)return <section className="tactical-panel"><p>Cargando perfiles tácticos…</p></section>;
 const profile=profileFor(matches,player.id,catalog);
 const archetype=profile.archetype;
 const complete=axes.every(id=>profile.values[id]!==null);
 return <section className="tactical-panel" aria-labelledby="tactical-title">
   <div className="coach-panel-head">
    <span className="eyebrow">RIVALS · PERFIL TÁCTICO</span>
    <h3 id="tactical-title">ADN del director técnico</h3>
    <p>Radar de rendimiento por partido: ataque, defensa, posesión, precisión, creación y efectividad.</p>
   </div>
   {profile.status==='none'?<div className="tactical-no-data"><strong>Sin datos suficientes</strong><p>{profile.detailedMatches===0?'Aún no hay estadísticas detalladas de partidos de este DT.':`Solo hay ${profile.completeAxes} de 6 ejes calculables.`} El perfil se completará con las próximas fotografías.</p></div>:
   <div className="tactical-layout">
    <div className="tactical-radar-frame">
     <svg viewBox="0 0 380 380" role="img" aria-label={`Radar de ${player.name} en ataque, defensa, posesión, precisión, creación y efectividad. ${axes.map((a,i)=>`${catalog.dimensions[i]?.label}: ${profile.values[a]??'sin dato'}`).join('; ')}`}>
      {Array.from({length:4},(_,i)=><polygon key={i} points={polygon(Array(6).fill((i+1)*25))} fill={i===3?'#172c4b50':'none'} stroke="#5f84a555" strokeWidth="1"/>)}
      {axes.map((a,i)=>{
       const [x,y]=xy(i,100);
       const [lx,ly]=xy(i,119);
       return <g key={a}><line x1={center} y1={center} x2={x} y2={y} stroke="#5b83a860"/>
        <text x={lx} y={ly} fill="#a8c2de" fontSize="10" textAnchor={lx<center-8?'end':lx>center+8?'start':'middle'} dominantBaseline="middle">{({ataque:'Ataque',defensa:'Defensa',posesion:'Posesión',precision:'Precisión',creacion:'Creación',efectividad:'Efectividad'} as Record<RadarAxisId,string>)[a]}</text>
       </g>;
      })}
      {archetype&&<polygon points={polygon(axes.map(a=>archetype.radar[a]))} fill="#bca6ff14" stroke="#ad97fa" strokeWidth="2" strokeDasharray="5 5"/>}
      {complete&&<polygon points={polygon(axes.map(a=>profile.values[a]!))} fill="#65e6fc34" stroke="#65e6fc" strokeWidth="3" strokeLinejoin="round"/>}
      {axes.map((a,i)=>profile.values[a]===null?null:<circle key={a} cx={xy(i,profile.values[a]!)[0]} cy={xy(i,profile.values[a]!)[1]} r="5" fill="#65e6fc" stroke="#0e1a34" strokeWidth="2"><title>{`${catalog.dimensions[i]?.label}: ${profile.values[a]} / 100`}</title></circle>)}
     </svg>
     <div className="tactical-legend"><span><i className="actual"/> Datos observados</span><span><i className="reference"/> Perfil de referencia</span></div>
    </div>
    <div className="tactical-insights">
     <span className="eyebrow">{profile.status==='provisional'?'ARQUETIPO PROVISIONAL':'ARQUETIPO ESTIMADO'}</span>
     <h4>{archetype?.name??'Sin partidos registrados'}</h4>
     <p>{archetype?.description??(profile.reason==='insufficient-data'?'La clasificación es provisional mientras se registran más estadísticas.':profile.reason==='low-similarity'?'Se muestra el patrón más cercano; la afinidad todavía es baja.':'Se muestra el patrón más cercano; existen otros estilos similares.')}</p>
     {archetype&&<div className="tactical-score"><strong>{profile.similarity}%</strong><span>Afinidad con el patrón de referencia; no es una probabilidad</span></div>}
     {!archetype&&profile.candidates.length>0&&<div className="tactical-candidates"><span className="eyebrow">OTROS PATRONES CERCANOS</span>{profile.candidates.map(c=><p key={c.archetype.id}><strong>{c.archetype.name}</strong> · {c.similarity}% de afinidad editorial</p>)}</div>}
     <p className="tactical-coverage">{profile.detailedMatches} de {profile.totalMatches} partidos con estadísticas detalladas · {profile.completeAxes} de 6 ejes disponibles</p>
     <div className="tactical-values">{catalog.dimensions.map(d=><div key={d.id}><span>{d.label}</span><strong>{profile.values[d.id]===null?'—':`${profile.values[d.id]}/100`}</strong></div>)}</div>
    </div>
   </div>}
   <p className="tactical-method">Nota metodológica: se utilizan tiros, xG, goles, posesión, precisión de pases y tiros, entradas exitosas, recuperaciones y rupturas registradas. Los conteos se comparan con el rival en cada encuentro; los datos ausentes no se inventan. Si solo hay marcadores, ataque y defensa son estimaciones provisionales derivadas de goles. El arquetipo siempre es el más cercano entre los disponibles cuando existen partidos; se considera estable con al menos {catalog.methodology.sampleMinimumForStableArchetype} partidos detallados, seis dimensiones, afinidad mínima de 80/100 y separación de cuatro puntos frente al segundo patrón. Las etiquetas son interpretaciones estadísticas, no pruebas de una táctica específica.</p>
  </section>;
}

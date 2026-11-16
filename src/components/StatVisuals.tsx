import type { Match, Player } from '../domain/schema';
export type MatchStats = NonNullable<Match['stats']>['home'];
export const statGroups = [
 {title:'Ataque y posesión',items:[['possession','Posesión','%'],['shots','Tiros',''],['shotsOnTarget','Tiros a puerta',''],['expectedGoals','Goles esperados (xG)',''],['passes','Pases',''],['corners','Tiros de esquina','']]},
 {title:'Defensa y disciplina',items:[['tackles','Entradas',''],['successfulTackles','Entradas con éxito',''],['recoveries','Recuperaciones',''],['saves','Atajadas',''],['fouls','Faltas cometidas',''],['offsides','Fueras de lugar',''],['freeKicks','Tiros libres',''],['penalties','Penales',''],['yellowCards','Tarjetas amarillas',''],['redCards','Tarjetas rojas','']]},
 {title:'Eficacia y creación',items:[['dribbleSuccessRate','Éxito en regates','%'],['shotAccuracy','Precisión en tiros','%'],['passAccuracy','Precisión de pases','%'],['lineBreaksMiddle','Quiebre por el medio',''],['lineBreaksWide','Quiebre por los laterales',''],['lineBreaksOver','Quiebre por arriba',''],['lineBreakAttempts','Intentos de quiebre','']]}
] as const;
export const rateKeys=new Set<string>(['possession','dribbleSuccessRate','shotAccuracy','passAccuracy']);
export function metricValue(stats:MatchStats|null|undefined,key:string):number|null{
 const value=stats?.[key as keyof MatchStats];
 return typeof value==='number'?value:null;
}
export function formatMetric(value:number|null,suffix=''){
 if(value===null)return '—';
 return value.toLocaleString('es-MX',{maximumFractionDigits:1})+suffix;
}
export function getPlayerStats(match:Match,playerId:string):MatchStats|null{
 return match.home.playerId===playerId?match.stats?.home??null:match.away.playerId===playerId?match.stats?.away??null:null;
}
export function summaryFor(matches:Match[],id:string):{values:Record<string,number|null>;coverage:number}{
 const values:Record<string,number|null>={};const stats=matches.map(m=>getPlayerStats(m,id)).filter((s):s is MatchStats=>s!==null);
 for(const group of statGroups)for(const [key] of group.items){
  const available=stats.map(s=>metricValue(s,key)).filter((v):v is number=>v!==null);
  values[key]=available.length?(available.reduce((a,b)=>a+b,0)/(rateKeys.has(key)?available.length:1)):null;
 }
 return {values,coverage:stats.length};
}
export function RateRing({value,label,color}:{value:number|null;label:string;color:string}){
 const p=value===null?0:Math.max(0,Math.min(100,value));
 return <div className="stat-ring" style={{['--ring-color' as string]:color}}>
   <div className="stat-ring-face" style={{background:`conic-gradient(${color} ${p}%, #233352 ${p}% 100%)`}}><div><strong>{value===null?'—':`${Math.round(value)}%`}</strong></div></div>
   <span>{label}</span>
 </div>;
}
export function StatComparison({left,right,leftName,rightName}:{left:Record<string,number|null>;right:Record<string,number|null>;leftName:string;rightName:string}){
 return <div className="stat-comparison">
  <div className="stat-legend"><span>{leftName}</span><span>{rightName}</span></div>
  <div className="stat-donuts">{(['dribbleSuccessRate','shotAccuracy','passAccuracy','possession'] as const).map(key=><div className="stat-donut-pair" key={key}>
    <h4>{statGroups.flatMap(g=>g.items).find(item=>item[0]===key)?.[1]}</h4>
    <div><RateRing value={left[key]??null} label={leftName} color="#65e6fc"/><RateRing value={right[key]??null} label={rightName} color="#bc9cfa"/></div>
   </div>)}</div>
  {statGroups.map(group=><div className="stat-group" key={group.title}><h3>{group.title}</h3>
   {group.items.map(([key,label,unit])=>{
    const a=left[key]??null,b=right[key]??null,max=Math.max(1,a??0,b??0);
    return <div className="stat-compare-row" key={key}>
     <strong>{formatMetric(a,unit)}</strong><div className="stat-track stat-left"><i style={{width:`${a===null?0:a/max*100}%`}}/></div>
     <span>{label}</span><div className="stat-track stat-right"><i style={{width:`${b===null?0:b/max*100}%`}}/></div><strong>{formatMetric(b,unit)}</strong>
    </div>;
   })}
  </div>)}
 </div>;
}
export function GoalTimeline({matches,player}:{matches:Match[];player:Player}){
 const ordered=[...matches].filter(m=>m.home.playerId===player.id||m.away.playerId===player.id).sort((a,b)=>a.date.localeCompare(b.date)||a.id.localeCompare(b.id)).slice(-20);
 if(!ordered.length)return <p className="muted">Todavía no hay partidos registrados para este DT.</p>;
 const goals=ordered.map(m=>m.home.playerId===player.id?m.home.goals:m.away.goals);
 const conceded=ordered.map(m=>m.home.playerId===player.id?m.away.goals:m.home.goals);
 const max=Math.max(1,...goals,...conceded);const w=720,h=260,l=42,r=18,t=17,b=43;
 const px=(i:number)=>l+(ordered.length===1?(w-l-r)/2:i*(w-l-r)/(ordered.length-1));
 const py=(n:number)=>t+(max-n)*(h-t-b)/max;
 const line=(arr:number[])=>arr.map((v,i)=>`${i===0?'M':'L'} ${px(i)} ${py(v)}`).join(' ');
 return <div className="goal-chart"><div className="goal-chart-legend"><span><i/> Goles anotados</span><span><i/> Goles recibidos</span></div>
  <div className="goal-chart-scroller"><svg viewBox={`0 0 ${w} ${h}`} role="img" aria-label={`Gráfico de goles anotados y recibidos por ${player.name} en los últimos ${ordered.length} partidos`}>
   <defs><linearGradient id={`goalFade-${player.id}`} x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#65e6fc" stopOpacity=".23"/><stop offset="100%" stopColor="#65e6fc" stopOpacity="0"/></linearGradient></defs>
   {Array.from({length:max+1},(_,v)=><g key={v}><line x1={l} y1={py(v)} x2={w-r} y2={py(v)} stroke="#7891b3" strokeOpacity=".16" strokeDasharray="3 6"/><text x={l-16} y={py(v)+4} fill="#8297be" fontSize="11" textAnchor="end">{v}</text></g>)}
   <path d={`${line(goals)} L ${px(ordered.length-1)} ${h-b} L ${px(0)} ${h-b} Z`} fill={`url(#goalFade-${player.id})`}/>
   <path d={line(goals)} fill="none" stroke="#65e6fc" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
   <path d={line(conceded)} fill="none" stroke="#bc9cfa" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
   {ordered.map((m,i)=><g key={m.id}>
    <circle cx={px(i)} cy={py(goals[i])} r="5" fill="#65e6fc" stroke="#0c142b" strokeWidth="2"><title>{`${m.date}: ${goals[i]} anotados · ${m.home.team} vs ${m.away.team}`}</title></circle>
    <circle cx={px(i)} cy={py(conceded[i])} r="5" fill="#bc9cfa" stroke="#0c142b" strokeWidth="2"><title>{`${m.date}: ${conceded[i]} recibidos · ${m.home.team} vs ${m.away.team}`}</title></circle>
    <text x={px(i)} y={h-18} textAnchor="middle" fontSize="10" fill="#94aace">{i+1}</text>
   </g>)}
  </svg></div><p className="stat-chart-note">Partidos en orden cronológico (1 = más antiguo del periodo). Máximo 20 partidos; fechas de registro cuando no se indicó la fecha real.</p>
 </div>;
}

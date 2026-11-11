import type { Match, Player } from './schema';
/** Los goles de tandas no cuentan como goles a favor; sí definen al ganador. */
export function winner(m: Match): string | null {
  const home = m.penalties?.home ?? m.home.goals;
  const away = m.penalties?.away ?? m.away.goals;
  return home===away ? null : home>away ? m.home.playerId : m.away.playerId;
}
export function newestFirst(matches: Match[]) { return [...matches].sort((a,b)=>b.date.localeCompare(a.date)||b.id.localeCompare(a.id)); }
export function standings(players: Player[], matches: Match[]) {
  return players.map(player=>{
    const played=matches.filter(m=>m.home.playerId===player.id||m.away.playerId===player.id);
    const wins=played.filter(m=>winner(m)===player.id).length;
    const draws=played.filter(m=>winner(m)===null).length;
    const goalsFor=played.reduce((sum,m)=>sum+(m.home.playerId===player.id?m.home.goals:m.away.goals),0);
    const goalsAgainst=played.reduce((sum,m)=>sum+(m.home.playerId===player.id?m.away.goals:m.home.goals),0);
    const form=newestFirst(played).slice(0,5).reverse().map(m=>winner(m)===null?'E':winner(m)===player.id?'V':'D');
    return {...player,played:played.length,wins,draws,losses:played.length-wins-draws,goalsFor,goalsAgainst,points:wins*3+draws,form};
  }).sort((a,b)=>b.points-a.points||(b.goalsFor-b.goalsAgainst)-(a.goalsFor-a.goalsAgainst)||b.goalsFor-a.goalsFor);
}

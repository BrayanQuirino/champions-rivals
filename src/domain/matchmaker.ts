export interface Club {
  id: string;
  name: string;
  leagueId: string;
  country: string;
  rating: number;
  elo: number | null;
  logoUrl: string | null;
  flag?: string | null;
}
export interface League { id: string; name: string; country: string; clubCount: number }
export interface ClubCatalog {
  schemaVersion: number;
  updatedAt: string;
  ratingMethod: string;
  source: string;
  leagues: League[];
  clubs: Club[];
}
export interface Pair { home: Club; away: Club; starDifference: number; eloDifference: number }
export function clubsForDraw(catalog: ClubCatalog, leagueId: string, rating: number | null): Club[] {
  return catalog.clubs.filter(club => (leagueId === 'all' || club.leagueId === leagueId) && (rating === null || club.rating === rating));
}
/** Shuffle-independent pairing: prefer same number of stars, then closest Elo.
 * Eligible pairs come from the selected pool, and never include the same club twice.
 * Randomizer is injected for deterministic tests.
 */
export function pickBalancedMatch(clubs: Club[], random: () => number = Math.random): Pair | null {
  if (clubs.length < 2) return null;
  const pairs: Pair[] = [];
  for (let i = 0; i < clubs.length; i++) {
    for (let j = i + 1; j < clubs.length; j++) {
      if (clubs[i].id === clubs[j].id) continue;
      const starDifference = Math.abs(clubs[i].rating - clubs[j].rating);
      if (starDifference !== 0) continue;
      const eloA = clubs[i].elo;
      const eloB = clubs[j].elo;
      const eloDifference = eloA !== null && eloB !== null ? Math.abs(eloA - eloB) : 0;
      pairs.push({home:clubs[i],away:clubs[j],starDifference,eloDifference});
    }
  }
  if (!pairs.length) return null;
  const chosen=pairs[Math.min(Math.floor(random()*pairs.length),pairs.length-1)];
  return random()<0.5?chosen:{...chosen,home:chosen.away,away:chosen.home};
}
/** Strictly validate catalog shape, URLs and references before rendering. */
export function parseClubCatalog(value: unknown): ClubCatalog {
  if (!value || typeof value !== 'object') throw Error('El catálogo no tiene el formato esperado.');
  const data=value as Partial<ClubCatalog>;
  if (data.schemaVersion!==1 || !Array.isArray(data.leagues) || !Array.isArray(data.clubs)) throw Error('Catálogo incompatible.');
  const leagueIds = new Set<string>();
  for (const league of data.leagues) {
    if (!league || typeof league.id!=='string' || !league.id || leagueIds.has(league.id) || typeof league.name!=='string') throw Error('Liga inválida o duplicada.');
    leagueIds.add(league.id);
  }
  const seen=new Set<string>();
  for(const club of data.clubs) {
    if(!club || typeof club.id!=='string' || !club.id || seen.has(club.id) || typeof club.name!=='string' || !leagueIds.has(club.leagueId) || !Number.isInteger(club.rating) || club.rating<1 || club.rating>5 || (club.elo!==null && (typeof club.elo!=='number' || !Number.isFinite(club.elo))) || (club.logoUrl!==null && (typeof club.logoUrl!=='string' || !club.logoUrl.startsWith('https://')))) throw Error('Equipo inválido en el catálogo.');
    seen.add(club.id);
  }
  return data as ClubCatalog;
}

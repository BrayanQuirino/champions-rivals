export interface Club {
  id: string;
  name: string;
  leagueId: string;
  country: string;
  rating: number;
  elo: number | null;
  logoUrl: string | null;
  logoFallbackUrl?: string | null;
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
/** Inclusive minimum tier, independent of the exact-tier filter kept for compatibility. */
export function clubsForMinimumRating(catalog: ClubCatalog, leagueId: string, minRating: number): Club[] {
  if (!Number.isInteger(minRating * 2) || minRating < 1 || minRating > 5) return [];
  return catalog.clubs.filter(club => (leagueId === 'all' || club.leagueId === leagueId) && club.rating >= minRating);
}
/** Builds random matchups with at most one star of difference (including half stars).
 * The minimum-rating filter is applied before calling this function.
 * Randomizer is injected for deterministic tests.
 */
export function pickBalancedMatch(clubs: Club[], random: () => number = Math.random): Pair | null {
  if (clubs.length < 2) return null;
  const pairs: Pair[] = [];
  for (let i = 0; i < clubs.length; i++) {
    for (let j = i + 1; j < clubs.length; j++) {
      if (clubs[i].id === clubs[j].id) continue;
      const starDifference = Math.abs(clubs[i].rating - clubs[j].rating);
      if (starDifference > 1) continue;
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
    if(!club || typeof club.id!=='string' || !club.id || seen.has(club.id) || typeof club.name!=='string' || !leagueIds.has(club.leagueId) || !Number.isInteger(club.rating*2) || club.rating<1 || club.rating>5 || (club.elo!==null && (typeof club.elo!=='number' || !Number.isFinite(club.elo))) || (club.logoUrl!==null && (typeof club.logoUrl!=='string' || !club.logoUrl.startsWith('https://'))) || (club.logoFallbackUrl!=null && (typeof club.logoFallbackUrl!=='string' || !club.logoFallbackUrl.startsWith('https://')))) throw Error('Equipo inválido en el catálogo.');
    seen.add(club.id);
  }
  return data as ClubCatalog;
}

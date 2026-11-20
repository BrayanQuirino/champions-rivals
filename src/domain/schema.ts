import { z } from 'zod';
const id = z.string().min(1).max(80);
const goals = z.number().int().min(0).max(99);
const side = z.object({ playerId: id, team: z.string().min(1).max(80), clubId: id.optional(), logoUrl: z.string().url().startsWith('https://').nullable().optional(), goals });
const optionalCount = z.number().int().nonnegative().nullable().optional();
const optionalRate = z.number().min(0).max(100).nullable().optional();
const statistics = z.object({
  possession: z.number().min(0).max(100).nullable(),
  shots: z.number().int().nonnegative().nullable(),
  shotsOnTarget: z.number().int().nonnegative().nullable(),
  expectedGoals: z.number().nonnegative().nullable().optional(),
  passes: optionalCount, tackles: optionalCount, successfulTackles: optionalCount,
  recoveries: optionalCount, saves: optionalCount, fouls: optionalCount,
  offsides: optionalCount, corners: optionalCount, freeKicks: optionalCount,
  penalties: optionalCount, yellowCards: optionalCount, redCards: optionalCount,
  dribbleSuccessRate: optionalRate, shotAccuracy: optionalRate, passAccuracy: optionalRate,
  lineBreaksMiddle: optionalCount, lineBreaksWide: optionalCount,
  lineBreaksOver: optionalCount, lineBreakAttempts: optionalCount,
});
export const matchSchema = z.object({
  id, date: z.iso.date(), season: id, venueId: id.optional(), home: side, away: side,
  competition: z.enum(['champions-league', 'world-cup']), stage: z.literal('final'),
  news: z.object({headline:z.string().min(3).max(95),summary:z.string().min(3).max(280),imageUrl:z.string().url().startsWith('https://').optional(),imageCredit:z.string().max(180).optional(),imageSourceUrl:z.string().url().startsWith('https://').optional(),imageNote:z.string().max(160).optional()}).optional(),
  extraTime: z.boolean().default(false),
  penalties: z.object({ home: goals, away: goals }).nullable().default(null),
  stats: z.object({ home: statistics, away: statistics }).nullable().default(null),
  source: z.object({ type: z.enum(['photo', 'manual']), reference: z.string().max(200).nullable(), notes: z.string().max(500).nullable() }),
}).superRefine((m, ctx) => {
  const issue = (message: string) => ctx.addIssue({ code: 'custom', message });
  if (m.home.playerId === m.away.playerId) issue('Los jugadores deben ser distintos.');
  if (m.penalties && (m.home.goals !== m.away.goals || m.penalties.home === m.penalties.away)) issue('Los penales requieren marcador empatado y un ganador.');
  if (m.stats) {
    for (const s of [m.stats.home, m.stats.away]) if (s.shots !== null && s.shotsOnTarget !== null && s.shotsOnTarget > s.shots) issue('Tiros a puerta superiores a tiros totales.');
    const a=m.stats.home.possession, b=m.stats.away.possession;
    if (a!==null && b!==null && Math.abs(a+b-100)>0.1) issue('La posesión debe sumar 100.');
  }
});
export const databaseSchema = z.object({
  schemaVersion: z.literal(1),
  players: z.array(z.object({ id, name: z.string().min(1).max(40), initials: z.string().min(1).max(3) })).length(2),
  matches: z.array(matchSchema),
  venues: z.array(z.object({ id, name: z.string().min(1).max(100), description: z.string().max(400) })).optional(),
}).superRefine((db, ctx) => {
  const ids = new Set(db.players.map(p=>p.id));
  if(ids.size!==2) ctx.addIssue({code:'custom',message:'IDs de jugadores duplicados.'});
  const venues = new Set((db.venues ?? []).map(v => v.id));
  if (venues.size !== (db.venues ?? []).length) ctx.addIssue({code:'custom',message:'Sedes duplicadas.'});
  const matches = new Set<string>();
  for(const m of db.matches){
    if(matches.has(m.id)) ctx.addIssue({code:'custom',message:`Partido duplicado: ${m.id}`});
    matches.add(m.id);
    if (m.venueId && !venues.has(m.venueId)) ctx.addIssue({code:'custom',message:`Sede desconocida: ${m.venueId}`});
    if(!ids.has(m.home.playerId)||!ids.has(m.away.playerId)) ctx.addIssue({code:'custom',message:'Jugador desconocido.'});
  }
});
export type Match = z.infer<typeof matchSchema>;
export type Database = z.infer<typeof databaseSchema>;
export type Player = Database['players'][number];

import { databaseSchema } from '../domain/schema';
/** Único punto de lectura de la base; las escrituras se versionan en GitHub. */
export async function loadDatabase(demo: boolean, signal: AbortSignal) {
  const response=await fetch(`${import.meta.env.BASE_URL}data/${demo?'demo':'matches'}.json`, {signal, cache:'no-cache'});
  if(!response.ok) throw new Error('No se pudo cargar el historial. Intenta de nuevo.');
  return databaseSchema.parse(await response.json());
}

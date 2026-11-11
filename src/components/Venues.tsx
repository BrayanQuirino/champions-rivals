import type { Database, Match } from '../domain/schema';
export function Venues({venues,matches}:{venues:NonNullable<Database['venues']>;matches:Match[]}) {
  if (!venues.length) return null;
  return <section id="sedes" className="venues-section" aria-labelledby="venues-heading">
    <span className="eyebrow">EL ESCENARIO DE NUESTRA RIVALIDAD</span>
    <h2 id="venues-heading" className="venues-title">Nuestras sedes</h2>
    {venues.map(venue => {
      const count=matches.filter(match=>match.venueId===venue.id).length;
      return <article className="venue-card" key={venue.id}>
        <div className="venue-visual">
          <img src={`${import.meta.env.BASE_URL}images/venues/winterfell-arena.webp`} alt="Vista exterior de Winterfell Arena, estadio con cúpula moderna y detalles de piedra al anochecer" loading="lazy" decoding="async" />
          <span className="venue-visual-label">WINTERFELL ARENA · NUESTRA SEDE</span>
        </div>
        <div className="venue-details">
          <span className="eyebrow">SEDE OFICIAL · NUESTRA HISTORIA</span>
          <h3>{venue.name}</h3>
          <p>{venue.description}</p>
          <div className="venue-info"><span>Partidos registrados: {count}</span><span>Casa de la rivalidad</span></div>
        </div>
      </article>;
    })}
  </section>;
}

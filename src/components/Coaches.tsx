import { useState } from 'react';
import type { Player } from '../domain/schema';

const coaches: Record<string, { image: string; club: string; role: string; quote: string; accent: string }> = {
  brayan: {
    image: 'brayan-dt.png',
    club: 'PARIS SAINT-GERMAIN',
    role: 'DIRECTOR TÉCNICO',
    quote: 'Cada partido es una nueva oportunidad de cambiar la historia.',
    accent: 'cyan',
  },
  peter: {
    image: 'peter-dt.png',
    club: 'BORUSSIA DORTMUND (BVB)',
    role: 'DIRECTOR TÉCNICO',
    quote: 'El fútbol se vive con intensidad, pasión y carácter.',
    accent: 'gold',
  },
  axel: {
    image: 'B3B85BF3-4C91-4D6C-93E8-45F8698A8BEF.png',
    club: 'FC BARCELONA',
    role: 'DIRECTOR TÉCNICO',
    quote: 'La intensidad se vive desde la banda hasta el último minuto.',
    accent: 'cyan',
  },
  hermano: {
    image: 'joni-dt.png',
    club: 'MANCHESTER CITY',
    role: 'DIRECTOR TÉCNICO',
    quote: 'Posesión, paciencia y una idea clara de juego.',
    accent: 'sky',
  },
};

function CoachPortrait({ image, name, initials }: { image?: string; name: string; initials: string }) {
  const [failed, setFailed] = useState(false);
  return image && !failed
    ? <img src={`${import.meta.env.BASE_URL}images/coaches/${image}`} alt={`Retrato de ${name} como director técnico`} loading="lazy" decoding="async" onError={() => setFailed(true)} />
    : <div className="coach-fallback" role="img" aria-label={`Fotografía de ${name} pendiente de publicación`}><span>{initials}</span><small>DIRECTOR TÉCNICO</small></div>;
}
export function Coaches({ players }: { players: Player[] }) {
  return (
    <section id="directores-tecnicos" className="coaches-section" aria-labelledby="coaches-title">
      <div className="coaches-heading">
        <span className="eyebrow">LOS CEREBROS DETRÁS DEL PARTIDO</span>
        <h2 id="coaches-title">Nuestros directores técnicos</h2>
        <p>Cuatro estrategas, una rivalidad que sigue creciendo.</p>
      </div>
      <div className="coaches-grid">
        {[...players, { id: 'peter', name: 'Peter Quirino', initials: 'PQ' }, { id: 'axel', name: 'Axel Quirino', initials: 'AQ' }].map((player, index) => {
          const coach = coaches[player.id];
          return (
            <article className={`coach-card coach-card--${coach?.accent ?? 'cyan'}`} key={player.id}>
              <div className="coach-photo">
                <CoachPortrait image={coach?.image} name={player.name} initials={player.initials} />
                <span className="coach-number">DT / {String(index + 1).padStart(2, '0')}</span>
              </div>
              <div className="coach-content">
                <span className="coach-role">{coach?.role ?? 'DIRECTOR TÉCNICO'}</span>
                <h3>{player.name}</h3>
                <div className="coach-club">{coach?.club ?? 'CLUB POR DEFINIR'}</div>
                <p>“{coach?.quote ?? 'La pasión se demuestra en la cancha.'}”</p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

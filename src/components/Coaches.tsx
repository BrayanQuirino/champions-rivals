import { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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
  const trackRef = useRef<HTMLDivElement>(null);
  function move(direction: -1 | 1) {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector<HTMLElement>('.coach-card');
    const gap = Number.parseFloat(getComputedStyle(track).columnGap) || 20;
    const width = card ? card.getBoundingClientRect().width + gap : track.clientWidth * 0.8;
    track.scrollBy({ left: direction * width, behavior: 'smooth' });
  }
  return (
    <section id="directores-tecnicos" className="coaches-section" aria-labelledby="coaches-title">
      <div className="coaches-heading">
        <span className="eyebrow">LOS CEREBROS DETRÁS DEL PARTIDO</span>
        <h2 id="coaches-title">Nuestros directores técnicos</h2>
        <p>Cuatro estrategas, una rivalidad que sigue creciendo.</p>
      </div>
      <div className="coaches-carousel-controls" aria-label="Controles del carrusel de directores técnicos">
        <span className="coaches-carousel-hint">DESLIZA PARA DESCUBRIR A LOS DTs</span>
        <button type="button" className="coaches-carousel-arrow" onClick={() => move(-1)} aria-label="Ver director técnico anterior"><ChevronLeft size={22} /></button>
        <button type="button" className="coaches-carousel-arrow" onClick={() => move(1)} aria-label="Ver director técnico siguiente"><ChevronRight size={22} /></button>
      </div>
      <div className="coaches-grid" ref={trackRef} role="region" aria-roledescription="carrusel" aria-label="Directores técnicos" tabIndex={0}>
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

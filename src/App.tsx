import { Trophy } from 'lucide-react';
import { Brand } from './components/Brand';
import { Dashboard } from './components/Dashboard';
import { useMatches } from './hooks/useMatches';

export default function App() {
  const { data, error, retry } = useMatches();

  return (
    <>
      <a className="skip" href="#main">Ir al contenido</a>
      <header>
        <div className="nav-inner">
          <Brand />
          <nav aria-label="Principal">
            <a href="#inicio">Resumen</a>
            <a href="#clasificacion">Clasificación</a>
            <a href="#directores-tecnicos">DTs</a>
            <a href="#sedes">Sedes</a>
            <a href="#generador">Sorteos</a>
            <a href="#historial">Partidos</a>
          </nav>
        </div>
      </header>
      <main id="main">
        {error ? (
          <div className="loading" role="alert">
            <h1>No pudimos cargar los partidos</h1>
            <p>{error}</p>
            <button onClick={retry}>Reintentar</button>
          </div>
        ) : data ? (
          <Dashboard data={data} />
        ) : (
          <div className="loading" role="status">
            <Trophy />
            <p>Preparando la cancha…</p>
          </div>
        )}
      </main>
    </>
  );
}

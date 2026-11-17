import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App';
import './styles/global.css';

createRoot(document.getElementById('root')!).render(<StrictMode><App/></StrictMode>);

// The same release powers the browser website and the installed PWA.
// A normal visit must detect new deploys without asking for a hard refresh.
if (import.meta.env.PROD) {
  const currentVersion = document.querySelector<HTMLMetaElement>('meta[name="rivals-build"]')?.content;
  let checking = false;

  async function checkRelease() {
    if (!currentVersion || checking || document.visibilityState === 'hidden') return;
    checking = true;
    try {
      const url = new URL(`${import.meta.env.BASE_URL}release.json`, window.location.href);
      url.searchParams.set('_check', String(Date.now()));
      const response = await fetch(url.href, {cache: 'no-store'});
      if (!response.ok) return;
      const published = await response.json() as {version?: string};
      if (published.version && published.version !== currentVersion && published.version !== 'local') {
        const next = new URL(window.location.href);
        // Prevent refresh loops if an edge server temporarily serves old HTML.
        if (next.searchParams.get('_release') !== published.version) {
          next.searchParams.set('_release', published.version);
          window.location.replace(next.href);
        }
      }
    } catch (error) {
      console.warn('No fue posible consultar la versión publicada:', error);
    } finally {
      checking = false;
    }
  }

  window.addEventListener('load', () => {
    void checkRelease();
    if (!('serviceWorker' in navigator)) return;
    void (async () => {
      try {
        const registration = await navigator.serviceWorker.register(
          `${import.meta.env.BASE_URL}sw.js`, {updateViaCache: 'none'}
        );
        let reloading = false;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          if (!reloading) {
            reloading = true;
            window.location.reload();
          }
        });
        await registration.update();
        void checkRelease();
      } catch (error) {
        console.warn('No se pudo actualizar la PWA:', error);
      }
    })();
  });
  window.addEventListener('pageshow', () => {void checkRelease();});
  window.addEventListener('focus', () => {void checkRelease();});
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') void checkRelease();
  });
}

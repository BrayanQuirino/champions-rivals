# RIVALS — The Brothers League

Portal independiente de encuentros virtuales entre hermanos. React + TypeScript + Vite. Frontend estático para GitHub Pages, con JSON versionado como fuente de verdad. Diseño original inspirado en las noches europeas: azul profundo, cian y tipografía condensada; sin afiliación ni representación oficial de ligas, fabricantes o clubes.

## Desarrollo

Node.js 22.12+.

```sh
npm ci
npm run dev
npm run check
npm test
npm run build
npm run preview
```

## Arquitectura

- `src/domain/`: esquema Zod, tipos y funciones puras de clasificación.
- `src/services/`: lectura y validación del JSON en tiempo de ejecución.
- `src/hooks/`: ciclo de carga, cancelación y reintento.
- `src/components/`: presentación encapsulada; sin acceso directo a datos remotos.
- `src/styles/`: diseño adaptable, estados de foco y reducción de movimiento.
- `public/data/matches.json`: único historial real (inicialmente vacío).
- `public/data/demo.json`: datos ficticios, activados solo con «Ver demo».
- `scripts/`: validación previa a construcción.
- `tests/`: reglas de negocio y consistencia de datos.

## Fotos → JSON → página

1. Comparte las fotos con Chappy en el chat, indicando quién controla cada equipo, la fecha y temporada.
2. Chappy extrae exclusivamente datos legibles. Los datos no visibles quedan en `null`; si el marcador o identidad es ambiguo, se confirma antes de registrar.
3. Agrega el partido a `public/data/matches.json`, con un ID único estable. Conserva los partidos anteriores y evita duplicados. Para corregir, modifica el mismo ID.
4. Ejecuta `npm run check` y `npm test`. Haz commit en `main`; Actions valida, construye y publica.

La página no incluye OCR ni escribe directamente en GitHub. No requiere tokens en el navegador ni un servidor propio. «Descargar historial» exporta el archivo activo, no lo modifica. Las fotos no se publican automáticamente. La referencia de origen es texto descriptivo, nunca una URL privada ni credenciales.

## Datos y reglas

Dos jugadores configurables en `players`; el segundo aparece como «Hermano» hasta conocer su nombre. Marcador incluye tiempo extra si lo hubo; tanda de penales va aparte. Victoria: 3 puntos (incluidos penales), empate: 1. Desempates por diferencia de goles y goles a favor. Si todo coincide, se conserva orden de jugadores. La forma muestra hasta cinco partidos, del más antiguo al más reciente. Para partidos del mismo día se ordena por ID, por lo que utiliza IDs de ancho fijo secuenciales (ejemplo `2026-11-10-001`). El selector de temporada afecta todas las estadísticas; búsqueda y filtro de resultado afectan solo el historial.

El esquema ejecutable está en `src/domain/schema.ts`. No añadas estadísticas que no figuren en la captura. `date` usa YYYY-MM-DD; `source.type` admite photo/manual/demo. `penalties` y `stats` pueden ser null. Las estadísticas individuales también admiten null.

## GitHub Pages

1. Crea el repositorio `champions-rivals` en tu cuenta. Para usar Pages sin un plan de pago, créalo público.
2. Sube este proyecto (sin `node_modules` ni `dist`) a `main`.
3. En **Settings → Pages → Build and deployment → Source**, selecciona **GitHub Actions**.
4. Ejecuta **Actions → Validate and deploy Pages → Run workflow**, si fuera necesario.

El workflow publica solo desde `main` después de validar tipos, JSON, pruebas y build. Las PR ejecutan verificaciones sin publicar. `base: './'` permite servir recursos bajo la subruta del repositorio. Fuente: https://vite.dev/guide/static-deploy#github-pages

## Alcance de la primera versión

Resumen, clasificación, historial, búsqueda, filtros de temporada y resultado, comparación directa, detalles de estadísticas y exportación JSON. Estado vacío real y demo aislada. No hay autenticación ni backend; el historial publicado es visible a los visitantes. La tipografía carga desde Google Fonts con fuentes locales de respaldo.

## Ramas

- `develop_brayan`: desarrollo habitual; cambios y actualizaciones de resultados.
- `test`: versiones estables para comprobar antes de publicar.
- `main`: versión estable ejecutable publicada en GitHub Pages.

Flujo: develop_brayan → test → main. Las tres ramas ejecutan verificaciones; solo main despliega. La publicación inicial está autorizada por el propietario. No crear ramas adicionales sin necesidad.

## Generador de enfrentamientos (v1)

El sorteo de `#generador` es **independiente del historial**, no escribe ningún resultado ni requiere servidor. El catálogo vive en `public/data/club-catalog.json` y contiene ligas, ID estable, club, nivel entero de 1–5 estrellas, Elo y enlace al escudo. El generador cruza equipos de **idéntico número de estrellas** y muestra Rival 1 / Rival 2 sin asignar jugadores. Permite filtrar liga o estrellas y cambiar los lados.

Cobertura: **419 clubes de 23 ligas** (incluidas Liga MX, MLS, Brasil y las principales de Europa). No equivale a todas las ligas del planeta ni al catálogo de una edición específica de un videojuego. Se combinan datos de https://github.com/Hicruben/theopenmodel y https://github.com/oritzio/football-database . Fuente de clubes, Elo y URLs de escudos: https://github.com/Hicruben/theopenmodel/blob/main/data/leagues-2026.json . Las estrellas son una estimación editorial no oficial, con esta tabla: 5 ≥1950 Elo, 4 ≥1825, 3 ≥1690, 2 ≥1550, 1 <1550. Para los otros 323 clubes las estrellas son una clasificación editorial provisional a nivel de liga y de algunos clubes destacados. No representan puntuaciones de un videojuego.

Los campos `logoUrl` y `logoFallbackUrl` usan HTTPS hacia archivos verificados por nombre y ruta de repositorios públicos (incluidos JoseArroyave/football-logos y leoratzlaff/football-badges) o al proveedor original. Los 419 clubes tienen ahora un enlace directo a un archivo de escudo presente en los repositorios de referencia o al proveedor inicial; 138 incluyen además `logoFallbackUrl` para un segundo intento si la primera URL falla. Las 25 selecciones usan banderas. La disponibilidad de los proveedores externos puede variar. Su disponibilidad y derechos de reutilización deben verificarse antes de cualquier explotación comercial; los nombres y escudos siguen perteneciendo a sus titulares. En errores de imagen se muestra un marcador genérico. No hay afiliación oficial con clubes, competiciones ni desarrolladores de videojuegos.

**Ampliación:** adjuntar nuevas ligas al array `leagues` y nuevos equipos al array `clubs`; IDs únicos, ligas válidas y estrellas 1–5. Mantener fuente y fecha actualizadas. La vista se actualizará al desplegar el JSON, sin cambiar React.

## Ligas destacadas y selecciones internacionales

**Liga MX** figura al principio del selector y tiene 18 equipos del catálogo existente. El filtro **Internacional · Selecciones** incluye 25 selecciones nacionales de una fuente histórica (no una lista completa del juego), cada una con un nivel estimado entre 1 y 5 estrellas. Los niveles internacionales no son oficiales ni clasificación actual; muestran un emoji de bandera si no hay escudo con URL verificada.

El sorteo muestra **Rival 1** y **Rival 2**, sin asociar la propuesta a ninguno de los jugadores. Winterfell Arena muestra el PNG original en su proporción panorámica, evitando la miniatura de reserva y el recorte forzado.

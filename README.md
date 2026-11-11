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

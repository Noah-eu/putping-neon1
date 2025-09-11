# PutPing MVP (Vite + React)

Neon social‑discovery MVP s Mapbox GL + Firebase.

## Spuštění
- npm i
- npm run dev

## ENV (frontend: `.env.local`, server: `.env.server`)
Frontend (Vite) proměnné v `.env.local`:
- VITE_API_KEY
- VITE_AUTH_DOMAIN
- VITE_DATABASE_URL
- VITE_PROJECT_ID
- VITE_STORAGE_BUCKET
- VITE_MESSAGING_SENDER_ID
- VITE_APP_ID
- VITE_MEASUREMENT_ID
- VITE_MAPBOX_TOKEN
Server‑only proměnné v `.env.server` (nepublikovat do klienta):
- OPENAI_API_KEY
### Firebase & Auth
- Aplikace po startu inicializuje Firebase a automaticky provede anonymní přihlášení (není nutný žádný uživatelský krok).
- Po přihlášení zapíše/aktualizuje záznam `users/{uid}` a udržuje `onlineAt`.
- Mapa funguje i bez ručního přihlášení; „Ping“ zapisuje do `pings/{toUid}/{myUid}`.

OpenAI klíč se načítá pouze na serveru z `.env.server` (nikdy z `import.meta.env`).

## Firebase rules
Najdeš v `src/firebase/rules.json`. Nasazení:
- npm i -g firebase-tools
- firebase login
- firebase init (Realtime Database)
- firebase deploy --only database

## Netlify
- Build: `npm run build`
- Publish: `dist/`

# Déploiement « Le nid de Ryuu » sur VPS

## Contenu du ZIP
- `web/` : le site complet (accueil, Studio, Copilote, Prompts + assets)
- `backend/` : API Node/Fastify (santé, IA Gemini, proxy Twitch, cron hebdo Discord)
- `bot/` : bot Discord (message de démarrage, !planning, !titre, !bio, notif de live)
- `caddy/Caddyfile` : HTTPS automatique + reverse proxy /api
- `docker-compose.yml` : 3 services (caddy, backend, bot)
- `.env.example` : variables à remplir

## Déploiement
1. Dézippe dans `/opt/ryuu`.
2. Copie `.env.example` vers `.env` et remplis chaque variable (domaine, clé Gemini, Client ID Twitch, token OAuth, token bot Discord, ID du salon).
3. Ouvre le pare-feu : `ufw allow 80/tcp && ufw allow 443/tcp && ufw enable`.
4. Pointe ton domaine vers l'IP du VPS (enregistrement A chez ton registrar).
5. `docker compose up -d --build`.

## Vérification
- `curl https://<domaine>/api/health` → `{ "ok": true }`
- Le site se charge sur `https://<domaine>`.
- `docker compose logs --tail=50` sans erreur.
- Le bot Discord écrit « Le nid de Ryuu est en ligne 🐉 » dans le salon choisi.

Secrets uniquement dans `.env` — jamais dans le code ni dans le navigateur.

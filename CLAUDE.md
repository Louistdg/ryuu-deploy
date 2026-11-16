# CLAUDE.md — Contexte projet « Le nid de Ryuu »

## Ce que c'est
Kit de déploiement pour la streameuse eurasia_ryuu : site statique (accueil, Studio, Copilote, prompts), backend Node/Fastify (API IA Gemini + proxy Twitch + cron Discord), bot Discord, et Caddy avec HTTPS automatique. Cible : VPS Hostinger (Ubuntu + Docker) sur le domaine `ryuu.socle-construction.be`.

## Structure du dépôt
- `web/` : site statique complet (accueil `index.html`, `studio.html`, `copilote.html`, `prompts.html`, assets `art/`, `avatar/`, `emotes/`, `video/`, `tuto/`).
- `backend/` : `server.js` (Fastify) + `package.json` + `Dockerfile`. Endpoints : `/api/health`, `/api/ai/chat`, `/api/twitch/user|schedule|videos|title`.
- `bot/` : `server.js` (discord.js v14) + `package.json` + `Dockerfile`. Message de démarrage, `!planning`, `!titre`, `!bio`, polling live.
- `caddy/Caddyfile` : domaine en racine + reverse_proxy `/api/*` → `backend:3000`.
- `docker-compose.yml` : services `caddy`, `backend`, `bot`.
- `.env.example` : secrets à remplir (DOMAIN, GEMINI_API_KEY, TWITCH_CLIENT_ID, TWITCH_TOKEN, DISCORD_BOT_TOKEN, DISCORD_CHANNEL_ID).
- `fetch-assets.sh` : récupère les images/emotes/vidéo depuis https://2pepites.kimi.page/dl/ryuu-deploy.zip .

## Conventions
- Secrets UNIQUEMENT dans `.env`, jamais dans le code ni dans le navigateur.
- Tout en Docker + Docker Compose, rien d'installé sur l'hôte.
- Travail uniquement dans `/opt/ryuu` sur le serveur. Pare-feu : seuls 80/443 ouverts en plus du 22.

## Commandes
- Déployer : `docker compose up -d --build`.
- Santé : `curl https://<domaine>/api/health` → `{ ok: true }`.
- Logs : `docker compose logs --tail=50`.
- Récupérer les assets : `bash fetch-assets.sh`.

## Comment modifier
- Changer le texte ou les couleurs : éditer les fichiers HTML dans `web/` et les templates du Studio dans `web/studio.html`.
- Ajouter une route API : éditer `backend/server.js` (style Fastify, endpoints JSON).
- Ajouter une commande Discord : éditer `bot/server.js` (handler `messageCreate`).
- Ne jamais casser le build : valider avec `docker compose build` avant de pousser.

## Publication des changements
1. Modifier le code et committer sur `main`.
2. Le déploiement se fait via le VPS : `cd /opt/ryuu && git pull && docker compose up -d --build`.
3. Vérifier `/api/health` et le site en HTTPS.

## Ce qui reste à faire
- Remplir `.env` avec les vraies valeurs (domaine, clé Gemini, Client ID Twitch, token OAuth, token bot Discord, ID du salon).
- Vérifier que le bot Discord poste bien le message de démarrage.
- Tests de bout en bout : `/api/health`, `/api/ai/chat`, `/api/twitch/user`.

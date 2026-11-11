# WISECOM — site web

Application Next.js du projet WISECOM Global Trading and Supplies. Le site utilise
l'API du dossier `server` pour les comptes, le catalogue, les commandes, les paiements
et l'administration.

## Développement local

```bash
cp .env.local.example .env.local
npm install
npm run dev
```

Le site sera disponible sur [http://localhost:3000](http://localhost:3000).
Vérifiez que l'API tourne aussi sur `http://localhost:4000`.

## Déploiement gratuit sur Render

Ce dépôt comprend un Blueprint `render.yaml`. Dans Render, choisissez **New → Blueprint**
et sélectionnez `wisecom_web`. Le service doit être un Web Service Node.js, pas un site
statique :

- Build : `npm ci --include=dev && npm run build`
- Start : `npm run start`
- Dossier de publication : aucun

Définissez `NEXT_PUBLIC_API_URL` dans l'environnement du service à l'URL publique de
l'API Render, sans suffixe `/api` (par exemple `https://wisecom-api.onrender.com`), puis
redéployez le site. L'API doit autoriser l'URL Render du site via sa variable `CLIENT_ORIGIN`.
Les services gratuits peuvent s'endormir après une période d'inactivité.

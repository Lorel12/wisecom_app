# WISECOM Global Trading and Supplies — Site e-commerce & vitrine

Application e-commerce (web, prête pour PWA mobile) pour WISECOM Global Trading and Supplies :
vente d'ordinateurs, téléphones, accessoires et appareils électroménagers neufs ou d'occasion,
import-export, services techniques, et motos & véhicules. Siège à Douala, agence à Yaoundé.

## Structure du projet

```
App/
  web/     Frontend Next.js (App Router, TypeScript, Tailwind CSS v4)
  server/  API backend Express + Prisma (SQLite en local, PostgreSQL sur Render)
  site/    Scaffold Vite par défaut, non utilisé — peut être supprimé
```

## Fonctionnalités

- Catalogue produits avec filtres (catégorie, état neuf/occasion, tri, recherche), fiches produits, avis clients
- Panier persistant, tunnel de commande, paiement **Orange Money** et **MTN Mobile Money**
- Comptes clients : inscription/connexion, profil, adresses, historique de commandes, favoris
- Back-office admin : gestion des produits (CRUD), des commandes, et des administrateurs
  (un `SUPERADMIN` peut nommer ou révoquer des `ADMIN`)
- Multilingue français / anglais (next-intl), thème clair/sombre (design tokens dans `web/src/app/index.css`)
- PWA : installable sur mobile, manifest + service worker

## Démarrage rapide

### 1. Backend (`server/`)

```bash
cd server
cp .env.example .env      # renseigner DATABASE_URL (PostgreSQL) et les secrets
npm install
npm run prisma:migrate    # crée les tables
npm run seed               # crée le super-admin, les catégories et 2 produits d'exemple
npm run dev                 # démarre l'API sur http://localhost:4000
```

Identifiants du super-admin créés par le seed : voir `SUPERADMIN_EMAIL` / `SUPERADMIN_PASSWORD` dans `.env`.

Gardez le serveur API lancé dans un terminal pendant que vous utilisez le site : l'inscription,
la connexion et les formulaires en dépendent.

### Envoi des messages de contact

Les messages du formulaire sont envoyés à `CONTACT_EMAIL` (par défaut `lorelngoumi@gmail.com`).
Pour activer l'envoi automatique, configurez `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`,
`SMTP_PASSWORD` et `MAIL_FROM` dans `server/.env` avec les paramètres de votre fournisseur
SMTP, puis redémarrez l'API. `MAIL_FROM` doit être une adresse autorisée par ce fournisseur.
Sans configuration SMTP, le site n'indique pas que le message a été envoyé et propose
un lien pour l'envoyer depuis l'application e-mail du visiteur.

Pour Gmail, activez la validation en deux étapes sur le compte expéditeur, puis créez un
mot de passe d'application dans les paramètres de sécurité Google. Renseignez ensuite
`SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=465`, `SMTP_USER` (adresse Gmail expéditrice),
`SMTP_PASSWORD` (mot de passe d'application, et non le mot de passe habituel du compte)
et `MAIL_FROM` avec cette même adresse. Gardez ce mot de passe uniquement dans `server/.env`
ou dans les variables secrètes de l'hébergeur, jamais dans le code ni dans Git. `CONTACT_EMAIL`
reste l'adresse qui reçoit les messages.

### 2. Frontend (`web/`)

```bash
cd web
cp .env.local.example .env.local   # NEXT_PUBLIC_API_URL doit pointer vers l'API (http://localhost:4000)
npm install
npm run dev                          # démarre le site sur http://localhost:3000
```

## Déploiement sur Render

Le dépôt complet contient un [Blueprint Render](./render.yaml) pour l'API et PostgreSQL.
Importez le dépôt `wisecom_app` comme Blueprint ; il définit le dossier racine de l'API,
la commande de build, les migrations PostgreSQL, le contrôle `/health` et le disque des images.
Configurez ensuite `CLIENT_ORIGIN` avec l'URL publique du site, par exemple
`https://wisecom-web.onrender.com`.

Le dépôt séparé `wisecom_web` contient son propre [Blueprint](./web/render.yaml).
Déployez-le en service Web Node.js (pas en site statique), puis définissez
`NEXT_PUBLIC_API_URL` sur l'URL publique de l'API, sans suffixe `/api`, par exemple
`https://wisecom-api.onrender.com`. Cette variable est intégrée pendant le build du site ;
redéployez après l'avoir modifiée. `CLIENT_ORIGIN` doit contenir l'URL publique du site web ;
`NEXT_PUBLIC_API_URL` doit contenir celle de l'API.

La base Render est neuve et distincte de `server/prisma/dev.db` : les données et comptes SQLite
locaux ne sont pas copiés automatiquement. Après le premier déploiement, configurez
`SUPERADMIN_EMAIL` et un mot de passe fort `SUPERADMIN_PASSWORD` dans l'environnement du service
API, puis exécutez une fois `npm run seed` depuis le Shell Render de ce service pour créer le
compte administrateur, les catégories et les produits d'exemple. Le disque persistant du service
API conserve les images téléversées.

## Paiement mobile (Orange Money / MTN MoMo)

Tant que les identifiants marchands (`ORANGE_MONEY_*`, `MOMO_*` dans `server/.env`) ne sont pas renseignés,
les paiements fonctionnent en **mode simulation** (voir `server/src/lib/payments/`) afin de pouvoir tester
tout le tunnel d'achat de bout en bout. Les intégrations réelles sont documentées en commentaire dans :

- `server/src/lib/payments/orangeMoney.ts`
- `server/src/lib/payments/momo.ts`

## Personnalisation visuelle

Toutes les couleurs, rayons de bordure et ombres sont centralisés dans `web/src/app/index.css`
(design tokens, mode clair + sombre). Le logo de la boutique pourra être ajouté dans
`web/public/` et référencé dans la barre de navigation (`web/src/components/layout/Navbar.tsx`)
et le manifest PWA (`web/src/app/manifest.ts`).

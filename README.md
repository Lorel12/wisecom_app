# WISECOM Global Trading and Supplies — Site e-commerce & vitrine

Application e-commerce (web, prête pour PWA mobile) pour WISECOM Global Trading and Supplies :
vente d'ordinateurs, téléphones, accessoires et appareils électroménagers neufs ou d'occasion,
import-export, services techniques, et motos & véhicules. Siège à Douala, agence à Yaoundé.

## Structure du projet

```
App/
  web/     Frontend Next.js (App Router, TypeScript, Tailwind CSS v4)
  server/  API backend Express + Prisma + PostgreSQL
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

### 2. Frontend (`web/`)

```bash
cd web
cp .env.local.example .env.local   # NEXT_PUBLIC_API_URL doit pointer vers l'API (http://localhost:4000)
npm install
npm run dev                          # démarre le site sur http://localhost:3001
```

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

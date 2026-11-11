# WISECOM Global Trading and Supplies — Site e-commerce & vitrine

Application e-commerce (web, prête pour PWA mobile) pour WISECOM Global Trading and Supplies :
vente d'ordinateurs, téléphones, accessoires et appareils électroménagers neufs ou d'occasion,
import-export, services techniques, et motos & véhicules. Siège à Douala, agence à Yaoundé.

## Structure du projet

```
App/
  web/     Frontend Next.js (App Router, TypeScript, Tailwind CSS v4)
  server/  API backend Express + Prisma (SQLite en local, PostgreSQL en production)
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

Le dépôt complet contient un [Blueprint Render](./render.yaml) pour une API Node gratuite.
Importez le dépôt `wisecom_app` comme Blueprint. Le service utilise un projet PostgreSQL Supabase
gratuit et exécute ses migrations ainsi que le seed au démarrage. Utilisez l'URL de pooler de
session Supabase pour `DATABASE_URL` et `DIRECT_URL`, avec le mot de passe de base de données
fourni par Supabase. Sur Render Free, l'API s'endort après une période d'inactivité et son
système de fichiers est éphémère.

Le dépôt séparé `wisecom_web` contient son propre [Blueprint](./web/render.yaml).
Déployez-le en service Web Node.js (pas en site statique), puis définissez
`NEXT_PUBLIC_API_URL` sur l'URL publique de l'API, sans suffixe `/api`, par exemple
`https://wisecom-api.onrender.com`. Cette variable est intégrée pendant le build du site ;
redéployez après l'avoir modifiée. `CLIENT_ORIGIN` doit contenir l'URL publique du site web ;
`NEXT_PUBLIC_API_URL` doit contenir celle de l'API.

Créez un projet Supabase gratuit, copiez son URL et sa clé `service_role`, et créez un bucket
Storage public nommé `product-images`. Renseignez ensuite `DATABASE_URL` et `DIRECT_URL`
(tous deux avec l'URL de pooler **session** Supabase), `SUPABASE_URL` et
`SUPABASE_SERVICE_ROLE_KEY` dans Render. Ne publiez jamais la clé `service_role`. Les migrations
sont appliquées automatiquement au démarrage ; définissez aussi
`SUPERADMIN_EMAIL` et un mot de passe fort `SUPERADMIN_PASSWORD` pour créer le compte admin.
Supabase Free peut mettre en pause les projets inactifs ; les fichiers SQLite locaux ne sont
pas transférés.

Les services Render Free s'endorment après inactivité : la première visite peut être lente.
Ils n'ont pas de disque persistant, les images sont donc stockées dans Supabase Storage.
Pour l'envoi d'e-mails, configurez un compte Resend gratuit et vérifiez un domaine expéditeur,
puis renseignez `RESEND_API_KEY` et `MAIL_FROM` dans Render. Sans domaine vérifié, l'envoi
d'e-mails aux clients ne sera pas disponible ; le formulaire Contact propose toujours son lien
e-mail direct.

## Paiement mobile (Orange Money / MTN MoMo)

Le paiement simulé est réservé au développement local. En production, une méthode sans identifiants
marchands configurés renvoie une erreur et ne peut pas marquer une commande comme payée.

Pour activer les paiements réels :

1. Déployez d'abord le service API `wisecom-api` depuis le Blueprint Render du dépôt complet, avec
   PostgreSQL opérationnel et `CLIENT_ORIGIN` réglé sur l'URL publique du site.
2. Ouvrez un compte marchand et demandez l'accès aux API de paiement pour le Cameroun auprès des
   fournisseurs concernés. Un compte développeur seul ne garantit pas l'activation d'un compte marchand
   ni l'autorisation d'encaisser des transactions réelles.
3. Pour Orange Money Web Payment, configurez `ORANGE_MONEY_CLIENT_ID`,
   `ORANGE_MONEY_CLIENT_SECRET` et `ORANGE_MONEY_MERCHANT_KEY`. L'URL de base par défaut est
   `https://api.orange.com`; utilisez celle communiquée pour votre compte/environnement.
4. Pour MTN MoMo Collection, configurez `MOMO_SUBSCRIPTION_KEY`, `MOMO_API_USER` et `MOMO_API_KEY`.
   Commencez avec `MOMO_TARGET_ENVIRONMENT=sandbox` et l'URL de sandbox par défaut
   `https://sandbox.momodeveloper.mtn.com`. Ne passez à l'environnement de production qu'avec les
   identifiants et l'URL de production fournis après activation par MTN.
5. Saisissez ces valeurs dans **Render → service API → Environment**, jamais dans le dépôt Git,
   le service web ou une variable `NEXT_PUBLIC_*`, puis redéployez l'API.
6. Testez une commande complète avec les outils/numéros de test du fournisseur. Vérifiez que le
   fournisseur confirme réellement le paiement et que la commande ne passe à `PAID` qu'après
   cette vérification. N'effectuez pas de transaction réelle avant d'avoir validé le montant, la devise
   XAF, les URLs de retour/notification et la procédure de remboursement avec le fournisseur.

Les valeurs sandbox ne permettent pas d'encaisser de vrais paiements. Les notifications et les
confirmations doivent être testées avec la documentation et les identifiants fournis au compte
marchand avant d'ouvrir le paiement aux clients.

## Personnalisation visuelle

Toutes les couleurs, rayons de bordure et ombres sont centralisés dans `web/src/app/index.css`
(design tokens, mode clair + sombre). Le logo de la boutique pourra être ajouté dans
`web/public/` et référencé dans la barre de navigation (`web/src/components/layout/Navbar.tsx`)
et le manifest PWA (`web/src/app/manifest.ts`).

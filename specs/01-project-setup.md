# 01 — Scaffold, dépendances et déploiement

## Objectif

Partir d'un dépôt vide et arriver à une application déployée et accessible depuis un téléphone. **À faire en premier** : un squelette déployé de bout en bout vaut mieux qu'une app riche qui ne tourne qu'en local.

## Initialisation

Scaffold Vite React + TypeScript, gestionnaire de paquets **yarn**.

Dépendances runtime : `react`, `react-dom`, `react-router-dom`, `firebase`, `qrcode.react`.
Dépendances dev : `typescript`, `vite`, `@vitejs/plugin-react`, `eslint` + config TypeScript/React, `vitest`, `@testing-library/react`, `jsdom`.

TypeScript en mode strict. ESLint doit passer sans warning sur le code livré.

## Configuration Vite

- `base` doit correspondre au chemin de publication GitHub Pages (`/<nom-du-repo>/`). Une `base` erronée casse le chargement des assets **et** les URLs encodées dans les QR codes — vérifier ce point avant d'imprimer quoi que ce soit.
- Les fichiers de contenu JSON (`src/assets/`) sont importés en dur dans le bundle, pas chargés à l'exécution : ils font partie du build.

## Routing

`createHashRouter` de react-router-dom. Les URLs contiennent donc un `#` (`https://.../#/ghost/ab12cd`). C'est volontaire : GitHub Pages ne sait pas réécrire les URLs côté serveur, et un QR code menant à un 404 le soir de l'événement est irréparable.

Routes (détail dans les specs correspondantes) : `/`, `/regles`, `/ghost/:id`, `/quiz/:id`, `/joker/:id`, `/leaderboard`, `/allCodes`.

## Firebase

Un projet Firebase dédié à cette édition. Deux services seulement :

- **Firestore** : une seule collection, `Users` (voir `03`).
- **Analytics** : facultatif. `getAnalytics()` échoue dans certains contextes (bloqueurs de pub, Safari privé, absence de support) — l'initialiser dans un `try/catch`, ne jamais le mettre sur le chemin critique, et faire que toute fonction de log soit sans effet s'il est indisponible. Un bloqueur de pub ne doit jamais empêcher un joueur de marquer des points.

Initialiser Firebase **une seule fois au niveau module** (singleton exporté), pas à chaque rendu de composant.

La configuration Firebase (clés publiques) est committée en clair, comme n'importe quelle app web Firebase — ces clés ne sont pas des secrets. La sécurité repose sur les règles Firestore.

### Règles de sécurité Firestore — à écrire explicitement

Les règles par défaut en mode test **expirent au bout de 30 jours**. Le jeu durant un mois, l'expiration tomberait **pendant la partie** : panne totale, du jour au lendemain, sans rien avoir déployé. Ce n'est pas un risque, c'est une certitude si on laisse les règles par défaut. Écrire des règles explicites, versionnées dans le dépôt (`firestore.rules`), autorisant :

- lecture de toute la collection `Users` (le classement en a besoin) ;
- création et mise à jour d'un document `Users/{id}` sans authentification ;
- **aucune suppression**.

Documenter dans le README la façon de les déployer et vérifier l'absence de date d'expiration avant le lancement (`17`).

### Quotas

Le palier gratuit Firestore plafonne à 50 000 lectures par jour. Le classement en temps réel consomme une lecture par document modifié et par abonné : quelques dizaines de joueurs sur un mois restent très en dessous, à condition de ne pas laisser des abonnements ouverts indéfiniment sur des onglets oubliés (voir `13`). Surveiller la consommation la première semaine.

## Déploiement

GitHub Actions sur push vers `main` : install → `yarn build` → publication du dossier `dist` sur GitHub Pages. Concurrence limitée à un déploiement à la fois.

## Definition of done

- Un push sur `main` met le site à jour, vérifié depuis un téléphone sur le réseau mobile (pas seulement en local).
- Une route inconnue ne casse pas l'app (élément d'erreur qui renvoie vers l'accueil).
- `firestore.rules` est dans le dépôt et déployé.
- Le README explique : lancer en local, déployer, éditer le contenu, imprimer les QR codes.

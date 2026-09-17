# Chasse aux fantômes — édition 2026

## Ce que c'est

Jeu de piste Halloween joué par les soignants d'un service de maternité, sur leur téléphone. Des fantômes en papier portant un QR code sont cachés dans le service ; les scanner rapporte (ou fait perdre) des points ; un classement en direct entretient l'émulation.

4e édition annuelle. **Le jeu tourne pendant un mois**, pas sur une soirée : les fantômes restent en place, les joueurs vont et viennent, et l'application peut être corrigée en cours de partie — mais jamais au prix d'une incompatibilité avec les données déjà écrites.

Les trois éditions précédentes existent, mais **ce dépôt est vierge** : tout est à construire de zéro. Aucun code des éditions précédentes n'est disponible ni à réutiliser — les specs décrivent tout ce qui est nécessaire.

Lire `specs/00-overview.md` en premier : il contient les décisions produit et les arbitrages déjà tranchés.

## Stack imposée

- **Vite + React 19 + TypeScript** (strict)
- **react-router-dom v7**, `createHashRouter` — le hash routing est obligatoire, l'hébergement statique ne sait pas router côté serveur
- **Firebase** : Firestore pour l'état de jeu, Analytics en option non bloquante
- **`qrcode.react`** pour générer les QR codes à imprimer
- **Yarn**
- **Vitest + Testing Library** pour les tests (voir `specs/16-testing-strategy.md`)
- Déploiement **GitHub Pages** via GitHub Actions (voir `specs/01-project-setup.md`)

Pas de backend, pas de Cloud Functions, pas de SSR. Le client parle directement à Firestore.

## Contraintes non négociables

- **100% statique.** `yarn build` produit un dossier servi tel quel.
- **Mobile-first, et uniquement mobile.** Le jeu se joue debout, à une main, sur un téléphone, avec un wifi hospitalier moyen. Tout écran doit être utilisable en portrait à 375px de large sans scroll horizontal.
- **Aucun son.** Jamais d'`Audio` ni d'`AudioContext`, y compris dans les mini-jeux. Contrainte hospitalière, pas une préférence.
- **Tout en français**, ton familier et joueur ("Bouh !", "Bouhouhou !", tutoiement systématique).
- **Aucune liste de joueurs connue à l'avance.** Le service tourne avec des remplaçants : impossible de pré-créer des comptes ou de distribuer quoi que ce soit de nominatif avant le jour J.
- **Robustesse réseau > élégance.** Une écriture Firestore ratée qui passe inaperçue, c'est un joueur qui perd ses points et râle. Voir `specs/05-scoring-and-persistence.md`.

## Ordre de lecture des specs

| Spec | Sujet |
|---|---|
| `00-overview` | Décisions produit, règles du jeu, risques acceptés |
| `01-project-setup` | Scaffold, dépendances, Firebase, déploiement |
| `02-app-shell-and-design-system` | Layout, composants partagés, identité visuelle |
| `03-data-model-and-content` | Fichiers de contenu, ids courts, document Firestore |
| `04-identity-and-onboarding` | Prénom, code à 4 chiffres, porte d'entrée |
| `05-scoring-and-persistence` | Barème, écritures atomiques, gestion d'erreur |
| `06-basic-ghost` / `07-quiz-ghost` / `08-joker-ghost` | Les 3 écrans de scan |
| `09` → `12` | Les 4 mini-jeux (Snake, Tetris, Sudoku, Wordle) |
| `13-leaderboard` | Classement temps réel |
| `14-home-and-rules` | Accueil et page de règles |
| `15-qr-generation-and-printing` | Page d'impression des 130 QR codes |
| `16-testing-strategy` | Ce qui est testé et comment |
| `17-operations-runbook` | Checklist avant / pendant / après la soirée |
| `18-admin` | Page organisateur : retrouver le code d'un joueur |

Deux conventions transverses, à respecter dans tout le code :

- `skills/firestore-access-conventions.md` — comment on lit et écrit dans Firestore (règle d'or : jamais de `setDoc` complet)
- `skills/minigame-conventions.md` — contrat commun aux 4 mini-jeux

## Ordre de développement conseillé

1. `01` scaffold + déploiement qui marche de bout en bout (une page blanche déployée vaut mieux qu'une app locale parfaite)
2. `03` + `04` + `05` : le socle (contenu, identité, écritures)
3. `06` fantôme basique, puis `13` classement → à ce stade le jeu est déjà jouable
4. `07` fantôme quiz
5. `08` framework joker + `09` Snake, puis les 3 autres mini-jeux
6. `14`, `15`, `16`, puis `17` avant l'événement

## Definition of done générale

- `yarn build` et `yarn lint` passent, TypeScript strict, aucun `any`.
- `yarn test` passe (voir `16`).
- Chaque écran vérifié à 375px de large.
- Chaque action de score vérifiée deux fois de suite (idempotence) et avec le réseau coupé (gestion d'erreur).

## Ce qu'il ne faut pas faire

- Ne pas inventer de mécanique de jeu non spécifiée : le barème et les règles sont le fruit d'arbitrages, pas des valeurs par défaut.
- Ne pas ajouter d'authentification réelle par-dessus le code à 4 chiffres (Firebase Auth, PWA, WebAuthn, mot de passe) : le code est une clé de récupération assumée comme non secrète, pas un dispositif de sécurité. Voir `04`.
- Ne pas générer le contenu final (les 130 fantômes) sans validation de Guillaume : les QR codes seront imprimés et collés physiquement, une regénération après impression rend le jeu inutilisable.

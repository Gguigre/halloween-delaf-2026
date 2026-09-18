# Chasse aux fantômes — édition 2026

Jeu de piste Halloween joué sur téléphone par les soignants du service de maternité.
Des fantômes en papier portant un QR code sont cachés dans le service ; les scanner
rapporte (ou fait perdre) des points ; un classement en direct entretient l'émulation.

Le jeu reste ouvert **pendant un mois**. Les specs sont dans [`specs/`](specs/),
les conventions transverses dans [`skills/`](skills/).

## Le jeu en deux minutes

Trois types de fantômes, dont deux font courir un vrai risque — c'est ce qui permet
à un joueur en retard de remonter, et à un joueur en tête de redescendre :

| Type | Ce que fait le scan | Points |
|---|---|---|
| Basique (100) | rien, le scan suffit | **+10**, sans risque |
| Quiz (20) | une énigme, un seul essai | **+20** ou **−10** |
| Joker (10) | un mini-jeu chronométré, un seul essai | **+50** ou **−30** |

Un score peut être négatif : c'est assumé, il ne faut pas le plafonner à 0.

Le score n'est **jamais stocké** : il se recalcule à partir des listes du document
joueur, ce qui évite toute dérive entre un score enregistré et l'état réel.

L'identité est un prénom plus un code à 4 chiffres choisi par le joueur, qui forment
la clé du document Firestore (`julie-4271`). Le code n'est pas un secret : c'est une
clé de récupération, affichée en clair dans le jeu pour qu'elle se mémorise.

## Architecture

- `src/game/` — la logique pure, testable sans rendu : barème, comparaison des
  réponses, dérivation de l'identité, classement, contenu.
- `src/minigames/` — les quatre mini-jeux, chacun avec sa logique séparée de son
  rendu (`logic.ts` + composant). Un mini-jeu ne sait rien du score ni du joueur :
  il rend `{ won }` une seule fois.
- `src/firebase/` — le seul endroit qui parle à Firestore.
- `src/player/` — session, onboarding, porte d'entrée devant les routes de scan.
- `src/pages/`, `src/components/` — les écrans et la coquille partagée.

Deux règles structurantes, détaillées dans [`skills/`](skills/) :

- **Jamais de `setDoc` sur un document existant.** Un écran de mini-jeu garde l'état
  du joueur en mémoire pendant deux à trois minutes ; réécrire le document entier
  effacerait ce qui a été gagné ailleurs entretemps. Seule la création y a droit.
- **Aucun son**, nulle part, y compris dans les mini-jeux. Contrainte hospitalière.

## Lancer en local

```bash
yarn install
yarn dev
```

Node 24 (voir `.node-version`, `fnm use` s'en charge si tu utilises fnm).

Autres commandes :

```bash
yarn build   # compile TypeScript + produit dist/
yarn lint    # ESLint
yarn test    # Vitest
```

## Tests

`yarn test` couvre la logique là où une erreur est à la fois probable et
irréversible — les données de jeu déjà écrites ne se rattrapent pas :

- le **calcul du score** : les cinq termes du barème, le score négatif, et la
  déduplication défensive par identifiant (`arrayUnion` ne déduplique pas des
  tentatives horodatées, une double écriture compterait double) ;
- la **comparaison des réponses** aux énigmes : casse, accents, ponctuation,
  article devant la réponse, variantes déclarées ;
- la **logique des quatre mini-jeux**, extraite du rendu : déplacements et
  collisions du serpent, rotation et effacement de lignes du Tetris, génération et
  validation du Sudoku, coloration des lettres répétées du Wordle ;
- la **dérivation de la clé d'identité** : accents, casse et espaces mènent à la
  même clé, un prénom normalisé vide est refusé ;
- l'**intégrité du contenu** : aucun identifiant dupliqué entre les trois fichiers,
  tous au bon format, chaque joker référençant un jeu connu.

Pas de tests de bout en bout ni d'intégration Firestore : le rapport coût/bénéfice
n'y est pas à cette échelle. Ce qui se vérifie à la main avant le lancement est
listé dans [`specs/17`](specs/17-operations-runbook.md).

## Déployer

Un push sur `main` déclenche le workflow [`deploy.yml`](.github/workflows/deploy.yml) :
install → lint → test → build → publication de `dist/` sur GitHub Pages.

Deux réglages à faire une fois pour toutes côté GitHub, sinon l'étape
`configure-pages` échoue :

1. **Settings → Pages → Build and deployment → Source : GitHub Actions**
2. **Settings → Actions → General → Workflow permissions : Read and write**

Puis relancer le workflow (**Actions → Déploiement GitHub Pages → Re-run jobs**).
Le site sort sur https://gguigre.github.io/halloween-delaf-2026/

⚠️ La `base` de [`vite.config.ts`](vite.config.ts) (`/halloween-delaf-2026/`) doit
correspondre au nom du dépôt. Une `base` erronée casse le chargement des assets **et**
les URLs encodées dans les QR codes déjà imprimés.

## Règles Firestore

Les règles sont versionnées dans [`firestore.rules`](firestore.rules). Elles n'ont
**aucune date d'expiration** : des règles en mode test expireraient au bout de 30 jours,
soit en pleine partie.

Déploiement, au choix :

- Console Firebase → Firestore → Règles → coller le contenu du fichier → Publier ;
- ou `firebase deploy --only firestore:rules` (avec la CLI Firebase).

Vérifier avant le lancement qu'aucune règle `request.time < timestamp.date(...)` ne
traîne dans la console (voir [`specs/17`](specs/17-operations-runbook.md)).

## L'alerte « secret détecté » de GitHub

GitHub signale la clé Firebase de [`src/firebase/config.ts`](src/firebase/config.ts)
comme une Google API Key exposée. **C'est un faux positif attendu, l'alerte peut être
fermée** — mais il faut comprendre pourquoi avant de la fermer.

Une clé d'application web Firebase **identifie** le projet, elle n'**autorise** rien.
Elle est embarquée dans le bundle JavaScript servi à chaque joueur : n'importe qui
peut la lire depuis les outils de développement de son navigateur, qu'elle soit
committée ou non. La régénérer ne servirait donc à rien — la nouvelle serait tout
aussi publique.

Ce qui protège réellement les données, c'est [`firestore.rules`](firestore.rules) :
lecture de la collection, création et mise à jour validées, **aucune suppression**.
Et le fait qu'un joueur motivé puisse écrire dans son propre document est un risque
déjà pesé et accepté dans [`specs/00`](specs/00-overview.md) — c'est un jeu entre
collègues, pas un système bancaire.

### Le durcissement qui vaut, lui, le coup

Le vrai risque d'une clé non restreinte n'est pas la fuite de données, c'est qu'on
s'en serve pour consommer ton quota. Dans la console Google Cloud → **API et
services → Identifiants → la clé « Browser key (auto created by Firebase) »** :

- **Restrictions d'application** : sites web autorisés →
  `https://gguigre.github.io/*` et `http://localhost:*/*` pour le développement.
- **Restrictions d'API** : limiter aux API réellement utilisées — Cloud Firestore,
  et Firebase Installations plus Google Analytics si tu gardes les statistiques.

⚠️ À faire **avant le lancement**, pas pendant : une restriction mal réglée casse le
jeu pour tout le monde. Après l'avoir appliquée, vérifie depuis un téléphone sur le
réseau mobile qu'un scan fonctionne toujours. En cas de doute, retire la restriction.

## Éditer le contenu

Trois fichiers JSON dans [`src/assets/`](src/assets/), embarqués dans le build :
`basicGhosts.json` (liste d'identifiants), `quizGhosts.json` (énigmes et variantes
de réponses acceptées) et `jokerGhosts.json` (mini-jeu, durée et configuration).
Une entrée ajoutée à la main est immédiatement scannable, sans toucher au code.

Pour obtenir de nouveaux identifiants sans collision avec l'existant :

```bash
node scripts/generate-ids.mjs 20
```

Les identifiants font 6 caractères tirés de `23456789ABCDEFGHJKMNPQRSTVWXYZ` — sans
`0/O` ni `1/I/L`, et courts pour que le QR reste lisible imprimé petit.

⚠️ **Ne jamais régénérer un identifiant déjà imprimé** : le matériel est collé sur
les murs pour un mois. Ajouter du contenu est sans risque ; en retirer fait baisser
le score maximum théorique et déplace les barres de progression de tout le monde.

Les variantes de réponses (`acceptedAnswers`) se déclarent au moment d'écrire
l'énigme : une mauvaise réponse coûte 10 points, refuser « les boussoles » quand on
attendait « boussole » créerait une injustice ressentie.

## Imprimer les QR codes

La page `/allCodes` (non liée depuis le jeu) affiche les QR de chaque fichier de
contenu, groupés par type, avec l'identifiant en clair sous chacun — sans cette
étiquette, un fantôme signalé comme défaillant est indiagnosticable. Un filtre
permet d'imprimer les catégories séparément.

L'aperçu d'impression est en noir sur blanc, 4 par ligne, avec des traits de
découpe et sans QR coupé entre deux pages.

⚠️ **Procédure obligatoire avant tout tirage en série** : les URLs encodées
dépendent de l'adresse d'où la page est ouverte. Ouverte en local, elle produit des
QR pointant vers `localhost`, inutilisables. Ouvrir `/allCodes` **sur le site
déployé**, imprimer une seule page, la scanner avec deux téléphones différents et
vérifier que la bonne page s'ouvre. Ensuite seulement, imprimer le reste — en
prévoyant une réserve, car sur un mois des fantômes seront abîmés ou décollés.

## Page organisateur

`/admin`, en lecture seule et liée depuis aucun écran joueur : elle sert surtout à
redonner son code à quelqu'un qui l'a perdu, ce qui est la demande la plus fréquente
sur un mois de jeu. Le nettoyage de la base avant le lancement se fait depuis la
console Firebase, jamais depuis cette page.

## Avant le lancement

Le déroulé complet est dans [`specs/17`](specs/17-operations-runbook.md). Les points
qu'on ne peut pas rattraper une fois la partie commencée :

- **Régler la difficulté des mini-jeux en conditions réelles** — sur téléphone,
  debout, sans entraînement, et en la faisant essayer à quelqu'un qui ne joue
  jamais. Les valeurs livrées sont un point de départ clément, pas un équilibrage
  validé. Tout est dans `jokerGhosts.json`, rien n'est en dur.
- **Vérifier que les règles Firestore n'ont aucune date d'expiration.** Des règles
  en mode test expirent à 30 jours : sur un jeu d'un mois, elles tomberaient en
  pleine partie.
- **Imprimer une page d'essai et la scanner**, depuis le site déployé.
- **Restreindre la clé API Firebase** par référent HTTP, puis vérifier depuis un
  téléphone qu'un scan fonctionne toujours.
- **Vider la collection `Users`** des joueurs de test depuis la console Firebase,
  sinon un score de développement trône en tête pendant un mois.
- **Noter les emplacements des fantômes** : sur un mois, cette liste sert à vérifier
  qu'ils sont toujours là, à les remplacer, et à répondre à un joueur bloqué.

## Corriger l'application en cours de jeu

C'est prévu et sans danger, à trois conditions :

- **Ne jamais renommer ni retyper un champ de `PlayerDoc`** : des documents écrits
  sous l'ancienne forme existent déjà.
- **Ne jamais toucher à `sanitize()`** : la clé des documents joueurs en dépend,
  la modifier ferait perdre leur partie aux joueurs concernés.
- **Ne jamais régénérer d'identifiants de fantômes** : le matériel est collé sur
  les murs. Ajouter du contenu est sans risque ; en retirer fait baisser le score
  maximum théorique et déplace les barres de progression de tout le monde.

## À la fin

**Exporter la collection `Users` avant tout nettoyage.** Les horodatages racontent
le mois : quels fantômes n'ont jamais été trouvés, quelles énigmes ont fait perdre
des points, quels mini-jeux personne n'a gagnés. C'est la matière première de
l'édition 2027.

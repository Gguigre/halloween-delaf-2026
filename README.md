# Chasse aux fantômes — édition 2026

Jeu de piste Halloween joué sur téléphone par les soignants du service de maternité.
Des fantômes en papier portant un QR code sont cachés dans le service ; les scanner
rapporte (ou fait perdre) des points ; un classement en direct entretient l'émulation.

Le jeu reste ouvert **pendant un mois**. Les specs sont dans [`specs/`](specs/),
les conventions transverses dans [`skills/`](skills/).

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

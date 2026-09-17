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

_À compléter au jalon 2 (voir [`specs/03`](specs/03-data-model-and-content.md))._

## Imprimer les QR codes

_À compléter au jalon 7 (voir [`specs/15`](specs/15-qr-generation-and-printing.md))._

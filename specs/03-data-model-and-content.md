# 03 — Modèle de données et contenu du jeu

## Identifiants de fantômes : courts, pas des UUID

Chaque fantôme a un identifiant de **6 caractères** tirés de l'alphabet `23456789ABCDEFGHJKMNPQRSTVWXYZ` (chiffres et lettres ambigus `0/O`, `1/I/L` exclus).

Raison : l'identifiant finit dans l'URL encodée par le QR code, et le QR sera **imprimé petit, collé sur un fantôme en papier, scanné dans un couloir par un téléphone quelconque**. Un UUID de 36 caractères produit un QR beaucoup plus dense, donc des modules plus petits, donc des scans qui échouent. Six caractères suffisent largement pour 130 fantômes tout en gardant un QR très lisible.

Les identifiants sont tirés aléatoirement (pas séquentiels) et doivent être **uniques toutes catégories confondues** : un identifiant n'appartient qu'à un seul fantôme, d'un seul type.

Prévoir un script (`scripts/`) qui génère N identifiants uniques et vérifie l'absence de collision avec le contenu existant.

## Fichiers de contenu

Trois fichiers JSON dans `src/assets/`, typés explicitement côté TypeScript, importés dans le bundle.

### `basicGhosts.json` — 100 entrées

```json
["AB23CD", "EF45GH", "..."]
```

### `quizGhosts.json` — 20 entrées

```ts
type QuizGhost = {
  id: string;
  question: string;           // HTML inline autorisé pour les retours à la ligne
  answer: string;             // réponse canonique
  acceptedAnswers?: string[]; // variantes acceptées (singulier/pluriel, synonymes)
};
```

`acceptedAnswers` existe parce qu'une mauvaise réponse coûte 10 points : refuser "les boussoles" quand on attendait "boussole" créerait une injustice ressentie. Voir les règles de comparaison dans `07`.

### `jokerGhosts.json` — 10 entrées

```ts
type JokerGame = "snake" | "tetris" | "sudoku" | "wordle";

type JokerGhost = {
  id: string;
  game: JokerGame;
  timeLimitSeconds: number;
  config: SnakeConfig | TetrisConfig | SudokuConfig | WordleConfig; // voir 09 à 12
};
```

Le mini-jeu est **fixe par fantôme**, pas tiré au sort. Répartition de départ suggérée : 3 snake, 3 tetris, 2 sudoku, 2 wordle — ajustable.

## Document joueur (Firestore)

Collection `Users`, un document par joueur. Son identifiant est déterministe : `${sanitize(prénom)}-${code}`, par exemple `julie-4271` (voir `04`). Il se déduit donc de ce que le joueur saisit, ce qui permet de retrouver une partie par une simple lecture de document, sans requête.

```ts
type QuizResult = { id: string; correct: boolean; at: number };
type JokerResult = { id: string; won: boolean; at: number };

type PlayerDoc = {
  name: string;            // prénom tel que saisi, accents et casse conservés — c'est lui qui s'affiche
  pin: string;             // 4 chiffres, en chaîne : les zéros de tête comptent ("0042")
  ghosts: string[];        // ids des fantômes basiques trouvés
  quizzes: QuizResult[];   // une entrée par quiz tenté
  jokers: JokerResult[];   // une entrée par joker tenté
  createdAt: number;
};
```

`at` (horodatage epoch ms) sert au départage du classement et au débrief de fin de jeu. Le score **n'est jamais stocké** : il se recalcule à partir de ces listes (`05`), ce qui évite toute dérive entre un score enregistré et l'état réel.

## Contenu réel

Ces specs ne contiennent pas le contenu final. Générer un jeu d'exemple suffisant pour développer (quelques entrées par type), et **faire valider par Guillaume les 130 fantômes définitifs avant impression**. Une fois les QR codes imprimés et collés sur les fantômes en papier, régénérer les identifiants rend tout le matériel physique inutilisable.

## Definition of done

- Les trois fichiers sont typés, sans `any`, et une entrée ajoutée à la main est immédiatement prise en compte (QR généré, fantôme scannable) sans toucher au code.
- Un test vérifie qu'aucun identifiant n'est dupliqué entre les trois fichiers.

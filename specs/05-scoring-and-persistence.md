# 05 — Barème, calcul du score et écritures

## Barème

```ts
const POINTS_BASIC = 10;
const POINTS_QUIZ_CORRECT = 20;
const POINTS_QUIZ_WRONG = -10;
const POINTS_JOKER_WIN = 50;
const POINTS_JOKER_LOSE = -30;
```

Le simple fait de scanner un fantôme quiz ou joker ne rapporte rien : seul le résultat de la tentative compte.

## Calcul

Le score est **toujours recalculé** à partir du document joueur, jamais stocké.

```ts
const scoreOf = (p: PlayerDoc) =>
  uniqueById(p.ghosts).length * POINTS_BASIC +
  uniqueById(p.quizzes).filter((q) => q.correct).length * POINTS_QUIZ_CORRECT +
  uniqueById(p.quizzes).filter((q) => !q.correct).length * POINTS_QUIZ_WRONG +
  uniqueById(p.jokers).filter((j) => j.won).length * POINTS_JOKER_WIN +
  uniqueById(p.jokers).filter((j) => !j.won).length * POINTS_JOKER_LOSE;
```

La déduplication par identifiant est **défensive et obligatoire** : `arrayUnion` ne déduplique que des objets strictement identiques, or `QuizResult` et `JokerResult` portent un horodatage. Sans cette précaution, une double écriture compterait les points deux fois — un bug directement visible au classement.

Score maximum théorique : `100×10 + 20×20 + 10×50 = 1900`.

Le score **peut être négatif** et s'affiche tel quel (voir `13` pour l'affichage).

## Règle d'or des écritures : jamais de document complet

Toute écriture ne touche que le champ concerné, via `updateDoc` et `arrayUnion`. **Jamais** `setDoc` avec une copie de l'objet joueur gardé en mémoire.

Le scénario qui casse tout : un joueur scanne un fantôme joker et joue au Snake pendant 90 secondes. Pendant ce temps, l'objet joueur chargé au montage de l'écran est périmé — le joueur a pu scanner un fantôme basique dans un autre onglet, ou son document a pu être mis à jour ailleurs. Réécrire le document entier à la fin du mini-jeu effacerait silencieusement ces points.

Détail complet dans `skills/firestore-access-conventions.md`, qui s'applique à tout le code.

## Aucun point annoncé avant confirmation

Un écran ne doit jamais afficher "+10 points" tant que l'écriture Firestore n'est pas confirmée. Trois états explicites :

- **en cours** : indicateur discret, le joueur voit qu'il se passe quelque chose ;
- **succès** : le résultat et le delta de points ;
- **échec** : message clair et bouton **Réessayer**, qui rejoue la même écriture.

Le wifi d'un hôpital est irrégulier ; un point perdu sans que personne ne le voie, c'est un joueur qui accuse le jeu d'être cassé — et il aura raison.

## Idempotence

Avant toute écriture, vérifier que le fantôme n'est pas déjà présent dans le document. Chaque écran dérive son affichage de l'état du document, jamais d'un état local : rescanner un fantôme déjà traité montre son résultat, ne réécrit rien, ne recompte rien.

## Journalisation

Un évènement Analytics par action de jeu, sans jamais bloquer le jeu si Analytics est indisponible (`01`) : création de joueur, fantôme basique trouvé, quiz répondu (avec le résultat), joker lancé, joker terminé (avec le résultat).

## Definition of done

- Deux onglets ouverts sur le même joueur : une action dans l'un n'efface jamais l'action faite dans l'autre.
- Réseau coupé pendant un scan : message d'échec explicite, aucun point annoncé, et le bouton Réessayer fonctionne une fois le réseau revenu.
- Un test unitaire couvre le calcul de score, dont le cas des doublons et celui du score négatif.

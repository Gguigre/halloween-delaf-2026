# 11 — Mini-jeu : Sudoku 6×6

## Règle

Sudoku réduit : grille 6×6, blocs de 2 lignes × 3 colonnes, chiffres de 1 à 6. Objectif : remplir toute la grille correctement avant la fin du temps. Un 9×9 classique est hors de portée en quelques minutes, un 6×6 se résout tranquillement.

## Configuration

```ts
type SudokuConfig = {
  cellsToRemove?: number; // défaut 12 sur 36 cases, soit 24 indices de départ
};
```

Durée par défaut : **180 secondes**.

## Génération

Générer une grille complète valide par retour sur trace, puis retirer `cellsToRemove` cases.

L'unicité de la solution n'est pas exigée : c'est coûteux à garantir et sans conséquence ici, puisque la victoire se juge sur la validité de la grille remplie, pas sur sa correspondance avec la solution générée. **Valider la grille du joueur contre les règles du Sudoku**, pas contre la solution d'origine — sinon une seconde solution valide serait refusée, ce qui serait vécu comme un bug.

Une grille différente à chaque partie.

## Commandes

Sélection d'une case, puis choix d'un chiffre dans une palette de 1 à 6 affichée en bas de l'écran, plus un bouton pour effacer. Les cases d'origine ne sont pas modifiables et sont visuellement distinctes.

Signaler discrètement les conflits (ligne, colonne, bloc) est un bonus apprécié : sans retour, le joueur découvre son erreur à la dernière seconde.

## Fin de partie

| Situation | Résultat |
|---|---|
| Grille complète et valide | `won: true`, immédiatement |
| Temps écoulé | `won: false` |

Aucune défaite instantanée sur une saisie erronée : le joueur corrige jusqu'au bout.

## Definition of done

- Grille différente à chaque partie, toujours résolvable.
- Une solution valide différente de celle générée est acceptée.
- Les deux issues appellent `onFinish` exactement une fois.
- Tests unitaires sur le générateur (grille produite toujours valide) et sur la validation (`16`).

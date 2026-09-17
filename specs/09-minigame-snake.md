# 09 — Mini-jeu : Snake

Le plus simple des quatre, donc **le premier à implémenter** pour valider le contrat de `skills/minigame-conventions.md`.

## Règle

Grille carrée, le serpent avance en continu, le joueur change sa direction. Chaque pomme mangée l'allonge d'une case et incrémente le score. Objectif : atteindre le score cible avant la fin du temps.

## Configuration

```ts
type SnakeConfig = {
  gridSize?: number;     // défaut 15
  targetApples?: number; // défaut 10
  tickMs?: number;       // défaut 160, vitesse constante
};
```

Durée par défaut : **90 secondes**.

Pas d'accélération progressive : sur une partie de 90 secondes jouée au pouce, elle ne fait qu'ajouter de la frustration.

## Commandes

Quatre boutons directionnels fixés en bas de l'écran, sous la grille, dimensionnés pour le pouce. Le demi-tour sur soi-même est ignoré (ne doit pas provoquer une mort instantanée par inattention). Le balayage est un bonus facultatif.

## Fin de partie

| Situation | Résultat |
|---|---|
| Score cible atteint | `won: true`, immédiatement |
| Collision avec un mur ou avec soi-même | `won: false`, immédiatement |
| Temps écoulé sans objectif | `won: false` |

## Definition of done

- Jouable au pouce en portrait, grille et commandes visibles sans scroll.
- Le demi-tour immédiat est ignoré et ne tue pas le serpent.
- Les trois issues appellent `onFinish` exactement une fois.
- Tests unitaires sur la logique de déplacement, de collision et de détection de victoire (`16`).

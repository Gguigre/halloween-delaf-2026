# 10 — Mini-jeu : Tetris (format court)

## Règle

Tetris sur un plateau réduit, pour rester jouable en quelques minutes sur un téléphone. Objectif : effacer un nombre de lignes cible avant la fin du temps.

## Configuration

```ts
type TetrisConfig = {
  cols?: number;        // défaut 8
  rows?: number;        // défaut 14
  targetLines?: number; // défaut 3
  dropMs?: number;      // défaut 700, vitesse de chute constante
};
```

Durée par défaut : **150 secondes**.

Trois lignes en deux minutes et demie paraît peu à un habitué : c'est délibéré. Le plateau étroit, les commandes tactiles et l'absence de pratique rendent l'exercice bien plus difficile qu'il n'y paraît pour quelqu'un qui n'a pas joué depuis dix ans.

## Commandes

Cinq boutons : gauche, droite, rotation, descente douce, chute instantanée. La chute instantanée est indispensable dans un format chronométré — sans elle, le joueur passe son temps à attendre.

## Règles de jeu

Les sept tétrominos classiques, une rotation simple (pas besoin du système SRS ni des rattrapages contre les murs, seulement refuser une rotation qui entrerait en collision). Une ligne complète disparaît et compte pour l'objectif. Pas de niveaux, pas de score en points, pas de pièce suivante annoncée — seulement le compteur de lignes restantes.

## Fin de partie

| Situation | Résultat |
|---|---|
| Objectif de lignes atteint | `won: true`, immédiatement |
| Une nouvelle pièce ne peut plus apparaître | `won: false`, immédiatement |
| Temps écoulé sans objectif | `won: false` |

## Definition of done

- Plateau et commandes tiennent sur un écran de téléphone sans scroll.
- Une rotation impossible est refusée sans casser la pièce ni la faire sortir du plateau.
- Les trois issues appellent `onFinish` exactement une fois.
- Tests unitaires sur la détection de collision, la rotation et l'effacement de lignes (`16`).

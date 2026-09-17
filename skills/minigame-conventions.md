# Conventions communes aux mini-jeux

Contrat que respectent les quatre mini-jeux (Snake, Tetris, Sudoku, Wordle) pour être interchangeables du point de vue de l'écran joker (`specs/08`).

## Interface

```ts
type MinigameResult = { won: boolean };

type MinigameProps<Config> = {
  config: Config;             // propre à chaque jeu, voir sa spec
  timeLimitSeconds: number;   // fourni par le contenu du fantôme joker
  onFinish: (result: MinigameResult) => void; // appelé exactement une fois
};
```

Un mini-jeu ne sait rien du score, du joueur, ni de Firestore. Il joue, il rend un booléen.

## Règles obligatoires

1. **Aucun son.** Jamais d'`Audio` ni d'`AudioContext`, ni de bibliothèque qui en dépend.
2. **Compte à rebours visible en permanence** (`Countdown`, voir `specs/02`), démarré au montage.
3. **Tout au doigt, en portrait, à une main.** Les commandes sont des boutons à l'écran, assez grands pour un pouce (44px minimum). Le clavier physique n'est qu'un confort de développement, jamais la seule entrée possible.
4. **`onFinish` appelé une seule fois par montage**, dans l'un de ces cas : objectif atteint, échec propre au jeu, ou temps écoulé. Protéger explicitement contre le double appel (une victoire au moment exact où le chronomètre tombe à zéro ne doit pas produire deux appels).
5. **Aucune persistance interne.** Aucun état ne survit au démontage : c'est l'écran joker qui gère la reprise, et il considère toute partie non terminée comme perdue.
6. **Pas de pause.** Une tentative unique, chronométrée, qui ne s'interrompt pas.
7. **Quelques minutes maximum.** Le mini-jeu s'insère au milieu d'une chasse plus large, il ne la remplace pas.

## Difficulté : à régler, pas à deviner

Les valeurs par défaut de chaque spec sont un **point de départ volontairement clément**, pas un équilibrage validé. Le public est composé de soignants, pas de joueurs : un Tetris calibré pour un habitué rend les 10 fantômes joker punitifs et casse le mécanisme de retournement.

Toutes les valeurs (objectif, durée, vitesse) sont dans la configuration du contenu, jamais en dur dans le composant, précisément pour pouvoir être ajustées après essai (voir `specs/17`).

## Hors scope

Meilleurs scores, rejouabilité, tutoriels longs, animations complexes. Les règles tiennent en une phrase sur l'écran d'annonce du joker, avant le lancement.

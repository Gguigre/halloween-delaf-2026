# 12 — Mini-jeu : Wordle

## Règle

Deviner un mot français de 5 lettres en un nombre limité d'essais. Après chaque essai, chaque lettre est colorée : bien placée, présente mais mal placée, absente.

## Configuration

```ts
type WordleConfig = {
  words: string[];      // réserve de mots pour ce fantôme, pas un mot unique
  maxAttempts?: number; // défaut 6
};
```

Durée par défaut : **180 secondes**.

## Une réserve de mots, pas un mot fixe

Le mot est choisi dans `words` de façon **déterministe à partir de l'identifiant du joueur et de celui du fantôme** (un hachage simple des deux, modulo la taille de la réserve).

Deux joueurs différents tombent donc rarement sur le même mot, ce qui limite le bouche-à-oreille — avec seulement 10 fantômes joker, un mot qui circule dans le service offre 50 points gratuits à tout le monde. Et comme le choix est déterministe, un même joueur retrouve toujours le même mot, sans qu'il faille le stocker.

Suggestions de mots dans le thème, à compléter : `MOMIE`, `MAGIE`, `TOMBE`, `OMBRE`, `CRANE`, `POTION`… (uniquement des mots de 5 lettres, sans difficulté d'orthographe piégeuse).

## Comparaison

La même normalisation que les énigmes (minuscules, accents et ponctuation retirés) s'applique au mot cible comme aux essais : "crane" et "crâne" sont le même mot.

La coloration doit traiter correctement les lettres répétées, comme le vrai Wordle : une lettre présente en un seul exemplaire dans le mot cible ne s'affiche "présente" qu'une fois, en priorité là où elle est bien placée. C'est le piège classique de l'exercice, et c'est exactement ce qu'un test unitaire doit couvrir.

Un essai qui n'est pas un mot du dictionnaire **est accepté** : pas de dictionnaire embarqué, ce serait des centaines de kilooctets embarqués dans le bundle, et refuser un essai valable serait bien plus frustrant que d'en accepter un fantaisiste.

## Commandes

Clavier AZERTY affiché à l'écran, touches dimensionnées pour le pouce, avec validation et effacement. Le clavier natif du téléphone n'est pas utilisé : il masque la grille et propose de la correction automatique.

Les touches déjà jouées reprennent la couleur obtenue, comme dans le jeu d'origine.

## Fin de partie

| Situation | Résultat |
|---|---|
| Mot trouvé dans le nombre d'essais imparti | `won: true`, immédiatement |
| Essais épuisés | `won: false` |
| Temps écoulé | `won: false` |

En cas de défaite, le mot est révélé — sur l'écran de résultat du joker, pas dans le composant.

## Definition of done

- Deux identifiants de joueur différents obtiennent des mots différents sur le même fantôme.
- La coloration des lettres répétées est correcte, couverte par des tests unitaires.
- Les trois issues appellent `onFinish` exactement une fois.

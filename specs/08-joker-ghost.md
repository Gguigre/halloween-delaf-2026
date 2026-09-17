# 08 — Fantôme joker et lancement des mini-jeux

Route `/joker/:id`. C'est l'écran le plus délicat du jeu : il porte le plus gros enjeu de points et la seule mécanique où le joueur peut être tenté de tricher.

## Expérience joueur

Le joueur scanne un fantôme joker. Un écran d'annonce présente le mini-jeu, son objectif et sa durée. Quand il se sent prêt, il lance la partie. **Une seule tentative** :

- objectif atteint dans le temps → "Bravo ! **+50 points**"
- échec ou temps écoulé → "Dommage... **−30 points**"

## L'écran d'annonce n'est pas décoratif

Avant le lancement, l'écran affiche : quel jeu, quel objectif chiffré ("effacer 3 lignes"), combien de temps, ce qu'on gagne, ce qu'on perd, et surtout — **une fois lancé, quitter la partie compte comme une défaite**.

Deux raisons :

1. **Un scan n'engage à rien.** Une soignante peut scanner un joker en passant, puis être appelée par une patiente. Sans ce sas, elle perdrait 30 points sans avoir joué. Dans ce service, être interrompu n'est pas un cas limite, c'est la norme.
2. **Le lancement engage.** Sans cela, un joueur qui voit qu'il va perdre ferme l'onglet et ne paie jamais les 30 points : la moitié du mécanisme de retournement disparaît.

## Enregistrement de la tentative

- **Au lancement** (appui sur le bouton, pas au scan) : écriture d'une tentative **perdue** (`{ id, won: false, at }`).
- **À la victoire uniquement** : mise à jour de cette entrée en `won: true`.

Donc : partie abandonnée, onglet fermé, téléphone à plat, temps écoulé — tout se solde par une défaite, sans traitement particulier. C'est aussi ce qui rend l'écran de reprise trivial : un joker déjà présent dans le document affiche simplement son résultat.

Cette écriture-là est la seule du jeu qui modifie une entrée existante plutôt que d'en ajouter une : la faire proprement, sans réécrire le document complet (voir `skills/firestore-access-conventions.md`).

## Pourquoi le quiz ne fonctionne pas pareil

Sur un quiz, rien n'est enregistré tant que le joueur n'a pas validé. La différence tient à l'incitation : on ne peut pas "voir qu'on est en train de rater" une énigme, alors qu'on voit très bien qu'on va perdre au Tetris. Seul le cas où l'abandon est profitable mérite d'être verrouillé.

Contrepartie assumée côté quiz : un joueur peut lire l'énigme, partir demander la réponse à un collègue et revenir répondre. C'est un jeu entre collègues, ça reste acceptable.

## Comportement

1. Identifiant inconnu → écran d'erreur, comme en `06`.
2. Identifiant déjà présent dans `jokers` → afficher le résultat obtenu. Jamais de relance.
3. Sinon → écran d'annonce, puis au lancement : écriture de la tentative perdue, puis montage du composant de mini-jeu correspondant (`config` et `timeLimitSeconds` viennent du contenu, voir `03`).
4. Le mini-jeu ne connaît rien du score : il rend `{ won: boolean }` une fois, et c'est cet écran qui met à jour le document et affiche le `ResultBanner`. En cas de victoire, le résultat s'affiche même si la mise à jour échoue — avec le bouton Réessayer, car le joueur a gagné ses points et doit pouvoir les récupérer.

## Definition of done

- Scanner sans lancer : aucune écriture, le joker reste jouable.
- Lancer puis fermer l'onglet : tentative perdue, −30, non rejouable.
- Gagner : +50, non rejouable.
- Revenir sur un joker terminé : résultat affiché, mini-jeu jamais relancé.

# 14 — Accueil et règles

## Pourquoi cette page compte cette année

Les éditions précédentes ne pouvaient que rapporter des points. Celle-ci en fait perdre. Un joueur qui voit son score baisser sans avoir compris le barème conclut que le jeu est cassé — ou qu'il est puni. C'est exactement l'effet de découragement qu'on cherche à supprimer cette année.

Les règles doivent donc être accessibles depuis n'importe quel écran, en un geste.

## Accueil — route `/`

Peu de joueurs y arrivent en premier (le jeu commence par un QR scanné dans un couloir), mais c'est le point de retour naturel.

Contient : le titre, `FloatingGhost`, une phrase qui dit quoi faire (chercher les fantômes, les scanner), un accès au classement, un accès aux règles, et **le prénom et le code du joueur affichés en clair** — le code n'est pas un secret, son affichage permanent est ce qui permet de le retenir (`04`).

## Règles — route `/regles`

Court, lisible d'un coup d'œil, dans le ton du jeu :

- les trois types de fantômes, ce que chacun rapporte et ce que chacun fait perdre, présentés dans un tableau ;
- une tentative unique par fantôme quiz et par fantôme joker, sans seconde chance ;
- un joker lancé puis abandonné compte comme perdu ;
- un score peut devenir négatif, et ce n'est pas une anomalie ;
- le rappel de la promesse : on ne décroche pas, on ne déplace pas, on ne cache pas les fantômes pour les autres.

Le ton doit faire passer les pénalités pour un pari assumé, pas pour une sanction : un fantôme quiz ou joker est une prise de risque, et c'est ce qui permet de remonter de plusieurs places d'un coup.

## Definition of done

- Les règles sont atteignables depuis l'accueil, le classement et les écrans de résultat.
- Un joueur qui vient de perdre des points trouve l'explication en un geste.
- La page tient sur un écran de téléphone, sans pavé de texte.

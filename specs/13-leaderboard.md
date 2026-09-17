# 13 — Classement

Route `/leaderboard`. C'est le cœur émotionnel du jeu : en 2025, c'est ce qui a créé l'émulation dans le service. Tout le reste sert à faire bouger ces lignes.

## Temps réel, pas au chargement

Le classement s'abonne en temps réel à la collection `Users` (`onSnapshot`), il ne fait pas une lecture unique au montage.

Avec un barème où l'on peut perdre 30 points d'un coup, voir le classement bouger tout seul pendant qu'on le regarde **est** le jeu. Un classement qui exige un rafraîchissement manuel perd l'essentiel de son effet. Le volume est négligeable : quelques dizaines de joueurs.

Le jeu durant un mois, un onglet laissé ouvert peut le rester des jours : **suspendre l'abonnement quand l'onglet passe en arrière-plan** (`visibilitychange`) et le reprendre au retour. Sans cela, des onglets oubliés consomment du quota Firestore pour personne.

## Affichage

Un tableau trié par score décroissant : rang, prénom, score.

- Le joueur courant est mis en évidence (étoile et prénom en gras) et doit rester trouvable sans faire défiler toute la liste s'il est loin dans le classement.
- **Score négatif** : affiché tel quel, avec son signe, dans une couleur distincte pour qu'il se lise comme un état de jeu et non comme un bug. Ne jamais plafonner à 0.
- Barre de progression vers le score maximum théorique (1900, voir `05`) : sa largeur doit être bornée entre 0 et 100%. Un score négatif produirait une largeur négative, invalide.
- Égalité de score : départager par l'horodatage de la dernière action, le plus ancien devant — celui qui y est arrivé le premier passe devant.

## Code du joueur

Le code à 4 chiffres du joueur courant est affiché sur cet écran, discrètement mais en permanence ("Ton code : 4271"). C'est l'écran le plus consulté du jeu : c'est là que le code finit par se mémoriser tout seul, ce qui est précisément son rôle (`04`).

## Rappel des règles

Un lien discret vers `/regles` : c'est ici qu'un joueur qui vient de perdre 10 points cherchera à comprendre pourquoi.

## Definition of done

- Une action faite sur un autre téléphone apparaît dans le classement sans rafraîchir.
- Un score négatif s'affiche correctement, sans `NaN` ni barre déformée.
- L'abonnement est résilié au démontage de l'écran.
- Lisible à 375px de large avec une trentaine de joueurs.

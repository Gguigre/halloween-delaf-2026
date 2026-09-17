# 18 — Page organisateur

Route `/admin`. Outil pour Guillaume pendant le mois de jeu, pas un écran de joueur.

## À quoi elle sert

Principalement à une chose : une soignante demande son code, on le lui redonne en dix secondes, elle retrouve sa partie (voir `04`).

Sur un mois de jeu, ce n'est pas un cas rare mais une **demande régulière** : c'est l'écran d'organisateur le plus utilisé.

Accessoirement, à diagnostiquer un problème en cours de jeu : "j'ai scanné ce fantôme et il ne compte pas" se vérifie en regardant son document.

## Contenu

Un tableau de tous les joueurs : **prénom, code, score, nombre de fantômes trouvés par type, horodatage de la dernière action**.

Un champ de recherche filtrant sur le prénom — le premier réflexe sera de taper un prénom, pas de faire défiler quarante lignes sur un téléphone dans un couloir.

Le code doit être affiché **en gros et lisible d'un coup d'œil** : c'est l'information qu'on vient chercher.

## Lecture seule, strictement

Aucune modification de score, aucune suppression, aucune création. Une page d'organisateur capable de retoucher les scores pose un problème de confiance dans un jeu compétitif entre collègues — et un risque de fausse manœuvre un soir d'événement.

Le nettoyage de la base avant le lancement (`17`) se fait depuis la console Firebase, pas ici.

## Sécurité

Aucune. Pas d'authentification, pas de mot de passe : les codes ne protègent rien de précieux, ils servent à récupérer une partie.

Deux précautions suffisent : la page n'est **liée depuis aucun écran joueur** (on y accède en tapant l'URL), et elle ne peut rien écrire.

## Definition of done

- Retrouver le code d'une joueuse par son prénom prend moins de dix secondes sur un téléphone.
- La page ne déclenche aucune écriture Firestore, vérifiable dans les règles comme dans le code.
- Aucun lien vers `/admin` depuis l'accueil, le classement ou un écran de fantôme.

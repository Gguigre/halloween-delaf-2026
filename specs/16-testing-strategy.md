# 16 — Stratégie de test

Le jeu tourne pendant un mois. Un correctif reste donc déployable en cours de partie — mais un bug non détecté abîme l'expérience de tout le service pendant des semaines, et **les données de jeu déjà écrites ne se rattrapent pas** : un score mal compté ou une écriture perdue reste faux. L'effort de test va là où une erreur est à la fois probable et irréversible.

Corollaire : toute évolution déployée en cours de jeu doit rester compatible avec les documents joueurs déjà écrits. Ne jamais renommer ni retyper un champ de `PlayerDoc` après le lancement, ne jamais régénérer d'identifiants de fantômes.

## Ce qui est testé unitairement (Vitest, obligatoire)

- **Calcul du score** (`05`) : les cinq termes du barème, le score négatif, et la déduplication défensive par identifiant.
- **Comparaison des réponses aux énigmes** (`07`) : casse, accents, ponctuation, article devant la réponse, variantes déclarées dans `acceptedAnswers`.
- **Logique de chaque mini-jeu**, extraite du rendu sous forme de fonctions pures : déplacement et collisions du serpent, rotation et effacement de lignes du Tetris, génération et validation du Sudoku, coloration des lettres du Wordle — en particulier le cas des lettres répétées.
- **Dérivation de la clé d'identité** (`04`) : accents, casse et espaces du prénom produisent bien la même clé ("José " et "jose" avec le même code pointent sur le même document), et un prénom normalisé vide est refusé.
- **Intégrité du contenu** (`03`) : aucun identifiant dupliqué entre les trois fichiers, tous les identifiants au bon format, chaque fantôme joker référençant un jeu connu avec une configuration valide.

Cette dernière famille de tests est la moins coûteuse et la plus rentable : elle protège contre l'erreur de contenu, la plus probable de toutes, puisque le contenu sera écrit à la main puis imprimé.

## Ce qui est vérifié à la main

Un passage sur téléphone réel avant le lancement, pour chaque type de fantôme : premier scan, rescan, identifiant inconnu, et scan avec le réseau coupé.

## Ce qui n'est pas testé

Pas de tests de bout en bout, pas de tests de rendu exhaustifs, pas de tests d'intégration Firestore. Le rapport coût/bénéfice n'y est pas à cette échelle.

## Definition of done

- `yarn test` passe et s'exécute en moins d'une minute.
- La logique de jeu est séparée du rendu, condition nécessaire pour être testable sans simuler des clics.

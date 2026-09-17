# 06 — Fantôme basique

Route `/ghost/:id`. Le type le plus simple, et **le premier à implémenter** : il valide toute la chaîne scan → écriture → classement.

## Expérience joueur

Le joueur scanne un fantôme blanc. Pas de question, pas de risque : +10 points, une seule fois.

## Comportement

1. Chargement du joueur (voir `04`) et du contenu. Pendant ce temps, `FloatingGhost` seul — jamais d'écran vide.
2. Identifiant absent de `basicGhosts.json` → écran "Ce n'est pas un fantôme !", avec une invitation à demander de l'aide à l'organisateur. Aucun impact sur le score.
3. Identifiant déjà présent dans `ghosts` → "Tu as déjà trouvé ce fantôme !". Rien n'est réécrit.
4. Sinon → écriture (`arrayUnion`), puis écran de succès "+10 points" une fois l'écriture confirmée (voir `05` pour les états en cours / succès / échec).
5. Lien vers le classement sur chacun de ces écrans.

## Definition of done

- Premier scan : +10 visibles au classement.
- Rescan : aucun point supplémentaire, message "déjà trouvé".
- Identifiant inconnu : message d'erreur, aucune écriture.
- Réseau coupé : aucun point annoncé, bouton Réessayer fonctionnel.

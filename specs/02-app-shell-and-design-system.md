# 02 — Coquille applicative et éléments visuels partagés

## Objectif

Poser les quelques composants partagés par tous les écrans, pour que les 10 specs suivantes ne réinventent pas chacune leur mise en page.

## Direction artistique

Halloween sobre, lisible dans un couloir d'hôpital, sur un téléphone, parfois en pleine lumière : fond sombre, texte clair fortement contrasté, touches orange/violet, émojis en guise d'illustration (🎃 👻 💀). Pas d'images lourdes : le jeu se joue sur le wifi du service, pendant un mois.

Tutoiement, ton joueur, phrases courtes.

## Composants partagés

- **`Layout`** : conteneur centré, largeur max confortable, padding généreux, et le lien vers le classement présent sur tous les écrans de résultat. Aucun écran ne doit être un cul-de-sac : le joueur finit toujours avec un chemin vers `/leaderboard` ou `/`.
- **`FloatingGhost`** : un fantôme en SVG, animé d'un léger flottement vertical en boucle (CSS `@keyframes`, translation de quelques pixels, 3s, `ease-in-out`, infini). Prop de taille. C'est la signature visuelle du jeu, réutilisée sur l'accueil, les écrans de chargement et les écrans de résultat.
- **`ResultBanner`** : l'écran de résultat après un quiz ou un joker. Prend un état (`gagné` / `perdu`), un delta de points (`+20`, `−10`, `+50`, `−30`) et un contenu libre (la bonne réponse, le mot à trouver…). Animation d'apparition courte (moins d'une seconde) : mise à l'échelle et fondu du delta de points. **Aucun son.** C'est le moment émotionnel du jeu, il mérite d'être soigné — mais il doit rester lisible avant la fin de l'animation, pas après.
- **`Countdown`** : compte à rebours affiché en permanence pendant un mini-jeu (`mm:ss`), avec un changement visuel dans les 10 dernières secondes. Utilisé par les 4 mini-jeux.
- **`ErrorState`** : message d'erreur générique avec bouton de reprise, utilisé quand une écriture Firestore échoue (voir `05`).

## États de chargement

Un écran de scan ne doit jamais rester vide pendant que l'utilisateur et le contenu se chargent : afficher `FloatingGhost` seul. Le joueur vient de scanner, il regarde son écran, une page blanche lui fait croire que ça a raté et il rescanne.

## Definition of done

- Tous les écrans passent par `Layout`.
- L'animation du fantôme tourne sans saccade sur un téléphone d'entrée de gamme.
- Aucun écran ne dépasse 375px de large en portrait, aucun scroll horizontal nulle part.

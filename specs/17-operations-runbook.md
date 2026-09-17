# 17 — Déroulé opérationnel

Le jeu est ouvert **pendant un mois**. Ce qui le fait échouer n'est presque jamais le code : c'est un QR mal imprimé, une base de test non vidée, une règle Firestore expirée en plein milieu, ou simplement des fantômes qui ont disparu au bout de trois semaines.

## Avant le lancement

**Trois à quatre semaines avant**

- Écrire le contenu définitif : 100 identifiants de fantômes basiques, 20 énigmes avec leurs variantes de réponses acceptées, 10 configurations de joker. Le faire valider.
- **Essayer les quatre mini-jeux dans les conditions réelles** — sur téléphone, debout, sans entraînement — et les faire essayer à quelqu'un qui ne joue jamais. Ajuster objectifs et durées dans le contenu (`skills/minigame-conventions.md`). C'est l'étape la plus facile à sauter et celle qui décide si les jokers sont un pari excitant ou une punition.

**Une à deux semaines avant**

- **Règles Firestore** : vérifier qu'elles n'ont aucune date d'expiration (`01`). Des règles en mode test expirent à 30 jours — sur un jeu d'un mois, elles tomberaient en pleine partie.
- Imprimer une page de test, la scanner avec deux téléphones différents, vérifier qu'elle ouvre le site déployé et non un serveur local (`15`).
- Imprimer, découper, coller les 130 fantômes — **plus une réserve** : sur un mois, une partie sera décollée, déchirée ou jetée.

**La veille**

- **Vider la collection `Users`** des joueurs de test, sinon un score de développement trône en tête pendant un mois.
- Cacher les fantômes **en notant leurs emplacements**. Sur cette durée, cette liste est indispensable : elle sert à vérifier qu'ils sont toujours là, à les remplacer, et à répondre à un joueur bloqué.
- Vérifier le site depuis un téléphone sur le réseau mobile, pas seulement sur le wifi du service.

## Pendant le mois

**Chaque semaine**

- **Tournée de vérification des fantômes** : repasser sur les emplacements notés, remplacer ceux qui ont disparu ou sont illisibles. Un fantôme perdu, ce sont des points devenus inatteignables pour tout le monde — et un joueur qui cherche en vain.
- Jeter un œil aux quotas Firestore la première semaine (`01`).
- Regarder le classement : si personne n'a trouvé un fantôme joker au bout de deux semaines, il est probablement mal caché ou son QR ne fonctionne pas.

**En continu**

- Garder la page `/admin` accessible : redonner son code à quelqu'un qui l'a perdu est la demande la plus fréquente, et sur un mois elle reviendra régulièrement (`18`).
- Garder `/allCodes` sous la main : l'identifiant imprimé sous chaque QR permet d'identifier immédiatement un fantôme signalé comme défaillant.

**Si l'application doit être corrigée en cours de jeu**

- Ne jamais renommer ni retyper un champ de `PlayerDoc` : des documents écrits sous l'ancienne forme existent déjà (`16`).
- Ne jamais régénérer d'identifiants de fantômes : le matériel est collé sur les murs.
- Ajouter du contenu est sans risque ; en retirer fait baisser le score maximum théorique et donc bouger les barres de progression de tout le monde.

## Question ouverte : tenir un mois

Un mois, c'est long pour maintenir l'attention. Trois leviers possibles, à trancher hors specs :

- révéler les fantômes joker en cours de route plutôt que tous dès le premier jour ;
- relancer le service à mi-parcours (affichette en salle de pause, message dans le groupe) ;
- annoncer une date de clôture ferme, pour créer une fin plutôt qu'un essoufflement.

## À la fin

- **Exporter la collection `Users` avant tout nettoyage.** Les horodatages racontent le mois : quels fantômes n'ont jamais été trouvés, quelles énigmes ont fait perdre des points, quels mini-jeux personne n'a gagnés. C'est la matière première de l'édition 2027.
- Récupérer les fantômes restants grâce à la liste des emplacements.

# 00 — Vue d'ensemble et décisions produit

## Historique

- **2023** : fantômes en papier cachés, photos envoyées par WhatsApp.
- **2024** : chaîne de QR codes, chaque énigme donnant le lieu et le mot de passe du QR suivant.
- **2025** : fantômes à QR codes valant des points, classement, énigmes bonus. Première web app.
- **2026** : cette édition. Repart d'un dépôt vierge, avec un barème repensé.

## Durée

Le jeu est ouvert **pendant un mois**. Ce n'est pas un détail d'intendance : les fantômes en papier s'abîment et disparaissent, les joueurs s'absentent une semaine puis reviennent, les navigateurs effacent leur stockage, et l'application est susceptible d'évoluer pendant que des parties sont en cours. Plusieurs décisions de ces specs en découlent directement (`04`, `13`, `16`, `17`).

## Le problème à résoudre

En 2025 le classement en direct a très bien fonctionné : il a créé de l'émulation dans le service. Mais les joueurs en bas de classement se décourageaient — leur position ne pouvait que stagner, jamais se retourner.

## La réponse : un score qui peut basculer à tout moment

Trois types de fantômes, dont deux comportent un risque réel de perdre des points :

| Type | Nombre | Ce que fait le scan | Points |
|---|---|---|---|
| **Basique** (fantôme blanc) | 100 | rien, le scan suffit | **+10**, sans risque |
| **Quiz** | 20 | ouvre une énigme, une seule tentative | **+20** si juste, **−10** si faux |
| **Joker** | 10 | lance un mini-jeu, une seule tentative | **+50** si gagné, **−30** si perdu |

Un joueur en tête qui tente des quiz et des jokers peut redescendre ; un joueur en retard peut remonter de 50 points d'un coup. C'est le mécanisme de retournement recherché.

Conséquence assumée : **un score peut être négatif**, surtout en début de partie. Ce n'est pas un bug, ne pas plafonner à 0.

## Arbitrages déjà tranchés (ne pas rouvrir)

| Sujet | Décision |
|---|---|
| Jeu en équipe | Non, individuel |
| Identité joueur | Prénom + code à 4 chiffres choisi par le joueur, affiché en clair dans le jeu. Sert à récupérer sa partie, pas à protéger quoi que ce soit |
| Authentification réelle, PWA, WebAuthn | Écartées explicitement |
| Récupération d'un code oublié | Page organisateur en lecture seule (`18`), pas de mécanisme automatique |
| Mini-jeu par fantôme joker | Fixe, défini dans le contenu — pas de tirage au sort au scan |
| Score négatif | Autorisé et affiché |
| Son | Interdit partout |

## Risques connus et acceptés

Ces points ont été pesés et **ne doivent pas être "corrigés"** par du code supplémentaire ; ils sont listés pour que personne ne les redécouvre en cours de route.

- **Partage d'URL entre joueurs.** Rien n'empêche un joueur d'envoyer l'URL d'un fantôme à un collègue par message. La porte d'entrée (`04`) sert de garde-fou social, pas technique.
- **Partage des réponses aux énigmes.** Mêmes 20 énigmes pour tout le monde. Atténué côté Wordle seulement (`12`).
- **Score calculé côté client.** Un joueur techniquement motivé peut écrire n'importe quoi dans son document Firestore. Hors scope : c'est un jeu entre collègues.
- **Code et prénom tous deux oubliés** : seul recours, la page organisateur (`18`). Pas de récupération automatique.
- **Les codes sont visibles de tous** sur la page organisateur, et affichés en clair dans le jeu. C'est délibéré : ils ne protègent rien.

## Hors scope

Notifications, partage social, export de résultats, mode équipe, internationalisation, accessibilité avancée, mode hors ligne.

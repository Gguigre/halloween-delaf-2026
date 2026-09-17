# 15 — Génération et impression des QR codes

Route `/allCodes`. Page d'outillage pour l'organisateur, pas pour les joueurs. Elle produit le matériel physique du jeu : 130 QR codes à découper et coller sur des fantômes en papier, qui resteront en place pendant un mois. Prévoir de réimprimer : sur cette durée, des fantômes seront abîmés, décollés ou jetés (voir `17`).

## Contenu de la page

Les QR codes des trois fichiers de contenu, groupés par type sous un titre (`Fantômes basiques`, `Fantômes quiz`, `Fantômes joker`), chacun encodant l'URL complète de sa route.

**Sous chaque QR code, son identifiant en clair.** Sans cette étiquette, un QR abîmé ou un fantôme qui ne fonctionne pas est indiagnosticable : impossible de savoir lequel c'est, ni ce qu'il aurait dû déclencher, ni lequel réimprimer.

Un filtre par type, pour imprimer les catégories séparément : les trois types ne se découpent pas dans la même quantité de papier et ne se cachent pas au même moment.

## Impression

Feuille de style dédiée à l'impression : **fond blanc, QR noirs** (le thème sombre du jeu viderait une cartouche pour rien), marges régulières permettant le découpage, et coupures de page propres — jamais un QR code coupé en deux entre deux feuilles.

## Vérification avant impression

Les URLs encodées dépendent de la `base` de déploiement (`01`). Une erreur à ce niveau ne se voit qu'au scan, et le papier sera déjà collé.

Procédure obligatoire avant tout tirage en série : imprimer **une seule page**, la scanner avec deux téléphones différents, vérifier que la bonne page s'ouvre sur le site déployé — pas sur un serveur local.

## Definition of done

- Un QR par entrée des trois fichiers, avec son identifiant lisible en dessous.
- L'aperçu avant impression est en noir sur blanc, sans QR coupé entre deux pages.
- Le filtre par type fonctionne.
- Un QR imprimé est scannable sans difficulté à taille réelle, y compris par un téléphone ancien.

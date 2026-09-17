# 07 — Fantôme quiz

Route `/quiz/:id`.

## Expérience joueur

Le joueur scanne un fantôme quiz, une énigme s'affiche. **Une seule tentative**, annoncée clairement avant la validation :

- bonne réponse → "Bravo, bonne réponse ! **+20 points**"
- mauvaise réponse → "Dommage ! **−10 points**", **suivi de la bonne réponse**

Une fois répondu, le fantôme est consommé définitivement.

## Comportement

1. Identifiant inconnu → écran d'erreur, comme en `06`.
2. Identifiant déjà présent dans `quizzes` → afficher le résultat obtenu, et la bonne réponse si le joueur avait échoué. Jamais de nouveau formulaire.
3. Sinon → afficher la question, un champ de saisie, un bouton de validation, et **une mention explicite qu'il n'y a qu'un seul essai et qu'une erreur coûte 10 points**. Le joueur doit prendre sa décision en connaissance de cause : c'est ce qui transforme la pénalité en pari accepté plutôt qu'en punition subie.
4. À la validation, quel que soit le résultat : écriture immédiate dans `quizzes` (verrouillage), puis écran de résultat via `ResultBanner`.

## Règles de comparaison des réponses

Une mauvaise réponse coûte 10 points : la tolérance de comparaison doit être généreuse, sinon le jeu paraît injuste.

Normalisation appliquée des deux côtés : passage en minuscules, suppression des accents, suppression de la ponctuation et des espaces.

La réponse est acceptée si la saisie normalisée correspond à `answer` ou à l'une des `acceptedAnswers`, **ou** si l'un des mots de la saisie correspond — ce qui fait passer "une boussole", "la boussole", "c'est une boussole".

Les variantes prévisibles (pluriel, article, synonyme courant) sont déclarées dans `acceptedAnswers` au moment d'écrire l'énigme, pas devinées par le code. La faute d'orthographe n'est pas rattrapée : pas de distance de Levenshtein, trop imprévisible pour un enjeu de points.

Cette logique de comparaison est une fonction pure, testée unitairement (`16`).

## Definition of done

- Bonne réponse : +20, verrouillé.
- Mauvaise réponse : −10, bonne réponse affichée, verrouillé.
- Retour sur un quiz déjà répondu : résultat affiché, aucun formulaire.
- Les variantes déclarées dans `acceptedAnswers` sont acceptées ; le test unitaire couvre les cas "une boussole", "LA Boussole", "boussole.".

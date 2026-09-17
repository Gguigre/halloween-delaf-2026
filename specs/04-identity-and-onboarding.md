# 04 — Identité du joueur et porte d'entrée

## Modèle : prénom + code à 4 chiffres

Chaque joueur choisit un prénom et un **code à 4 chiffres**. Le couple des deux identifie son document Firestore ; `localStorage` ne sert que de raccourci pour ne pas les redemander à chaque scan.

Pas de mot de passe, pas de compte, pas d'authentification Firebase, pas de PWA.

## Le code n'est pas un secret

C'est une clé de récupération, pas une protection : un jeu entre collègues ne protège rien qui mérite d'être protégé. Trois conséquences, toutes volontaires :

- **La joueuse choisit son code elle-même** (année de naissance, code d'immeuble…) plutôt qu'un code généré : elle en retient un qu'elle connaît déjà.
- **Le code est affiché en permanence dans le jeu** (accueil et classement, voir `13` et `14`) : "Ton code : 4271". Affiché en continu, il se mémorise tout seul ou se prend en capture d'écran.
- **Une page d'organisateur permet de le retrouver** si elle le demande en cours de jeu (voir `18`).

## Pourquoi un code, alors que 2025 n'en avait pas

Sans code, une identité perdue est irrécupérable — et le problème ne s'arrête pas à la joueuse concernée : elle réapparaît en double au classement, avec ses points coupés en deux, sous les yeux de tout le service. C'est la crédibilité du classement qui en souffre, or c'est le cœur du jeu.

Sur un mois, la perte d'identité n'est pas un cas limite mais une **quasi-certitude pour une partie des joueurs** : Safari sur iOS supprime le stockage des sites qui n'ont pas été visités depuis sept jours. Une soignante qui ne joue pas pendant une semaine — congés, gardes de nuit — rouvre le jeu sans identité. Le parcours « J'ai déjà joué » n'est donc pas une porte de secours : c'est un chemin principal, à traiter comme tel.

La cause la plus fréquente n'est d'ailleurs pas la navigation privée délibérée, mais le **navigateur intégré** : un lien de fantôme transmis par messagerie s'ouvre dans la webview de l'application, avec son propre stockage, donc sans l'identité créée dans le navigateur habituel. Certaines applications de scan de QR font pareil. Personne n'a rien choisi, et ça se reproduira.

## Clé de document

L'identifiant du document Firestore est déterministe :

```
`${sanitize(prénom)}-${code}`   // "julie-4271", "jose-1987"
```

`sanitize()` met en minuscules et retire accents, ponctuation et espaces (même fonction que la comparaison des énigmes, `07`). Le prénom **tel qu'il a été saisi** est conservé séparément dans le champ `name`, c'est lui qui s'affiche au classement — "José" reste "José".

Conséquence utile : savoir si un joueur existe déjà est une simple lecture de document, sans requête ni parcours de la collection, et la question "création ou récupération ?" n'a jamais de réponse ambiguë.

Refuser un prénom dont la version normalisée est vide (saisie d'emojis uniquement) avec un message clair.

## Écran d'accueil du joueur

Un écran de l'application, pas des `prompt()` natifs. **Deux boutons explicites**, jamais un formulaire ambigu — c'est ce qui supprime la question "est-ce que j'ai déjà un compte ?" :

### « Je commence »

1. Deux lignes qui posent le jeu : des fantômes sont cachés dans le service, on les scanne, ça rapporte des points, il y a un classement.
2. **Prénom** (obligatoire, espaces retirés, 20 caractères maximum pour que le classement reste lisible).
3. **Code à 4 chiffres**, saisi **deux fois**. La double saisie n'est pas une formalité : une faute de frappe ici rend la récupération impossible plus tard. Clavier numérique (`inputMode="numeric"`), code conservé en chaîne de caractères — les zéros de tête comptent ("0042").
4. Une phrase, au moment où le code est demandé : *il te servira si tu changes de téléphone ou si le jeu t'oublie*. Sans cette explication, "code" ne veut rien dire pour quelqu'un qui cherche des fantômes en papier.
5. **Le serment** : le joueur **recopie une phrase à la main**, `Je jure de respecter les fantômes`. Pas de case à cocher — une case se coche sans lire, alors que taper une phrase oblige à la traverser mot à mot. C'est le garde-fou qui protège les décorations, il doit être impossible de le rater. La phrase à recopier est affichée juste au-dessus du champ : c'est une transcription, pas un exercice de mémoire.
6. Validation désactivée tant que tout n'est pas rempli.

La phrase recopiée est comparée avec la même normalisation que les énigmes (`sanitize()`, voir `07`) : accents, casse et ponctuation ne bloquent personne, seuls les mots comptent. Le but est de faire lire la promesse, pas de piéger sur un accent circonflexe.

Si le document existe déjà (même prénom **et** même code — deux Julie ayant choisi 1234, ce qui arrivera), message explicite : *ce prénom avec ce code existe déjà, choisis un autre code — ou utilise « J'ai déjà joué » si c'est toi.* Ne jamais écraser un document existant.

### « J'ai déjà joué »

Prénom + code, puis récupération. Si le document n'existe pas : *aucune partie trouvée avec ce prénom et ce code*, avec un retour vers « Je commence ».

Le serment n'est pas redemandé : il a déjà été prêté.

## Point critique : l'onboarding s'ouvre par un scan

Le premier contact avec le jeu n'est presque jamais la page d'accueil : c'est un QR scanné dans un couloir, donc `/ghost/:id` ou `/quiz/:id` directement.

L'onboarding se comporte donc comme une **porte posée devant la route demandée**, pas comme une redirection : une fois l'identité réglée, le joueur voit l'écran du fantôme qu'il vient de scanner, sans rescanner. Rediriger vers l'accueil ferait perdre le scan.

## Ce que ça ne résout pas

Code **et** prénom oubliés, ou code saisi différemment de sa création : la page d'organisateur (`18`) permet de le retrouver. C'est le seul recours, et il suffit.

## Definition of done

- Scanner un fantôme sans identité : onboarding, puis le fantôme est crédité sans rescan.
- Le code s'affiche en permanence sur l'accueil et le classement.
- Rafraîchir ne redemande jamais ni prénom, ni code, ni serment.
- Le serment n'est validé que si la phrase est effectivement recopiée ; une case cochée à l'aveugle n'existe plus.
- Même prénom, codes différents = deux joueuses distinctes au classement.
- Même prénom, même code, via « Je commence » = message de collision, aucun écrasement.
- Navigation privée puis « J'ai déjà joué » avec le bon couple = progression intégralement retrouvée.

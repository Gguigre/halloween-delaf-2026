# Conventions d'accès à Firestore

S'applique à tout le code de l'application.

## Un seul point d'initialisation

Firebase est initialisé **une fois au niveau module**, dans un fichier dédié qui exporte l'instance Firestore. Jamais d'`initializeApp` appelé dans le corps d'un composant ou d'un hook : c'est réexécuté à chaque rendu.

Analytics est initialisé dans un `try/catch` et exposé derrière une fonction de log qui ne fait rien s'il est indisponible. Un bloqueur de publicité ou un Safari en navigation privée ne doit jamais faire échouer un écran de jeu.

## Jamais de `setDoc` sur un document existant

```ts
// INTERDIT — écrase tout ce qui a été écrit entre le chargement et maintenant
setDoc(ref, { ...player, ghosts: [...player.ghosts, ghostId] });

// ATTENDU — ne touche qu'un champ, côté serveur
updateDoc(ref, { ghosts: arrayUnion(ghostId) });
```

`setDoc` n'est autorisé qu'à un seul endroit : la **création** du document joueur.

Cette règle n'est pas cosmétique. Un écran de mini-jeu garde l'état du joueur en mémoire pendant deux à trois minutes ; tout ce qui a été gagné ailleurs pendant ce temps serait perdu par une réécriture complète.

## Lectures

- Le joueur courant se lit par son identifiant de document (`getDoc`), jamais par une requête sur son prénom.
- Le classement s'abonne en temps réel (`onSnapshot`) à la collection ; il ne fait pas une lecture unique au montage.
- Un abonnement ouvert est toujours résilié au démontage du composant.

## Écritures

- Une écriture par action de jeu, sur le champ concerné uniquement.
- Vérifier l'idempotence avant d'écrire (le fantôme est-il déjà dans le document ?).
- Toute écriture est `await`ée et son échec remonte à l'interface : pas de `.catch(() => {})`, pas d'écriture silencieuse.
- Aucune suppression de document, jamais.

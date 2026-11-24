# Atelier Chaux · site et back-office d'un studio d'architecture intérieure

Site vitrine d'un studio d'architecture intérieure **fictif**, avec un espace d'administration
qui permet à l'atelier de publier ou retirer ses projets sans passer par un développeur.

**Démo :** https://sophiebluel-ten.vercel.app/ (identifiants de démonstration affichés sur la page de connexion)

## Le besoin

Un petit studio veut montrer ses réalisations de façon éditoriale, être contacté pour de nouveaux
projets, et garder la main sur sa galerie : ajouter un chantier livré, retirer une ancienne
référence, sans toucher au code.

## Ce que fait le site

- **Galerie filtrable** par type de projet (objets, appartements, hôtels et restaurants), avec compteur par filtre et lieu du projet lu dans son titre.
- **Fiche projet** en plein écran (`<dialog>` natif) avec navigation précédent / suivant au clavier (← →, Échap).
- **Espace atelier** : connexion par jeton (JWT), barre d'édition, gestion des projets dans une fenêtre dédiée.
- **Ajout de projet** par glisser-déposer, aperçu immédiat, contrôle du format par signature binaire (JPG / PNG réels, pas seulement l'extension) et de la taille (4 Mo).
- **Retrait de projet** avec confirmation et mise à jour de la galerie sans rechargement.
- **Formulaire de contact** validé côté client, messages d'erreur accessibles.
- **États de chargement et d'erreur** : squelettes pendant le chargement, message clair si l'API ne répond pas.

## Choix de conception

- **Direction artistique minérale** : fond chaux, encre, accent terre cuite ; une seule famille, Public Sans. 
- **Rythme éditorial** plutôt qu'une grille uniforme : une colonne sur trois décalée, grands titres, numérotation des projets.
- **Accessibilité** : lien d'évitement, focus visibles, `aria-pressed` sur les filtres, `aria-live` sur les messages, dialogues natifs (piège du focus et Échap gérés par le navigateur), respect de `prefers-reduced-motion`.
- **Sans framework ni build** : HTML, CSS et JavaScript natifs, ~400 lignes de JS.

## Technique

| | |
|---|---|
| Front | HTML5, CSS (variables, grid, `color-mix`), JavaScript natif |
| API | REST : `GET /works`, `GET /categories`, `POST /works` (multipart), `DELETE /works/:id`, `POST /users/login` |
| Démo en ligne | `demo/demo-api.js` simule l'API dans le navigateur (le back-end Node n'est pas hébergé). En local, il se désactive et le vrai back-end répond sur `localhost:5678`. |

## Lancer en local

1. Démarrer le back-end (Node + SQLite) sur le port 5678.
2. Servir ce dossier avec n'importe quel serveur statique, par exemple `npx serve .`.

## Origine

Le projet part du brief « Portfolio d'architecte » de la formation Développeur web d'OpenClassrooms
(API fournie, front-end à réaliser). Identité, contenus, interface et code front ont ensuite été
entièrement repensés. Le studio, ses textes et ses chiffres sont fictifs ; les visuels proviennent
des ressources du brief.

---

Conçu et développé par [Diurn](https://diurnstudio.fr).

# Portfolio - Sophie Bluel

Portfolio professionnel de **Sophie Bluel**, architecte d'intérieur. Un site vitrine moderne et interactif présentant ses réalisations en design d'espace.

## À propos du projet

Ce projet est une application web complète permettant de :
- **Parcourir** les projets d'architecture d'intérieur avec une galerie dynamique
- **Filtrer** les projets par catégories (Objets, Appartements, Hôtels, Restaurants)
- **S'authentifier** via un système de login sécurisé
- **Gérer** les projets (ajouter/supprimer) dans une interface d'administration
- **Consulter** les coordonnées de contact

## Technologies utilisées

### Frontend
- **HTML5** - Structure sémantique
- **CSS3** - Mise en page et animations fluides
- **JavaScript (Vanilla)** - Logique interactive et gestion d'état
  - Récupération dynamique des données via API
  - Gestion du localStorage pour l'authentification
  - Manipulation du DOM
  - Gestion des événements

### API Backend
- Communication REST avec l'API
- Endpoints utilisés :
  - `GET /api/works` - Récupération des projets
  - `GET /api/categories` - Récupération des catégories
  - `POST/DELETE /api/works` - Gestion des projets
  - `POST /api/users/login` - Authentification

## Fonctionnalités implémentées

### Page d'accueil
- Présentation du designer
- Système de filtres dynamiques avec animations
- Animation de chargement (loader)
- Section contact
- Bouton "Retour en haut" flottant

### Authentification
- Page de login avec validation
- Sauvegarde du token JWT en localStorage
- Redirection automatique vers la page d'accueil après connexion
- Gestion des erreurs (identifiants incorrects, serveur inaccessible)
- Redirection automatique si l'utilisateur tente d'accéder à /login en étant déjà connecté

## 📂 Structure du projet

```
FrontEnd/
├── index/
│   ├── index.html          # Page d'accueil principale
│   ├── index.css           # Styles de l'accueil
│   └── index.js            # Logique métier (galerie, filtres, modale)
├── login/
│   ├── login.html          # Page de connexion
│   ├── login.css           # Styles du login
│   └── login.js            # Logique d'authentification
├── assets/
│   ├── images/             # Images du portfolio
│   └── icons/              # Icônes SVG
└── README.md               # Ce fichier
```

## 📝 Notes de développement

- Le token JWT est stocké dans `localStorage` sous la clé `token`
- L'authentification est vérifiée au chargement de la page
- Les anchors (`#portfolio`, `#contact`) permettent une navigation fluide
- Le système de filtres utilise des classes CSS pour l'animation
- La modale utilise une overlay pour bloquer les interactions externes

## 👨‍💻 Auteur

Développé par **Diurn** en tant que projet portfolio
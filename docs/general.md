# Documentation du Projet : pomoBEAK (FocusFlow)

## 1. Présentation du projet

### Fiche d'identité du projet

| Élément | Description | Statut |
| :--- | :--- | :--- |
| **Nom de l'application** | pomobeak | Confirmé |
| **Problème rencontré** | Difficulté à maintenir la concentration sur de longues périodes, mauvaise gestion du temps de travail et oubli de faire des pauses régulières. | Confirmé |
| **Contexte** | Application web personnelle de productivité basée sur la technique Pomodoro, avec un fort accent sur un design visuel premium (Glassmorphism). | Confirmé |
| **Objectif général** | Fournir un outil de gestion du temps esthétique, fluide et motivant pour améliorer la productivité quotidienne. | Confirmé |
| **Objectifs spécifiques** | - Chronométrer des sessions de focus et des pauses courtes.<br>- Gérer une liste de tâches avec estimation de temps.<br>- Suivre les statistiques quotidiennes (série de jours, temps total). | Confirmé |
| **Utilisateurs cibles** | Ouvert à tous (grand public). Ni SaaS commercial ni B2B. | Confirmé |
| **Besoins auxquels l'application répond** | - Besoin d'immersion (mode zen plein écran).<br>- Besoin de suivi (statistiques).<br>- Besoin d'organisation (gestion des tâches). | Confirmé |
| **Proposition de valeur** | Un minuteur Pomodoro intelligent et magnifique qui transforme la gestion du temps en une expérience visuelle et sonore premium. | Confirmé |
| **Périmètre du projet** | - Gestion du minuteur (Focus / Pause courte).<br>- Gestion des tâches avec CRUD basique.<br>- Profil utilisateur local et cloud (Supabase).<br>- Paramètres de thèmes et de sons personnalisés. | Confirmé |
| **Fonctionnalités hors périmètre** | Travail collaboratif en équipe, monétisation SaaS, intégrations tierces lourdes. | Confirmé |
| **Plateformes ciblées** | Application Web avec objectif de transition simple vers une PWA (Progressive Web App). | Confirmé |
| **Contraintes connues** | - L'API Audio des navigateurs (exige une interaction utilisateur pour lire un son).<br>- La synchronisation entre le stockage local (`localStorage`) et la base de données cloud (Supabase). | Confirmé |

---

## 2. Utilisateurs et Rôles

Puisque l'application est ouverte à tous sans modèle commercial (SaaS B2B/B2C), le système de rôles est relativement simple.

### Rôles identifiés

#### 1. Utilisateur Non-Connecté (Invité)
- **Description :** Toute personne qui arrive sur l'application sans s'être créée de compte.
- **Responsabilités :** Gérer ses propres tâches et sessions de manière éphémère ou locale sur son navigateur.
- **Fonctionnalités accessibles :** 
  - Lancer et gérer le minuteur.
  - Créer, modifier, supprimer des tâches (stockage local).
  - Modifier le thème et les sons (stockage local).
- **Restrictions :** Les données ne sont pas sauvegardées dans le Cloud. Si l'utilisateur vide le cache de son navigateur, il perd son historique.

#### 2. Utilisateur Connecté (Membre)
- **Description :** Utilisateur grand public ayant créé un compte (via email ou authentification tierce).
- **Responsabilités :** Maintenir sa productivité avec l'assurance de ne pas perdre ses données.
- **Fonctionnalités accessibles :** 
  - Toutes les fonctionnalités de l'invité.
  - Synchronisation Cloud des tâches et de l'historique de productivité.
  - Continuité de l'expérience sur différents appareils.
- **Restrictions :** Ne peut pas voir ni modifier les données des autres utilisateurs.

#### 3. Administrateur
- **Description :** Vous (le développeur/propriétaire).
- **Responsabilités :** Maintenir l'application, surveiller la base de données, vérifier la santé du système.
- **Fonctionnalités accessibles :** 
  - Tableau de bord d'administration (statistiques globales de la base de données).
  - Possibilité de gérer (bannir/supprimer) des comptes si nécessaire (modération).
- **Restrictions :** Aucune restriction technique, mais soumis au respect de la vie privée des utilisateurs.

### Matrice des fonctionnalités par rôle

| Fonctionnalité | Administrateur | Utilisateur Connecté | Invité |
| :--- | :---: | :---: | :---: |
| Lancer le minuteur | ✓ | ✓ | ✓ |
| Gérer ses tâches | ✓ | ✓ | ✓ (Local) |
| Personnaliser le thème | ✓ | ✓ | ✓ (Local) |
| Synchronisation Cloud | ✓ | ✓ | — |
| Voir statistiques globales | ✓ | — | — |
| Gérer les utilisateurs | ✓ | — | — |

---

### Questions pour valider l'Étape 2 :
1. Y a-t-il des fonctionnalités que vous souhaitez réserver **uniquement** aux utilisateurs connectés (par exemple : le choix de musiques personnalisées, le mode Zen) pour les inciter à créer un compte ? Ou bien tout est-il gratuit et accessible pour l'invité (stocké localement) ?
2. Le rôle d'Administrateur a-t-il besoin d'une interface spécifique sur l'application (`/admin`) ou gérez-vous tout directement depuis le panneau Supabase ?

> **Veuillez valider cette Étape 2 ou apporter vos corrections pour que nous puissions passer à l'Étape 3 (Fonctionnalités et exigences).**

---

## 3. Fonctionnalités et Exigences (Étape 3)

Voici la déclinaison des besoins en fonctionnalités précises (Exigences Fonctionnelles - EF) et non fonctionnelles (ENF).

### Exigences Fonctionnelles (EF)

| ID | Fonctionnalité | Description | Acteur | Priorité | Dépendances |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **EF01** | Minuteur Pomodoro | Lancer, mettre en pause, ou sauter un cycle (Focus/Pause Courte). | Tous | Haute | Aucune |
| **EF02** | Gestion des tâches (CRUD) | Créer, lire, modifier et supprimer des tâches avec des niveaux de priorité. | Tous | Haute | Aucune |
| **EF03** | Estimation de temps | Associer un nombre de sessions Pomodoro estimées à chaque tâche. | Tous | Moyenne | EF02 |
| **EF04** | Statistiques d'Activité | Consulter un tableau de bord avec le temps cumulé, la série (streak) et une Heatmap (30j, 90j, 1 an). | Tous | Haute | EF01, EF02 |
| **EF05** | Synchronisation Cloud | Sauvegarder les données de productivité sur le Cloud (Supabase). | Membre | Haute | Authentification |
| **EF06** | Accès Administrateur | Gérer la plateforme, visualiser le nombre d'inscrits et modérer depuis un panel via email `.env`. | Admin | Moyenne | Authentification |
| **EF07** | Thèmes et Audio | Personnaliser l'apparence (Glassmorphism) et les sons ambiants de l'application. | Tous | Basse | Aucune |
| **EF08** | PWA (Installabilité) | Installer l'application sur Desktop et Mobile comme une application native (`next-pwa`). | Tous | Moyenne | Aucune |
| **EF09** | Notifications in-app | Recevoir un feedback visuel (Toast) lors d'actions importantes (ex: Tâche créée). | Tous | Basse | Aucune |

### Exigences Non Fonctionnelles (ENF)

| ID | Catégorie | Description |
| :--- | :--- | :--- |
| **ENF01** | UI/UX (Esthétique) | L'application doit adopter une esthétique "Glassmorphism" premium avec des transitions fluides. |
| **ENF02** | Performance | L'interface doit être réactive, avec une gestion du temps côté client sans latence réseau. |
| **ENF03** | Compatibilité | L'application doit fonctionner sur les navigateurs récents (Chrome, Safari, Firefox) et mobiles. |
| **ENF04** | PWA (Hors-ligne partiel) | L'application doit pouvoir se charger rapidement grâce à un Service Worker, avec des icônes de manifeste. |

### Cas d'utilisation principal : Gérer une session de travail

- **Acteur principal :** Utilisateur (Invité ou Membre).
- **Préconditions :** L'utilisateur a ouvert l'application.
- **Déclencheur :** L'utilisateur crée une tâche et lance le minuteur.
- **Scénario nominal :**
  1. L'utilisateur ouvre le modal d'ajout de tâche et remplit les informations.
  2. L'application enregistre la tâche et affiche une notification ("Tâche créée avec succès").
  3. L'utilisateur sélectionne la tâche et démarre le minuteur Focus.
  4. Le temps s'écoule avec une interface visuelle zen (ring de couleur).
  5. À la fin, une alarme retentit et l'application bascule automatiquement en Pause Courte.
  6. Le temps de focus est ajouté aux statistiques (Heatmap + Temps cumulé).
- **Cas d'erreur :** L'alarme ne retentit pas si l'utilisateur n'a pas interagi avec la page (politique audio du navigateur).
- **Postconditions :** Les statistiques quotidiennes de l'utilisateur sont mises à jour (en local et/ou Cloud).

---

### Questions pour valider l'Étape 3 :
1. Les niveaux de priorité (Haute/Moyenne/Basse) vous semblent-ils corrects pour ces fonctionnalités ?
2. Y a-t-il un autre cas d'utilisation critique que vous aimeriez que je détaille (ex: Inscription, Accès Admin) ?

> **Veuillez valider cette Étape 3 ou apporter vos corrections pour que nous puissions passer à l'Étape 4 (Règles de gestion).**

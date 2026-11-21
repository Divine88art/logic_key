# My EDT – Gestionnaire de semaine & Habitudes (PWA)

Application web progressive (PWA) hors ligne à **deux univers** : organisation scolaire (6 jours) et gestion du temps libre & des habitudes quotidiennes (7 jours).

## Nouveautés & Fonctionnalités

### 🏝️ Capsule Dynamic Island & Multi-univers
- **Tap / Clic** : déplie ou replie la capsule pour afficher le créneau en cours/à suivre, les alertes devoirs ou l’avancement du jour, ainsi qu’une synthèse rapide de la semaine.
- **Appui long (Long Press ~550 ms)** : déclenche l’animation plein écran *glitch zoom-in* (respectant `prefers-reduced-motion`) et bascule entre les deux univers.
- **Intitulé personnalisable** : modification libre du nom de la classe/école (Univers 1) et du titre de l’Univers 2 directement depuis la capsule dépliée.

### 🎓 Univers 1 — Scolaire (Lundi → Samedi)
- **Grille étendue sur 6 jours** (bureau + onglet `Sam` sur mobile). Un clic sur une zone libre du Samedi (ou de n’importe quel jour) ouvre l’ajout de créneau pré-rempli sur ce jour et cette heure pour choisir une matière et sa durée.
- **Emploi du temps interactif** : carte dynamique « En cours / À suivre », barre de progression, gestion des matières (`🎨`) et impression A4 paysage.
- **📚 Mes devoirs** : recherche, filtres, pièces jointes photo compressées (IndexedDB), badges sur l’emploi du temps et rappels locaux (veille à 18 h et jour J à 7 h quand l’app est ouverte).
- **📊 Suivi des notes par semestre** :
  - **Interrogations** : saisie illimitée (`MoyInterros`).
  - **Devoirs** : 2 devoirs maximum par matière et par semestre (`Devoir 1`, `Devoir 2`).
  - **Mise en attente** : si une interrogation, le Devoir 1 ou le Devoir 2 manque dans une matière commencée, la moyenne de la matière et la moyenne générale du semestre restent **En attente**.
  - **Formule** : `Moyenne matière = (MoyInterros + Devoir 1 + Devoir 2) / 3`, puis moyenne générale pondérée par les coefficients personnalisables.
- **💡 Recommandations** : conseils personnalisés par matière selon les interrogations, devoirs et coefficients.

### 🌿 Univers 2 — Libre & Habitudes (Lundi → Dimanche)
- **Planning 7 jours vierge au départ** avec stockage indépendant (`edt-life-data`) et accentuation visuelle dédiée.
- **✅ Habitudes & Suivi** :
  - Validation quotidienne (« Fait aujourd’hui ») des créneaux planifiés sur la grille 7j.
  - Gestion d’habitudes quotidiennes sans heure fixe avec compteur de série (`🔥 X j de suite`).
  - Panoplie d’activités et d’habitudes prêtes à intégrer en un clic (Sport, Lecture, Méditation, Projets perso, etc.).
- **📈 Bilan semaine** : taux d’accomplissement du jour, régularité sur les 7 jours de la semaine en cours, heures planifiées et répartition par activité.

## Structure du projet

- `index.html` : structure sémantique, capsule Dynamic Island, vues des deux univers et modales.
- `style.css` : thème clair/sombre, accents dynamiques par univers, animations glitch/capsule, responsive et impression.
- `script.js` : logique applicative complète des deux univers.
- `sw.js` : service worker (cache `edt-v8`, hors ligne, notifications).
- `manifest.webmanifest` : métadonnées PWA.
- `icons/` : icônes `icon-192.png` et `icon-512.png`.

## Stockage local (navigateur)

- `edt-meta-v1` : univers actif et intitulés personnalisés.
- `edt-data` : emploi du temps et matières scolaires.
- `edt-life-data` : activités, créneaux 7j, habitudes quotidiennes et historique d’accomplissement.
- `edt-homework-v1` & `edt-homework-photos-v1` *(IndexedDB)* : devoirs et photos compressées.
- `edt-grades-v1` & `edt-grade-coefficients-v1` : notes semestrielles et coefficients.
- `edt-homework-reminders-v1` & `edt-homework-reminders-sent-v1` : réglages et historique des rappels.
- `edt-th` : préférence de thème clair/sombre.

## Déploiement et test

1. Placer `index.html`, `style.css`, `script.js`, `sw.js`, `manifest.webmanifest` et le dossier `icons/` dans le même répertoire.
2. Publier sur un hébergement **HTTPS** (ex. Netlify) ou lancer un serveur local (`http://localhost`).
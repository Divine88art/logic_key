# Mon emploi du temps – Terminale F3 (PWA)

Application web progressive (PWA) hors ligne dédiée aux élèves de Terminale F3 (Électrotechnique) pour gérer l’emploi du temps, les devoirs, les notes semestrielles et les recommandations de révision.

## Fonctionnalités

- **📅 Emploi du temps interactif** :
  - Vue semaine (bureau) et vue par jour avec onglets (mobile).
  - Carte dynamique « En cours / À suivre » avec barre de progression et compte à rebours.
  - Ajout, modification et suppression de créneaux horaires (détection des chevauchements).
  - Gestion personnalisée des matières (nom, emoji, couleur) et mode impression A4 paysage.
  - Thème clair / sombre manuel ou automatique.
- **📚 Mes devoirs** :
  - Ajout, modification, recherche texte, filtres par statut et par matière.
  - Pièces jointes photo compressées automatiquement et stockées localement dans IndexedDB (max. 8 Mo avant compression, redimensionnement 1400 px max).
  - Rappels locaux d’échéance (veille à 18 h et jour même à 7 h lorsque l’application est ouverte, sous réserve d’autorisation des notifications).
  - Badge du nombre de devoirs en cours affiché directement sur les cours de l’emploi du temps.
- **📊 Suivi des notes par semestre (Semestre 1 / Semestre 2)** :
  - **Interrogations** : saisie libre et illimitée via le bouton **« Ajouter une note d'interrogation »** avec calcul automatique de la moyenne d’interrogations (`MoyInterros`).
  - **Devoirs** : gestion stricte de **2 devoirs maximum par matière et par semestre** (`Devoir 1` et `Devoir 2`) via **« Ajouter un devoir »**.
  - **Mise en attente** : si une interrogation, le Devoir 1 ou le Devoir 2 manque dans une matière commencée, la moyenne de la matière et la moyenne générale du semestre sont mises **En attente** pour éviter de fausser les résultats.
  - **Formule de calcul** :
    - `Moyenne matière = (MoyInterros + Devoir 1 + Devoir 2) / 3`
    - `Moyenne coefficiée = Moyenne matière × Coefficient`
    - `Moyenne générale du semestre = Σ(Moyennes coefficiées) / Σ(Coefficients)`
  - Coefficients personnalisables par matière.
- **💡 Recommandations** :
  - Bilan semestriel basé sur les résultats complets ou signalement des matières en attente.
  - Vigilance précoce si les premières notes d’une matière en attente sont inférieures à 10/20.
  - Conseils différenciés entre interrogations et devoirs, classés par priorité et coefficient.

## Structure du projet

- `index.html` : structure sémantique de l’application et modales.
- `style.css` : styles, thème clair/sombre, responsive mobile et mise en page d’impression.
- `script.js` : logique applicative (emploi du temps, devoirs, IndexedDB, notifications, calcul des notes et recommandations).
- `sw.js` : service worker (cache `edt-v7`, mode hors ligne, gestion des clics sur notifications).
- `manifest.webmanifest` : métadonnées d’installation PWA.
- `icons/` : icônes `icon-192.png` et `icon-512.png`.

## Stockage local (navigateur)

Toutes les données restent stockées localement sur l’appareil :
- `edt-data` : emploi du temps et matières.
- `edt-homework-v1` : liste des devoirs.
- `edt-homework-photos-v1` *(IndexedDB)* : photos compressées des devoirs.
- `edt-grades-v1` : notes d’interrogations et devoirs par semestre.
- `edt-grade-coefficients-v1` : coefficients personnalisés.
- `edt-homework-reminders-v1` et `edt-homework-reminders-sent-v1` : réglages et historique des rappels.
- `edt-th` : préférence de thème.

*Note de compatibilité : les anciennes notes enregistrées sans type ni semestre sont automatiquement migrées vers le Semestre 1 en tant qu’interrogations afin de ne perdre aucune donnée.*

## Déploiement et test

1. Placer tous les fichiers (`index.html`, `style.css`, `script.js`, `sw.js`, `manifest.webmanifest`, `icons/`) dans le même dossier.
2. Publier sur un hébergement **HTTPS** (ex. Netlify) ou tester via un serveur local (`http://localhost`).
   - En ouverture directe via `file://`, l’interface et les données locales fonctionnent, mais le service worker et les notifications sont bloqués par le navigateur.
# BLOCHOST Theme — Pterodactyl v1.2

Thème moderne pour Pterodactyl Panel avec accent orange (#FF7D20), sidebar verticale, graphiques gradient, et **mode clair/sombre** complet.

## Installation en une commande

```bash
bash <(curl -s https://raw.githubusercontent.com/axlade/pterodactyl-blochost-theme/main/install.sh)
```

## Prérequis

- Pterodactyl Panel installé dans `/var/www/pterodactyl`
- Node.js + Yarn disponibles
- Accès root au serveur

> Blueprint est automatiquement installé par le script si absent.

## Fonctionnalités v1.2

| Zone | Changements |
|------|-------------|
| **Global** | Palette dark/light, accent orange, police Sora |
| **Mode clair/sombre** | Toggle ☀/🌙 persistant, transition fluide sur tout le panel |
| **Sidebar** | Navigation verticale fixe, hover orange, toggle thème intégré |
| **Console** | Header custom, graphiques gradient (CPU / RAM / Réseau) |
| **Fichiers** | Liste unifiée, icônes colorées, fond thémé |
| **Éditeur** | CodeMirror thémé |
| **Formulaires** | Inputs, selects, modales — tous thémés |
| **Réseau** | AllocationRow thémé, notes textarea adaptée |
| **Startup** | Commande de démarrage, variables, Docker image — thémés |
| **Paramètres** | Code debug (Node/UUID) thémé |
| **Planificateurs** | Schedules, tâches, modales — thémés |
| **Compte** | ContentBox, GreyRowBox, clés API/SSH — thémés |
| **Connexion** | Formulaire moderne plein écran |

## Mode clair / sombre

Le toggle ☀/🌙 est intégré en bas de la sidebar. Le choix est persisté dans `localStorage` et appliqué instantanément sur l'ensemble du panel via des variables CSS et un hook React partagé (`useTheme`).

## Structure du repo

```
pterodactyl-blochost-theme/
├── install.sh                    ← Script d'installation automatique
├── README.md
├── dist/
│   └── blochost.blueprint        ← Extension Blueprint packagée
└── files/                        ← Fichiers sources modifiés
    ├── tailwind.config.js
    ├── resources/scripts/
    │   ├── lib/
    │   │   └── useTheme.ts       ← Hook partagé light/dark mode
    │   ├── components/
    │   │   ├── NavigationBar.tsx
    │   │   ├── elements/         ← Button, Code, Input, Modal, Select…
    │   │   ├── server/           ← Console, Fichiers, Réseau, Startup…
    │   │   └── dashboard/        ← Compte, API keys, SSH, Recherche…
    │   └── blueprint/extensions/blochost/
    │       ├── Sidebar.tsx
    │       └── ServerInfoBar.tsx
    └── .blueprint/extensions/blochost/
        └── dashboard.css         ← Variables CSS dark/light
```

## Changelog

### v1.2
- Ajout du mode clair complet (toggle ☀/🌙 dans la sidebar)
- Variables CSS sur tout le panel (formulaires, modales, code, nav, schedules…)
- Boutons de puissance avec icône + libellé
- Suppression de l'icône cube du header serveur
- Graphiques console arrondis avec fill gradient

### v1.1
- Sidebar animée, graphiques gradient, install Blueprint inclus

### v1.0
- Release initiale

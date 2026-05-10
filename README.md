# BLOCHOST Theme — Pterodactyl

Thème sombre moderne pour Pterodactyl Panel avec accent orange (#FF7D20), sidebar verticale, et interface redesignée.

## Installation en une commande

```bash
bash <(curl -s https://raw.githubusercontent.com/axlade/pterodactyl-blochost-theme/main/install.sh)
```

## Prérequis

- Pterodactyl Panel installé dans `/var/www/pterodactyl`
- Blueprint installé
- Node.js + Yarn disponibles
- L'extension Blueprint `blochost` déjà installée (pour la sidebar et les hooks)

## Ce que le thème modifie

| Zone | Changements |
|------|-------------|
| **Global** | Palette gris neutre, blue→orange, police Sora |
| **Sidebar** | Navigation verticale fixe, hover orange |
| **Console** | Header custom, fond sombre, graphiques orange |
| **Fichiers** | Liste unifiée, icônes colorées, boutons orange |
| **Éditeur** | CodeMirror fond sombre, curseur orange |
| **Connexion** | Formulaire moderne plein écran |
| **Compte** | ContentBox, GreyRowBox thémés |
| **Réseau** | AllocationRow sans bleu-gris |
| **Startup** | TitledGreyBox thémé |

## Structure du repo

```
pterodactyl-blochost-theme/
├── install.sh          ← Script d'installation automatique
├── README.md
└── files/              ← Tous les fichiers sources modifiés
    ├── tailwind.config.js
    ├── resources/scripts/
    │   ├── components/
    │   └── blueprint/extensions/blochost/
    │       ├── Sidebar.tsx
    │       ├── ServerInfoBar.tsx
    │       ├── ServerRightPanel.tsx
    │       ├── HeroBanner.tsx
    │       └── Components.yml
    └── .blueprint/extensions/blochost/
        └── dashboard.css
```

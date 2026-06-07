#!/bin/bash
set -e

# ─────────────────────────────────────────────────────────────
#  BLOCHOST THEME — Script d'installation automatique
#  Usage : bash <(curl -s https://raw.githubusercontent.com/axlade/pterodactyl-blochost-theme/main/install.sh)
# ─────────────────────────────────────────────────────────────

REPO_RAW="https://raw.githubusercontent.com/axlade/pterodactyl-blochost-theme/main"
REPO_FILES="$REPO_RAW/files"
PTERO="/var/www/pterodactyl"
GREEN="\e[32m"
ORANGE="\e[33m"
RED="\e[31m"
BOLD="\e[1m"
RESET="\e[0m"

echo -e "${ORANGE}"
echo "  ██████╗ ██╗      ██████╗  ██████╗██╗  ██╗ ██████╗ ███████╗████████╗"
echo "  ██╔══██╗██║     ██╔═══██╗██╔════╝██║  ██║██╔═══██╗██╔════╝╚══██╔══╝"
echo "  ██████╔╝██║     ██║   ██║██║     ███████║██║   ██║███████╗   ██║   "
echo "  ██╔══██╗██║     ██║   ██║██║     ██╔══██║██║   ██║╚════██║   ██║   "
echo "  ██████╔╝███████╗╚██████╔╝╚██████╗██║  ██║╚██████╔╝███████║   ██║   "
echo "  ╚═════╝ ╚══════╝ ╚═════╝  ╚═════╝╚═╝  ╚═╝ ╚═════╝ ╚══════╝   ╚═╝   "
echo -e "${RESET}"
echo -e "  ${ORANGE}${BOLD}Thème Pterodactyl v1.2 — Installation complète${RESET}"
echo ""

# ── Vérifications préliminaires ─────────────────────────────
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}✗ Ce script doit être exécuté en root (sudo).${RESET}"
    exit 1
fi

if [ ! -d "$PTERO" ]; then
    echo -e "${RED}✗ Pterodactyl introuvable à $PTERO${RESET}"
    exit 1
fi

if ! command -v curl &>/dev/null; then
    echo -e "${RED}✗ curl est requis. Installe-le avec : apt install curl${RESET}"
    exit 1
fi

if ! command -v unzip &>/dev/null; then
    echo -e "${ORANGE}→${RESET} Installation de unzip..."
    apt-get install -y unzip -q
fi

# ── Node.js ≥ 22 ────────────────────────────────────────────
NODE_OK=false
if command -v node &>/dev/null; then
    NODE_MAJOR=$(node -e "process.stdout.write(String(parseInt(process.version.slice(1))))" 2>/dev/null)
    if [ "${NODE_MAJOR:-0}" -ge 22 ] 2>/dev/null; then
        NODE_OK=true
    fi
fi

if [ "$NODE_OK" = false ]; then
    echo -e "${ORANGE}→${RESET} Installation de Node.js 22..."
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash - > /dev/null 2>&1
    apt-get install -y nodejs -q
    echo -e "${GREEN}✓${RESET} Node.js $(node -v) installé"
else
    echo -e "${GREEN}✓${RESET} Node.js $(node -v) déjà présent"
fi

# ── Yarn ────────────────────────────────────────────────────
if ! command -v yarn &>/dev/null; then
    echo -e "${ORANGE}→${RESET} Installation de yarn..."
    npm install -g yarn -q
    echo -e "${GREEN}✓${RESET} yarn $(yarn -v) installé"
else
    echo -e "${GREEN}✓${RESET} yarn $(yarn -v) déjà présent"
fi

# ── Dépendances node_modules ────────────────────────────────
if [ ! -d "$PTERO/node_modules" ] || [ ! -d "$PTERO/node_modules/react" ]; then
    echo -e "${ORANGE}→${RESET} Installation des dépendances npm (yarn install)..."
    cd "$PTERO" && yarn install --frozen-lockfile 2>&1 | tail -5
    echo -e "${GREEN}✓${RESET} Dépendances installées"
fi

echo -e "${ORANGE}→${RESET} Pterodactyl détecté : $PTERO"
echo ""

# ════════════════════════════════════════════════════════════
#  ÉTAPE 1 — Installation de Blueprint
# ════════════════════════════════════════════════════════════
echo -e "${ORANGE}${BOLD}[ 1/4 ] Blueprint${RESET}"

if command -v blueprint &>/dev/null; then
    BP_VER=$(blueprint -v 2>/dev/null || echo "inconnu")
    echo -e "  ${GREEN}✓${RESET} Blueprint déjà installé (version : $BP_VER)"
else
    echo -e "  ${ORANGE}→${RESET} Téléchargement de Blueprint..."
    cd "$PTERO"

    BP_ZIP_URL="https://github.com/BlueprintFramework/framework/releases/latest/download/release.zip"
    curl -fsSL "$BP_ZIP_URL" -o blueprint.zip
    unzip -o blueprint.zip -d . > /dev/null
    rm -f blueprint.zip

    chmod +x blueprint.sh
    echo -e "  ${ORANGE}→${RESET} Installation de Blueprint (peut prendre quelques minutes)..."
    bash blueprint.sh

    if ! command -v blueprint &>/dev/null; then
        echo -e "  ${RED}✗ Échec de l'installation de Blueprint${RESET}"
        exit 1
    fi

    BP_VER=$(blueprint -v 2>/dev/null || echo "inconnu")
    echo -e "  ${GREEN}✓${RESET} Blueprint installé (version : $BP_VER)"
fi

echo ""

# ════════════════════════════════════════════════════════════
#  ÉTAPE 2 — Installation de l'extension Blueprint blochost
# ════════════════════════════════════════════════════════════
echo -e "${ORANGE}${BOLD}[ 2/4 ] Extension Blueprint blochost${RESET}"

BLUEPRINT_FILE="$PTERO/blochost.blueprint"
echo -e "  ${ORANGE}→${RESET} Téléchargement de blochost.blueprint v1.2..."
curl -fsSL "$REPO_RAW/dist/blochost.blueprint" -o "$BLUEPRINT_FILE"

echo -e "  ${ORANGE}→${RESET} Installation de l'extension via Blueprint..."
cd "$PTERO"
blueprint -install blochost

echo -e "  ${GREEN}✓${RESET} Extension blochost installée"
echo ""

# ════════════════════════════════════════════════════════════
#  ÉTAPE 3 — Fichiers du thème (composants Pterodactyl core)
# ════════════════════════════════════════════════════════════
echo -e "${ORANGE}${BOLD}[ 3/4 ] Fichiers du thème${RESET}"
echo -e "  ${ORANGE}→${RESET} Téléchargement des fichiers..."
echo ""

FILES=(
    # Config
    "tailwind.config.js"

    # Lib partagée (hook thème light/dark)
    "resources/scripts/lib/useTheme.ts"

    # Auth
    "resources/scripts/components/auth/LoginContainer.tsx"
    "resources/scripts/components/auth/LoginFormContainer.tsx"
    "resources/scripts/components/auth/ForgotPasswordContainer.tsx"

    # Navigation
    "resources/scripts/components/NavigationBar.tsx"

    # Éléments UI
    "resources/scripts/components/elements/Button.tsx"
    "resources/scripts/components/elements/Code.tsx"
    "resources/scripts/components/elements/ContentBox.tsx"
    "resources/scripts/components/elements/CodemirrorEditor.tsx"
    "resources/scripts/components/elements/GreyRowBox.tsx"
    "resources/scripts/components/elements/Input.tsx"
    "resources/scripts/components/elements/Modal.tsx"
    "resources/scripts/components/elements/PageContentBlock.tsx"
    "resources/scripts/components/elements/Select.tsx"
    "resources/scripts/components/elements/SubNavigation.tsx"
    "resources/scripts/components/elements/TitledGreyBox.tsx"
    "resources/scripts/components/elements/button/style.module.css"

    # Console & graphiques
    "resources/scripts/components/server/console/chart.ts"
    "resources/scripts/components/server/console/ChartBlock.tsx"
    "resources/scripts/components/server/console/Console.tsx"
    "resources/scripts/components/server/console/ServerConsoleContainer.tsx"
    "resources/scripts/components/server/console/ServerDetailsBlock.tsx"
    "resources/scripts/components/server/console/StatGraphs.tsx"

    # Fichiers
    "resources/scripts/components/server/files/FileManagerContainer.tsx"
    "resources/scripts/components/server/files/FileObjectRow.tsx"
    "resources/scripts/components/server/files/style.module.css"

    # Réseau
    "resources/scripts/components/server/network/AllocationRow.tsx"

    # Démarrage
    "resources/scripts/components/server/startup/StartupContainer.tsx"
    "resources/scripts/components/server/startup/VariableBox.tsx"

    # Paramètres
    "resources/scripts/components/server/settings/SettingsContainer.tsx"

    # Planificateurs
    "resources/scripts/components/server/schedules/ScheduleEditContainer.tsx"
    "resources/scripts/components/server/schedules/EditScheduleModal.tsx"

    # Sauvegardes
    "resources/scripts/components/server/backups/CreateBackupButton.tsx"

    # Dashboard / compte
    "resources/scripts/components/dashboard/AccountApiContainer.tsx"
    "resources/scripts/components/dashboard/ApiKeyModal.tsx"
    "resources/scripts/components/dashboard/search/SearchModal.tsx"
    "resources/scripts/components/dashboard/ssh/AccountSSHContainer.tsx"

    # Blueprint extensions
    "resources/scripts/blueprint/extensions/blochost/Sidebar.tsx"
    "resources/scripts/blueprint/extensions/blochost/ServerInfoBar.tsx"
    "resources/scripts/blueprint/extensions/blochost/ServerRightPanel.tsx"
    "resources/scripts/blueprint/extensions/blochost/HeroBanner.tsx"
    "resources/scripts/blueprint/extensions/blochost/Components.yml"
)

TOTAL=${#FILES[@]}
COUNT=0
ERRORS=0

for FILE in "${FILES[@]}"; do
    COUNT=$((COUNT + 1))
    DEST="$PTERO/$FILE"
    mkdir -p "$(dirname "$DEST")"

    if curl -fsSL "$REPO_FILES/$FILE" -o "$DEST"; then
        echo -e "  ${GREEN}✓${RESET} [$COUNT/$TOTAL] $FILE"
    else
        echo -e "  ${RED}✗${RESET} [$COUNT/$TOTAL] Échec : $FILE"
        ERRORS=$((ERRORS + 1))
    fi
done

if [ "$ERRORS" -gt 0 ]; then
    echo ""
    echo -e "${RED}✗ $ERRORS fichier(s) ont échoué. Vérifie les erreurs ci-dessus.${RESET}"
    exit 1
fi

echo ""

# ════════════════════════════════════════════════════════════
#  ÉTAPE 4 — Compilation & cache
# ════════════════════════════════════════════════════════════
echo -e "${ORANGE}${BOLD}[ 4/4 ] Compilation du frontend${RESET}"
cd "$PTERO"

echo -e "  ${ORANGE}→${RESET} yarn build:production..."
export NODE_OPTIONS=--openssl-legacy-provider
cd "$PTERO" && yarn build:production

echo -e "  ${ORANGE}→${RESET} Nettoyage du cache Laravel..."
php artisan optimize:clear

# Fix permissions
chown -R www-data:www-data "$PTERO/public" "$PTERO/storage" 2>/dev/null || true

echo ""
echo -e "${GREEN}${BOLD}✅ Thème BLOCHOST v1.2 installé avec succès !${RESET}"
echo ""
echo -e "  ${ORANGE}Blueprint :${RESET} $(blueprint -v 2>/dev/null || echo 'ok')"
echo -e "  ${ORANGE}Thème    :${RESET} v1.2 — dark/light mode | sidebar | graphiques gradient | mode clair complet"
echo ""

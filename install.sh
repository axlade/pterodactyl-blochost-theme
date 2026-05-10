#!/bin/bash
set -e

# ─────────────────────────────────────────────────────────────
#  BLOCHOST THEME — Script d'installation automatique
#  Usage : bash <(curl -s https://raw.githubusercontent.com/axlade/pterodactyl-blochost-theme/main/install.sh)
# ─────────────────────────────────────────────────────────────

REPO="https://raw.githubusercontent.com/axlade/pterodactyl-blochost-theme/main/files"
PTERO="/var/www/pterodactyl"
GREEN="\e[32m"
ORANGE="\e[33m"
RED="\e[31m"
RESET="\e[0m"

echo -e "${ORANGE}"
echo "  ██████╗ ██╗      ██████╗  ██████╗██╗  ██╗ ██████╗ ███████╗████████╗"
echo "  ██╔══██╗██║     ██╔═══██╗██╔════╝██║  ██║██╔═══██╗██╔════╝╚══██╔══╝"
echo "  ██████╔╝██║     ██║   ██║██║     ███████║██║   ██║███████╗   ██║   "
echo "  ██╔══██╗██║     ██║   ██║██║     ██╔══██║██║   ██║╚════██║   ██║   "
echo "  ██████╔╝███████╗╚██████╔╝╚██████╗██║  ██║╚██████╔╝███████║   ██║   "
echo "  ╚═════╝ ╚══════╝ ╚═════╝  ╚═════╝╚═╝  ╚═╝ ╚═════╝ ╚══════╝   ╚═╝   "
echo -e "${RESET}"
echo -e "  ${ORANGE}Thème Pterodactyl — Installation${RESET}"
echo ""

# Vérifications
if [ ! -d "$PTERO" ]; then
    echo -e "${RED}✗ Pterodactyl introuvable à $PTERO${RESET}"
    exit 1
fi

if ! command -v curl &>/dev/null; then
    echo -e "${RED}✗ curl est requis${RESET}"
    exit 1
fi

echo -e "${ORANGE}→${RESET} Pterodactyl détecté : $PTERO"
echo -e "${ORANGE}→${RESET} Téléchargement des fichiers du thème..."
echo ""

# Liste de tous les fichiers à télécharger
FILES=(
    "tailwind.config.js"
    "resources/scripts/components/auth/LoginContainer.tsx"
    "resources/scripts/components/auth/LoginFormContainer.tsx"
    "resources/scripts/components/auth/ForgotPasswordContainer.tsx"
    "resources/scripts/components/elements/Button.tsx"
    "resources/scripts/components/elements/ContentBox.tsx"
    "resources/scripts/components/elements/CodemirrorEditor.tsx"
    "resources/scripts/components/elements/GreyRowBox.tsx"
    "resources/scripts/components/elements/PageContentBlock.tsx"
    "resources/scripts/components/elements/TitledGreyBox.tsx"
    "resources/scripts/components/elements/button/style.module.css"
    "resources/scripts/components/server/console/chart.ts"
    "resources/scripts/components/server/console/ChartBlock.tsx"
    "resources/scripts/components/server/console/Console.tsx"
    "resources/scripts/components/server/console/ServerConsoleContainer.tsx"
    "resources/scripts/components/server/console/ServerDetailsBlock.tsx"
    "resources/scripts/components/server/console/StatGraphs.tsx"
    "resources/scripts/components/server/files/FileManagerContainer.tsx"
    "resources/scripts/components/server/files/FileObjectRow.tsx"
    "resources/scripts/components/server/files/style.module.css"
    "resources/scripts/components/server/network/AllocationRow.tsx"
    "resources/scripts/components/server/startup/StartupContainer.tsx"
    "resources/scripts/components/dashboard/AccountApiContainer.tsx"
    "resources/scripts/components/dashboard/ssh/AccountSSHContainer.tsx"
    "resources/scripts/blueprint/extensions/blochost/Sidebar.tsx"
    "resources/scripts/blueprint/extensions/blochost/ServerInfoBar.tsx"
    "resources/scripts/blueprint/extensions/blochost/ServerRightPanel.tsx"
    "resources/scripts/blueprint/extensions/blochost/HeroBanner.tsx"
    "resources/scripts/blueprint/extensions/blochost/Components.yml"
    ".blueprint/extensions/blochost/dashboard.css"
)

TOTAL=${#FILES[@]}
COUNT=0

for FILE in "${FILES[@]}"; do
    COUNT=$((COUNT + 1))
    DEST="$PTERO/$FILE"
    mkdir -p "$(dirname "$DEST")"

    if curl -fsSL "$REPO/$FILE" -o "$DEST"; then
        echo -e "  ${GREEN}✓${RESET} [$COUNT/$TOTAL] $FILE"
    else
        echo -e "  ${RED}✗${RESET} [$COUNT/$TOTAL] Échec : $FILE"
    fi
done

echo ""
echo -e "${ORANGE}→${RESET} Compilation du frontend..."
cd "$PTERO"
NODE_OPTIONS=--openssl-legacy-provider yarn build:production

echo ""
echo -e "${ORANGE}→${RESET} Nettoyage du cache Laravel..."
php artisan optimize:clear

echo ""
echo -e "${GREEN}✅ Thème BLOCHOST installé avec succès !${RESET}"
echo ""

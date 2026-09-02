#!/bin/bash
# ── Post-Create Script ─────────────────────────────────────────
# Runs once after the devcontainer is first created.

set -e

WORKSPACE_DIR=$(cd "$(dirname "$0")/.." && pwd)

# The named volume keeps Codex login and conversation history across rebuilds.
sudo mkdir -p /home/node/.codex
sudo chown -R node:node /home/node/.codex

echo "═══════════════════════════════════════════════════════════"
echo "  FrigateViewCard DevContainer - Initial Setup"
echo "═══════════════════════════════════════════════════════════"

# ── Copy Home Assistant config files ──────────────────────────
echo ""
echo "→ Setting up Home Assistant configuration..."
if [ -d "/config" ]; then
  # Use sudo because /config is owned by root (shared volume with HA container)
  sudo cp -rn "$WORKSPACE_DIR/.devcontainer/homeassistant/"* /config/ 2>/dev/null || true
  # Create themes directory if it doesn't exist
  sudo mkdir -p /config/themes
  # Create www directory for custom cards
  sudo mkdir -p /config/www
  # Ensure the node user can access these directories going forward
  sudo chown -R node:node /config/themes /config/www 2>/dev/null || true
  echo "  ✓ Home Assistant config copied"
else
  echo "  ⚠ /config not available yet (will be set up on first HA start)"
fi

# ── Install Node.js dependencies (if package.json exists) ─────
echo ""
echo "→ Checking for Node.js dependencies..."
if [ -f "$WORKSPACE_DIR/package.json" ]; then
  cd "$WORKSPACE_DIR"
  npm install --silent 2>/dev/null || echo "  ⚠ No npm dependencies to install"
else
  echo "  ✓ No package.json found (standalone card - no build step needed)"
fi

# ── Create helper scripts ─────────────────────────────────────
echo ""
echo "→ Creating helper scripts..."

if [ -n "$WORKSPACE_DIR" ]; then
  # Script to sync card to HA www directory
  cat > "$WORKSPACE_DIR/.devcontainer/sync-card.sh" << 'SYNC_SCRIPT'
#!/bin/bash
# Sync the card assets to Home Assistant's www directory
# Run this after building the dist assets

WORKSPACE_DIR=$(cd "$(dirname "$0")/.." && pwd)
CARD_FILE="$WORKSPACE_DIR/dist/frigate-view-card.js"
EDITOR_FILE="$WORKSPACE_DIR/dist/frigate-view-card-editor.js"
HLS_FILE="$WORKSPACE_DIR/dist/frigate-view-card-hls-1.5.17.js"
HLS_LICENSE_FILE="$WORKSPACE_DIR/dist/frigate-view-card-hls-1.5.17.LICENSE.txt"

for ASSET_FILE in "$CARD_FILE" "$EDITOR_FILE" "$HLS_FILE" "$HLS_LICENSE_FILE"; do
  if [ ! -f "$ASSET_FILE" ]; then
    echo "Error: $(basename "$ASSET_FILE") not found in $WORKSPACE_DIR/dist"
    exit 1
  fi
done

# Copy to HA www directory
if [ -d "/config/www" ]; then
  cp "$CARD_FILE" "$EDITOR_FILE" "$HLS_FILE" "$HLS_LICENSE_FILE" /config/www/
  echo "✓ Card assets synced to /config/www"
  echo "  Refresh Home Assistant browser cache (Ctrl+Shift+R) to see changes"
else
  echo "Error: /config/www not found. Is Home Assistant running?"
  exit 1
fi
SYNC_SCRIPT
  chmod +x "$WORKSPACE_DIR/.devcontainer/sync-card.sh"

  # Script to watch for changes and auto-sync
  cat > "$WORKSPACE_DIR/.devcontainer/watch-card.sh" << 'WATCH_SCRIPT'
#!/bin/bash
# Watch for card builds and auto-sync all dist assets to HA
# Usage: bash .devcontainer/watch-card.sh

WORKSPACE_DIR=$(cd "$(dirname "$0")/.." && pwd)
CARD_FILE="$WORKSPACE_DIR/dist/frigate-view-card.js"
EDITOR_FILE="$WORKSPACE_DIR/dist/frigate-view-card-editor.js"
HLS_FILE="$WORKSPACE_DIR/dist/frigate-view-card-hls-1.5.17.js"
HLS_LICENSE_FILE="$WORKSPACE_DIR/dist/frigate-view-card-hls-1.5.17.LICENSE.txt"
ASSET_FILES=("$CARD_FILE" "$EDITOR_FILE" "$HLS_FILE" "$HLS_LICENSE_FILE")

for ASSET_FILE in "${ASSET_FILES[@]}"; do
  if [ ! -f "$ASSET_FILE" ]; then
    echo "Error: $(basename "$ASSET_FILE") not found"
    exit 1
  fi
done

sync_card_assets() {
  cp "${ASSET_FILES[@]}" /config/www/
}

echo "Watching for changes to dist/frigate-view-card.js..."
echo "Press Ctrl+C to stop"
echo ""

# Initial sync
sync_card_assets 2>/dev/null && echo "✓ Initial sync complete" || echo "⚠ /config/www not available yet"

# Watch loop using inotifywait if available, otherwise polling
if command -v inotifywait &> /dev/null; then
  while inotifywait -e modify "$CARD_FILE" 2>/dev/null; do
    sync_card_assets
    echo "✓ $(date +%H:%M:%S) - Card synced"
  done
else
  LAST_MOD=""
  while true; do
    CURRENT_MOD=$(stat -c %Y "$CARD_FILE" 2>/dev/null || stat -f %m "$CARD_FILE" 2>/dev/null)
    if [ "$CURRENT_MOD" != "$LAST_MOD" ] && [ -n "$LAST_MOD" ]; then
      sync_card_assets 2>/dev/null && echo "✓ $(date +%H:%M:%S) - Card synced"
    fi
    LAST_MOD="$CURRENT_MOD"
    sleep 2
  done
fi
WATCH_SCRIPT
  chmod +x "$WORKSPACE_DIR/.devcontainer/watch-card.sh"

  echo "  ✓ sync-card.sh created"
  echo "  ✓ watch-card.sh created"
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  Setup Complete!"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "Next steps:"
echo "  1. Wait for Home Assistant and Frigate to start (~1-2 minutes)"
echo "  2. Open Home Assistant at http://localhost:8123"
echo "  3. Create your HA user account on first visit"
echo "  4. Run: bash .devcontainer/sync-card.sh to deploy the card"
echo "  5. Add the FrigateViewCard to a dashboard"
echo ""

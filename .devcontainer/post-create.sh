#!/bin/bash
# ── Post-Create Script ─────────────────────────────────────────
# Runs once after the devcontainer is first created.

set -e

echo "═══════════════════════════════════════════════════════════"
echo "  FrigateViewCard DevContainer - Initial Setup"
echo "═══════════════════════════════════════════════════════════"

# ── Copy Home Assistant config files ──────────────────────────
echo ""
echo "→ Setting up Home Assistant configuration..."
if [ -d "/config" ]; then
  cp -rn /workspaces/*/FrigateViewCard/.devcontainer/homeassistant/* /config/ 2>/dev/null || true
  # Create themes directory if it doesn't exist
  mkdir -p /config/themes
  # Create www directory for custom cards
  mkdir -p /config/www
  echo "  ✓ Home Assistant config copied"
else
  echo "  ⚠ /config not available yet (will be set up on first HA start)"
fi

# ── Install Node.js dependencies (if package.json exists) ─────
echo ""
echo "→ Checking for Node.js dependencies..."
WORKSPACE=$(find /workspaces -maxdepth 2 -name "package.json" -type f 2>/dev/null | head -1)
if [ -n "$WORKSPACE" ]; then
  cd "$(dirname "$WORKSPACE")"
  if [ -f "package.json" ]; then
    npm install --silent 2>/dev/null || echo "  ⚠ No npm dependencies to install"
  fi
else
  echo "  ✓ No package.json found (standalone card - no build step needed)"
fi

# ── Create helper scripts ─────────────────────────────────────
echo ""
echo "→ Creating helper scripts..."
WORKSPACE_DIR=$(find /workspaces -maxdepth 2 -name "frigate-view-card.js" -type f 2>/dev/null | head -1 | xargs dirname 2>/dev/null)

if [ -n "$WORKSPACE_DIR" ]; then
  # Script to sync card to HA www directory
  cat > "$WORKSPACE_DIR/.devcontainer/sync-card.sh" << 'SYNC_SCRIPT'
#!/bin/bash
# Sync the card file to Home Assistant's www directory
# Run this after making changes to frigate-view-card.js

WORKSPACE_DIR=$(cd "$(dirname "$0")/.." && pwd)
CARD_FILE="$WORKSPACE_DIR/frigate-view-card.js"

if [ ! -f "$CARD_FILE" ]; then
  echo "Error: frigate-view-card.js not found in $WORKSPACE_DIR"
  exit 1
fi

# Copy to HA www directory
if [ -d "/config/www" ]; then
  cp "$CARD_FILE" /config/www/frigate-view-card.js
  echo "✓ Card synced to /config/www/frigate-view-card.js"
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
# Watch for changes to frigate-view-card.js and auto-sync to HA
# Usage: bash .devcontainer/watch-card.sh

WORKSPACE_DIR=$(cd "$(dirname "$0")/.." && pwd)
CARD_FILE="$WORKSPACE_DIR/frigate-view-card.js"

if [ ! -f "$CARD_FILE" ]; then
  echo "Error: frigate-view-card.js not found"
  exit 1
fi

echo "Watching for changes to frigate-view-card.js..."
echo "Press Ctrl+C to stop"
echo ""

# Initial sync
cp "$CARD_FILE" /config/www/frigate-view-card.js 2>/dev/null && echo "✓ Initial sync complete" || echo "⚠ /config/www not available yet"

# Watch loop using inotifywait if available, otherwise polling
if command -v inotifywait &> /dev/null; then
  while inotifywait -e modify "$CARD_FILE" 2>/dev/null; do
    cp "$CARD_FILE" /config/www/frigate-view-card.js
    echo "✓ $(date +%H:%M:%S) - Card synced"
  done
else
  LAST_MOD=""
  while true; do
    CURRENT_MOD=$(stat -c %Y "$CARD_FILE" 2>/dev/null || stat -f %m "$CARD_FILE" 2>/dev/null)
    if [ "$CURRENT_MOD" != "$LAST_MOD" ] && [ -n "$LAST_MOD" ]; then
      cp "$CARD_FILE" /config/www/frigate-view-card.js 2>/dev/null && echo "✓ $(date +%H:%M:%S) - Card synced"
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
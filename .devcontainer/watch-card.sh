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

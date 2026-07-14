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

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

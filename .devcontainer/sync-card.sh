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

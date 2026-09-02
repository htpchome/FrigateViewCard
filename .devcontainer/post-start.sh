#!/bin/bash
# ── Post-Start Script ──────────────────────────────────────────
# Runs every time the devcontainer starts (after post-create).

set -e

# Keep the persistent Codex data volume writable after container recreation.
sudo mkdir -p /home/node/.codex
sudo chown -R node:node /home/node/.codex

echo "═══════════════════════════════════════════════════════════"
echo "  FrigateViewCard DevContainer - Starting"
echo "═══════════════════════════════════════════════════════════"

# ── Ensure HA config directories exist ────────────────────────
if [ -d "/config" ]; then
  mkdir -p /config/themes
  mkdir -p /config/www
  
  # Copy HA config if not already present
  WORKSPACE_DIR=$(cd "$(dirname "$0")/.." && pwd)
  if [ -n "$WORKSPACE_DIR" ] && [ ! -f "/config/configuration.yaml" ]; then
    cp -rn "$WORKSPACE_DIR/.devcontainer/homeassistant/"* /config/ 2>/dev/null || true
    echo "✓ Home Assistant config initialized"
  fi
  
  # Auto-sync card on startup
  if [ -n "$WORKSPACE_DIR" ] &&
    [ -f "$WORKSPACE_DIR/dist/frigate-view-card.js" ] &&
    [ -f "$WORKSPACE_DIR/dist/frigate-view-card-hls-1.5.17.js" ] &&
    [ -f "$WORKSPACE_DIR/dist/frigate-view-card-hls-1.5.17.LICENSE.txt" ]; then
    cp \
      "$WORKSPACE_DIR/dist/frigate-view-card.js" \
      "$WORKSPACE_DIR/dist/frigate-view-card-hls-1.5.17.js" \
      "$WORKSPACE_DIR/dist/frigate-view-card-hls-1.5.17.LICENSE.txt" \
      /config/www/
    echo "✓ Card assets synced to Home Assistant"
  fi
fi

# ── Wait for services to be ready ─────────────────────────────
echo ""
echo "→ Waiting for services..."

# Wait for Frigate
for i in {1..30}; do
  if curl -s http://frigate:5000/api/version > /dev/null 2>&1; then
    echo "  ✓ Frigate is ready"
    break
  fi
  if [ $i -eq 30 ]; then
    echo "  ⚠ Frigate not responding yet (may still be starting)"
  fi
  sleep 2
done

# Wait for Home Assistant
for i in {1..30}; do
  if curl -s http://homeassistant:8123 > /dev/null 2>&1; then
    echo "  ✓ Home Assistant is ready"
    break
  fi
  if [ $i -eq 30 ]; then
    echo "  ⚠ Home Assistant not responding yet (may still be starting)"
  fi
  sleep 2
done

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  DevContainer Ready!"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "Services:"
echo "  • Home Assistant: http://localhost:8123"
echo "  • Frigate:        http://localhost:5000"
echo ""
echo "Development commands:"
echo "  • bash .devcontainer/sync-card.sh   - Deploy card to HA"
echo "  • bash .devcontainer/watch-card.sh  - Auto-sync on changes"
echo ""

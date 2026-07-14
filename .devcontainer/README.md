# FrigateViewCard DevContainer

A complete development environment for building and testing the FrigateViewCard custom card for Home Assistant with Frigate NVR integration.

## What's Included

| Service | Port | Description |
|---------|------|-------------|
| **Home Assistant** | `8123` | Full Home Assistant instance with Frigate integration |
| **Frigate NVR** | `5000` | Frigate web UI with 3 demo cameras |
| **go2rtc** | `8554`, `1984` | WebRTC streaming for live camera feeds |
| **Dev Container** | - | Node.js 20 development environment |

## Quick Start

### 1. Open in DevContainer

**VS Code:**
1. Install the [Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)
2. Open this project in VS Code
3. Press `F1` → "Dev Containers: Reopen in Container"
4. Wait for the container to build (~2-3 minutes first time)

**GitHub Codespaces:**
1. Click the green "Code" button on GitHub
2. Select "Codespaces" tab
3. Click "Create codespace on main"

### 2. Wait for Services to Start

After the container opens, wait 1-2 minutes for all services to initialize. You'll see status messages in the terminal.

### 3. Access Home Assistant

Open your browser to **http://localhost:8123**

On first visit, create a new user account:
- Name: `admin` (or whatever you prefer)
- Password: `admin` (or whatever you prefer)
- Location: Skip or set your location

### 4. Deploy the Card

In the VS Code terminal, run:

```bash
bash .devcontainer/sync-card.sh
```

This copies `frigate-view-card.js` to Home Assistant's `/config/www/` directory.

### 5. Add the Card to a Dashboard

1. In Home Assistant, go to **Settings → Dashboards**
2. Click **Add Dashboard** → Name it "Frigate" → Create
3. Open the new dashboard and click the pencil icon to edit
4. Click **Add Card** → **Manual**
5. Paste this configuration:

```yaml
type: custom:frigate-view-card
cameras:
  - entity: camera.front_door
    name: Front Door
  - entity: camera.backyard
    name: Backyard
  - entity: camera.driveway
    name: Driveway
title: Frigate Cameras
window_days: 3
theme: default
```

6. Click **Save**

## Development Workflow

### Manual Sync (after each change)

```bash
bash .devcontainer/sync-card.sh
```

Then hard-refresh your browser (`Ctrl+Shift+R` or `Cmd+Shift+R`).

### Auto-Sync (watch mode)

```bash
bash .devcontainer/watch-card.sh
```

This automatically syncs the card whenever you save changes to `frigate-view-card.js`.

### Viewing Logs

**Home Assistant logs:**
```bash
docker exec -it homeassistant tail -f /config/home-assistant.log
```

**Frigate logs:**
```bash
docker exec -it frigate tail -f /dev/shm/logs/frigate.log
```

Or from within the devcontainer:
```bash
# HA logs (if /config is mounted)
cat /config/home-assistant.log
```

## Demo Cameras

The devcontainer includes 3 pre-configured demo cameras using public test videos:

| Camera | Entity | Objects Tracked |
|--------|--------|-----------------|
| Front Door | `camera.front_door` | person, car, dog, cat |
| Backyard | `camera.backyard` | person, dog, bird |
| Driveway | `camera.driveway` | person, car, truck |

These use sample videos from Google's public storage as RTSP sources via go2rtc.

### Using Your Own Cameras

Edit `.devcontainer/frigate/config.yml` and replace the demo streams with your actual RTSP URLs:

```yaml
go2rtc:
  streams:
    my_camera:
      - "rtsp://username:password@192.168.1.100:554/stream"
```

## File Structure

```
.devcontainer/
├── devcontainer.json          # DevContainer configuration
├── docker-compose.yml         # Docker services definition
├── post-create.sh             # Runs once on first container creation
├── post-start.sh              # Runs on every container start
├── sync-card.sh               # Manual card deployment script
├── watch-card.sh              # Auto-sync watch script
├── README.md                  # This file
├── frigate/
│   └── config.yml             # Frigate NVR configuration
└── homeassistant/
    ├── configuration.yaml     # Home Assistant configuration
    ├── automations.yaml       # Empty automations file
    ├── scripts.yaml           # Empty scripts file
    └── scenes.yaml            # Empty scenes file
```

## Troubleshooting

### Card not showing up

1. Make sure you ran `bash .devcontainer/sync-card.sh`
2. Hard-refresh your browser (`Ctrl+Shift+R`)
3. Check browser console for errors (`F12` → Console)
4. Verify the file exists: `ls /config/www/frigate-view-card.js`

### Home Assistant not starting

```bash
# Check HA container status
docker ps | grep homeassistant

# View HA logs
docker logs homeassistant
```

### Frigate not connecting

1. Check Frigate is running: `curl http://localhost:5000/api/version`
2. View Frigate logs: `docker logs frigate`
3. Verify config: The demo config uses CPU detection (no GPU required)

### Port conflicts

If ports 8123 or 5000 are already in use on your host:

1. Edit `.devcontainer/docker-compose.yml`
2. Change the host port mapping:
   ```yaml
   ports:
     - "8124:8123"  # Use 8124 instead of 8123
   ```

### Reset everything

To start fresh:

```bash
# From your host machine (not inside the container)
docker compose -f .devcontainer/docker-compose.yml down -v
```

Then reopen the devcontainer in VS Code.

## Tips

- **Browser caching**: Home Assistant aggressively caches JavaScript. Always use hard-refresh (`Ctrl+Shift+R`) after syncing changes.
- **Version number**: Update the `VERSION` constant at the top of `frigate-view-card.js` to bust the cache.
- **Multiple browsers**: Test in an incognito/private window to avoid cache issues.
- **Frigate API**: Access the Frigate API directly at `http://localhost:5000/api/` for debugging.

## Requirements

- Docker Desktop (Windows/Mac) or Docker Engine (Linux)
- VS Code with Dev Containers extension
- At least 4GB RAM available for Docker
- ~2GB disk space for images and volumes
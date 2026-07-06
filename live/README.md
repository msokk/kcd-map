# Live player tracking

[livemap_tracker.lua](livemap_tracker.lua) is the master source for the game
mod. To update the installed mod, zip it as `Scripts/Mods/livemap_tracker.lua`
(forward slashes) and save the archive as
`<KCD>\Mods\LiveMapTracker\Data\LiveMapTracker.pak` while the game is closed.

Shows Henry's live position on the map while KCD is running, via three pieces:

1. **Game mod** — `Mods\LiveMapTracker` in the KCD install. A startup Lua script
   logs `[LIVEMAP] x y z dirX dirY` (world meters) to `kcd.log` once per second,
   and only when the player has moved more than 1 m. `kcd.log` is recreated on
   every game launch, so it never grows meaningfully.
2. **Bridge** — [bridge.ps1](bridge.ps1) tails `kcd.log` and serves the latest
   position as JSON at `http://localhost:8765/position` (CORS `*`).
3. **Map** — `LivePlayerMarker` polls the bridge once per second and renders an
   arrow at `[y, x]` with the player's heading. The map's CRS already uses
   in-game world coordinates, so no conversion is needed. Click the arrow to
   toggle follow mode (on by default). The marker disappears when the bridge
   is unreachable or the game isn't running.

## Run (desktop app)

`npm run app:build` builds the map and compiles a self-contained
`kcd-live-map.exe` (Deno; map assets embedded). Running it serves everything
on http://localhost:8765, tails kcd.log itself (no bridge needed), and opens
an Edge app-mode window. Flags: `--port=N`, `--kcd=<install dir>` (or
`KCD_PATH` env), `--no-open`.

## Run (dev)

```powershell
# 1. start the bridge (adjust -LogPath if KCD is installed elsewhere)
#    (or run the desktop app / `npm run app:run` instead of the bridge)
powershell -ExecutionPolicy Bypass -File live\bridge.ps1

# 2. start the map; Vite proxies /position to localhost:8765
npm run dev

# 3. launch the game; the arrow appears after the first position line is logged
```

Sanity check without the map: `curl http://localhost:8765/position`

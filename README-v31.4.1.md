# VOID ANGLER prototype v31.4.1 — forced final v4.5 layout

- The final user-exported v4.5 game layout is identical to the bundled layout data.
- Renamed the runtime layout bundle to `layout-v4-data-v31_4_1.js` so older browser cache cannot reuse a previous layout bundle.
- Bumped all runtime cache-busting query strings to `31.4.1`.
- Canvas rendering continues to use the exported `battle_player`, `battle_enemy`, `maint_ship`, and `maint_fishing` scenes directly.
- Enemy visuals continue to resolve to the exported `enemy_*` assets.

# VOID ANGLER prototype v31.3 — Shared Battle Ship

- `maint_ship` is now the sole canonical assembled ship layout for maintenance and battle.
- Player battle ship renders the same completed Canvas composition as maintenance.
- Enemy battle ship uses the same assembled layout/loadout, with the entire completed Canvas rotated 180°.
- Battle no longer uses `battle_player` / `battle_enemy` part layouts to determine the ship's shape.
- Weapon T points from the shared maintenance layout are still exposed as invisible battle markers.
- Enemy heavy laser remains a battle-only invisible emitter marker so QTE/beam logic continues to work without changing the canonical artwork.
- Canvas backgrounds remain fully transparent (v31.2 behavior).

# VOID ANGLER prototype v30

Game View renderer now copies the Editor v4.1 camera model exactly:
- one uniform scale for X and Y
- preserves 900x1600 scene aspect
- world size = base viewport * scale
- world offset = camera pixel offset * same scale
- element geometry uses the same size-before-rotation / Anchor-Mount formula as Editor v4.1

This replaces v29's incorrect independent X/Y percentage scaling.

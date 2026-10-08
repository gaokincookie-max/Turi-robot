# VOID ANGLER prototype v31.4 – v4.5 Battle Layout Applied

- `void-angler-game-layout-v4_5 (1).json` をゲーム本体へ適用。
- 整備艦は `maint_ship`、戦闘自艦は `battle_player`、敵艦は `battle_enemy` をそれぞれ直接使用。
- 敵艦は敵専用の船体・武器・装備アセットを使用。
- battle_enemy 側ですでに180°向きが定義されているため、ゲーム側のCanvas全体180°回転を廃止。
- 武器のT座標をCanvas Rendererの返す発射位置として利用。
- 敵の大型レーザーは従来どおり戦闘専用の不可視発射点として保持。
- Canvas透明背景処理はv31.2系を維持。

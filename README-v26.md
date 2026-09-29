# VOID ANGLER prototype v26 — Editor v4.1 Layout Integration

この版では `void-angler-game-layout-v4.json` をグラフィック配置の正本として統合しています。

## 主な変更
- Editor v4.1 の `layouts` / `cameras` をゲーム側へそのまま統合。
- 9:16 (900×1600) の Scene Canvas と Game View camera をそのまま再現。
- 自動トリミング、独自センタリング、ゲーム側の追加倍率補正を廃止。
- Editor v4.1 と同じ geometry 計算（size-before-rotation）を使用。
- `placementMode: anchor / mount` の両方に対応。
- A = transform origin / M = attachment point / T = emitter point のv4契約を保持。
- 最新v4 JSONに含まれる加工済み画像をゲームの player assets に再抽出。
- `maint_ship` / `battle_player` / `battle_enemy` / `maint_fishing` をそれぞれ独立したv4レイアウト＋カメラで描画。
- 釣具整備も同じGame View rendererへ統合。

## ファイル
- `layout-v4-data.js`: ゲーム実行用の軽量化済みv4レイアウトデータ
- `layout-source/void-angler-game-layout-v4.json`: 今回受け取ったゲーム用出力JSONの原本
- `game.js`: v4 Game View rendererを統合

今後レイアウトを変更するときは、Editor v4.1でゲーム用JSONを書き出し、同じ変換手順で `layout-v4-data.js` と画像を更新する想定です。

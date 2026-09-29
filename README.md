# VOID ANGLER Prototype

宇宙釣り×ロボット×ローグライトのブラウザプロトタイプです。

## 起動
`index.html` をブラウザで開くだけで動作します。
GitHub Pages / Netlify Drop にそのまま配置できます。

## 現在入っている要素
- 縦横レスポンシブ
- 通常航行と距離スコア
- 釣りミニゲーム
- 素材・完成品ドロップ
- 武器 / 装備
- 設計図の解析・クラフト解禁
- 船体強化
- 釣具（ロッド / リール / ライン / フック）
- 半自動海賊戦
- 部位優先攻撃
- 武器由来のアクティブ能力
- QTE回避
- 撃破後サルベージ
- 恒久トークン
- 恒久アップグレード
- ジャンプビーコン
- ローカルセーブ / 再開
- 記録画面

## 注意
初期バランスはプロトタイプ用の仮値です。


## v7 changes
- セーブデータ続行/終了選択
- 再開時の釣り停止バグ対策
- 釣り中のタブロック
- サブ画面間の下部タブ移動
- タップ上昇＋長押し下降加速
- 中央の釣果リザルト・NEW表示
- 設計図の発見/解析進捗表示
- ロボット拡大・吹き出し反応
- 大型WARNING演出
- 釣具クラフト定義修復


## v8 changes
- 製作カードに簡易イラスト追加
- 必要素材をアイコン＋名称＋個数で表示
- 短押しはリリース時のみ上昇
- 長押し開始時は上昇なし、長押し後のリリースでも上昇なし


## v9 changes
- 下部タブを 3 つ（釣り / 整備 / 設定）に再編
- 整備画面に機体図・釣具図ベースのスロットUIを追加
- スロットから現在装備 / 所持 / 作成候補を縦スクロールで閲覧
- 装備詳細ポップアップ追加
- 武器・装備のラン内レベル強化を追加
- HUD大型化、下部アイコン大型化、星の流れ演出を追加

## v10 changes
- 釣り装備UIを横から見た釣り竿の図に刷新
- 通常の釣り画面とメニュー画面の釣り糸を、ロボット直結ではなく釣り竿の先から垂れる見た目に修正

## v11 changes
- 釣り竿と糸の位置関係を再調整し、通常釣り画面・釣具整備画面ともに横から見た釣り竿らしい見た目に修正
- 武器・装備・釣具の一覧で詳細ボタンを廃止し、カード自体をタップして詳細を開く方式に変更
- 武器情報の表示を見直し、ATK表記だけでなく「攻撃力」「攻撃頻度」「発射間隔」が分かるように改善

## v12 changes
- ユーザーの赤ラフに合わせて、通常釣り画面の釣り糸の始点をロボット近くの竿先へ移動
- 釣具整備画面のロッド・リール・ライン・フックの配置を再調整し、スロットとイラストが極力重ならないよう修正

## v13 changes
- 整備画面の素材表示重複を修正（釣具画面の上下重複を解消）
- 整備に「倉庫」タブを追加し、保管中アイテムと装備中の武器・装備を一覧表示
- 倉庫一覧はタップで詳細を開けるように変更
- 倉庫満杯時に、新しいアイテムを分解するか、倉庫内から1つ分解して保管するかを選べる安全なフローを追加

## v14 visual asset pass
- 生成済みのビジュアル素材を安全な範囲だけゲームへ導入。
- 素材4種（金属片 / 回路基板 / 機械部品 / 動力セル）を正式アイコン画像へ差し替え。
- 武器・装備の一覧、倉庫、詳細、作成画面で専用スプライトを表示。
- 整備 > 機体の中央図を Mk.1〜Mk.4 のデフォルメ上面戦艦スプライトへ差し替え。
- 整備の武器・装備スロットにも現在装着中のスプライトを表示。
- ゲームロジック、戦闘システム、釣り画面、釣具レイアウトは今回は変更していません。
- 武器を船体へ直接重ねる本格合成、戦闘画面への流用、釣具の正式スプライト反映は位置・向き仕様を確定してから行う方針です。

## v15 changes
- 機体スロット仕様を正式化
  - Mk.1: 武器2 / 装備2
  - Mk.2: 武器3 / 装備3
  - Mk.3: 武器4 / 装備4
  - Mk.4: 武器4 / 装備5
- Mk.5以降も機体見た目はMk.4、武器4 / 装備5で固定
- Mk.5以降はHP・負荷・倉庫など数値系のみ引き続き成長
- ユーザーの赤/青の位置指定に合わせて各Mkのハードポイント位置を再定義
- 武器の向きは全スロットで「元画像から時計回り90度」に固定

## v17 Battle System V2
- 敵をプレイヤーと同じ機体・武器・装備データ系で生成する方式へ刷新
- 敵装備は毎戦ランダム生成。距離に応じて抽選候補が増加
- 敵の武器Lv / 装備Lv / 機体Lvは距離で上昇
- 敵専用ダメージ倍率は序盤約0.28から始まり、距離とともに1.00へ接近
- 敵HPはプレイヤー基準より大幅に高く、距離に応じて加速して増加
- 敵部位を「左武器 / 右武器 / 装備 / レーザー / 本体」の5部位に整理
- 左右武器破壊で対応側の通常武器を全停止
- 装備破壊で敵装備の自動効果を一括停止
- レーザー破壊でレーザーQTEを停止
- 本体は破壊不能で常時攻撃可能
- どの破壊可能部位へのダメージも敵総HPへ同量反映
- 敵は武器アクティブ能力を使用せず、通常自動攻撃 + 自動装備効果 + レーザーQTEのみ使用
- 戦闘画面をトップビューの自艦 / 敵艦表示へ変更
- QTE成功時に紫色のバリア演出を追加


## v17b enemy visual pass
- Enemy ship / weapon / equipment visuals are wired as 2P hostile variants under `assets/enemy/`
- Enemy hulls remain top-down hostile red/orange versions and are rendered facing the player in battle.
- Enemy weapon overlays use the enemy asset set and the existing enemy rotation path, so they appear as the opposing side.
- Laser turret remains a separate dedicated enemy part/effect for QTE readability.


## v17c battle effects pass
- Added battle FX layer for weapon beams, laser telegraph, impacts, EMP pulse and part-break explosions.
- Added muzzle/weapon firing emphasis, active-skill flash, hit feedback and enemy laser charge visuals.
- Enemy destroyed/disabled parts now visually dim their corresponding overlays and laser turret.


## v18 layout-editor import
- Imported the user-adjusted `void-angler-layout-v3` asset cuts and layout values.
- Player maintenance ship layout is now the canonical ship assembly. Battle player and enemy reuse the same hardpoint geometry instead of maintaining a separate battle arrangement.
- Enemy assembly is the same geometry rotated 180° as one object, while retaining enemy 2P-color assets and the separate laser turret.
- Editor A/M/T metadata is preserved; A (anchor) is used for actual overlay placement.
- User-edited weapon and fishing sprites from the JSON were written back into the runtime asset files.

## v20: Editor-canonical ship rendering

The ship assembly drawn in the layout editor's `maint_ship` scene is now the single source of truth for hull/weapon/equipment placement.

- Maintenance and battle both render from `maint_ship`.
- `battle_player` / `battle_enemy` no longer define independent hull/weapon/equipment geometry at runtime.
- Editor coordinates are interpreted on the editor's 9:16 virtual canvas and uniformly scaled into the game frame, so a rectangular battle frame cannot stretch the layout.
- Enemy ships rotate the completed canonical assembly by 180 degrees instead of separately rotating every part.
- The enemy-only laser remains a battle-specific overlay because it is not part of the maintenance ship assembly.

This removes the previous double/triple source-of-truth problem and makes future editor adjustments authoritative for the game ship layout.


## v21 scene-specific editor integration
- The editor remains authoritative, but layouts are no longer collapsed into `maint_ship`.
- Maintenance uses `maint_ship`, player battle uses `battle_player`, enemy battle uses `battle_enemy`.
- All three scenes share one coordinate/anchor/rotation renderer.
- Removed the extra game-side 180-degree enemy rotation. Enemy orientation now comes from `battle_enemy`.
- The ship component viewBox is derived from the full editor scene so slot changes do not recenter the ship.

## v22 exact-editor fix
- Replaced game ship/equipment/fishing PNGs with the exact `_processed.value.url` PNG bytes used by the supplied editor JSON.
- Mirrored those editor assets into enemy visual folders because `battle_enemy` in the supplied editor layout references the same editor assets.
- Removed legacy CSS transform classes from SVG-rendered ship parts. Those CSS rules were overriding the SVG transform attributes, so editor rotations/anchor transforms were not actually being honored.
- The editor scene data remains scene-specific: `maint_ship`, `battle_player`, and `battle_enemy`.

## v24 editor-replica renderer
- Restored `maint_ship`, `battle_player`, and `battle_enemy` directly from `void-angler-layout-v3 (1).json` without the later battle hull 48x24 -> 56x28 rewrite.
- Removed the SVG auto-viewBox/camera path for ship rendering.
- Ship rendering now mirrors the editor `renderLayoutPreview()` formula directly.
- A true 9:16 internal preview stage is fitted into the game frame, preventing the game frame aspect ratio from changing element geometry.
- Player ship/weapon/equipment PNGs are regenerated from each asset's original `_processed.value.url` in the source JSON.

## v26 note
Editor v4.1 のゲーム用JSONを直接基準にしたレイアウト描画へ移行しました。詳細は `README-v26.md` を参照してください。

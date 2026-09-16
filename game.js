
(()=>{
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const SAVE_KEY="voidAnglerPrototype_v1";

const upgradeDefs=[
 {id:"hull",name:"船体強化",icon:"🛸",desc:"開始時の最大HPを増加。",costBase:8,effect:l=>`最大HP +${Math.round(8*Math.sqrt(l))}%`},
 {id:"fire",name:"火器調整",icon:"🔫",desc:"全武器の基礎攻撃力を少し上昇。",costBase:9,effect:l=>`攻撃力 +${Math.round(6*Math.sqrt(l))}%`},
 {id:"armor",name:"装甲最適化",icon:"🛡️",desc:"被ダメージをわずかに軽減。高レベルほど伸びにくい。",costBase:11,effect:l=>`被ダメージ -${Math.min(18,(2.2*Math.sqrt(l))).toFixed(1)}%`},
 {id:"repair",name:"整備効率",icon:"🔧",desc:"戦闘終了後の自動修復量を増加。",costBase:8,effect:l=>`戦闘後修復 +${(1.2*Math.sqrt(l)).toFixed(1)}%`},
 {id:"storage",name:"初期積載改善",icon:"📦",desc:"開始時の倉庫容量を増加。",costBase:10,effect:l=>`倉庫 +${Math.floor(l/2)}枠`},
 {id:"salvage",name:"サルベージ技術",icon:"🧲",desc:"海賊撃破後のサルベージ報酬を少し改善。",costBase:12,effect:l=>`報酬補正 +${(3*Math.sqrt(l)).toFixed(0)}%`},
 {id:"reel",name:"リール制御最適化",icon:"🎣",desc:"成功ゾーンを外した時の回収進捗減少を緩和。",costBase:9,effect:l=>`減少速度 -${Math.min(45,5*Math.sqrt(l)).toFixed(0)}%`},
 {id:"beacon",name:"ジャンプビーコン",icon:"📡",desc:"ラン開始地点を前進。飛ばした区間の報酬は得られない。",costBase:20,effect:l=>`開始地点 ${l*2} ly`}
];

const weapons=[
 {id:"pulse",name:"小型パルス砲",atk:7,load:2,active:null,desc:"標準的な自動連射武器。",unlocked:true,cost:{metal:4,circuit:2}},
 {id:"bolt",name:"重ボルト砲",atk:12,load:4,active:null,desc:"遅いが高威力。",unlocked:false,cost:{metal:7,mech:3}},
 {id:"laser",name:"精密レーザー",atk:9,load:3,active:null,desc:"部位への集中攻撃時に追加補正。",unlocked:false,cost:{metal:4,circuit:4,cell:1}},
 {id:"missile",name:"小型ミサイルポッド",atk:8,load:4,active:{name:"一斉射撃",cool:13,type:"damage",power:35},desc:"アクティブで一斉射撃。",unlocked:false,cost:{metal:5,circuit:3,cell:2}},
 {id:"emp",name:"EMPランチャー",atk:3,load:4,active:{name:"EMP",cool:16,type:"emp",power:0},desc:"低火力。アクティブで対象部位を停止。",unlocked:false,cost:{metal:3,circuit:6,cell:2}},
 {id:"barrier",name:"防壁投射機",atk:2,load:4,active:{name:"防壁展開",cool:18,type:"barrier",power:0},desc:"低火力。アクティブで短時間被ダメージ大幅軽減。",unlocked:false,cost:{metal:5,circuit:4,cell:3}},
 {id:"scatter",name:"散弾パルサー",atk:10,load:5,active:null,desc:"不安定だが平均火力が高い。",unlocked:false,cost:{metal:7,circuit:3,mech:2}},
 {id:"piercer",name:"貫通レール砲",atk:14,load:6,active:{name:"貫通射撃",cool:20,type:"damage",power:55},desc:"重い。アクティブで指定部位へ大打撃。",unlocked:false,cost:{metal:10,mech:4,cell:2}}
];
const equipments=[
 {id:"armorplate",name:"廃材装甲",load:2,hp:30,desc:"最大HPを増やす。",unlocked:true,cost:{metal:5}},
 {id:"shield",name:"簡易シールド",load:3,hp:0,shield:0.06,desc:"被ダメージを少し軽減。",unlocked:true,cost:{metal:3,circuit:3,cell:1}},
 {id:"repair",name:"応急修理機",load:3,hp:0,repair:0.05,desc:"戦闘終了後にHPを回復。",unlocked:true,cost:{metal:3,mech:3,circuit:1}},
 {id:"aim",name:"照準補助装置",load:2,atkMult:0.08,desc:"自動攻撃力を上昇。",unlocked:false,cost:{circuit:5,mech:1}},
 {id:"cooler",name:"冷却装置",load:2,fireRate:0.12,desc:"自動攻撃間隔を短縮。",unlocked:false,cost:{metal:2,mech:3,circuit:1}},
 {id:"bulk",name:"増設フレーム",load:4,hp:70,desc:"重いが大きくHP増加。",unlocked:false,cost:{metal:9,mech:3}},
 {id:"sensor",name:"戦術センサー",load:2,partBonus:0.15,desc:"部位指定時のダメージ補正。",unlocked:false,cost:{circuit:6}},
 {id:"stabilizer",name:"姿勢安定器",load:2,qte:0.08,desc:"QTEの成功判定をわずかに緩和。",unlocked:false,cost:{mech:3,circuit:2}}
];

const rodTypes=["標準","安定","高速","重量"];
const hookTypes=[
 {id:"standard",name:"標準フック",desc:"補正なし"},
 {id:"magnet",name:"磁気フック",desc:"金属・機械素材が出やすい"},
 {id:"recovery",name:"回収フック",desc:"素材個数が少し増えやすい"},
 {id:"military",name:"軍用フック",desc:"武器系完成品が少し出やすい"},
 {id:"probe",name:"探査フック",desc:"特殊反応「!?」が少し出やすい"}
];

const defaultMeta=()=>({
 tokens:0,
 upgrades:Object.fromEntries(upgradeDefs.map(x=>[x.id,0])),
 unlocks:{weapons:["pulse"],equipments:["armorplate","shield","repair"]},
 blueprints:{},
 bestDistance:0,totalDistance:0,totalKills:0,totalCatches:0,runs:0,
 settings:{bgm:true,se:true,shake:true,vibe:true}
});
let meta=loadMeta();
let run=null, gameTimer=null, fishingAnim=null, battleTimer=null, qteAnim=null, currentUpgrade="hull", currentTab="fishing";

function loadMeta(){
 try{const d=JSON.parse(localStorage.getItem(SAVE_KEY)); if(d) return Object.assign(defaultMeta(),d,{settings:Object.assign(defaultMeta().settings,d.settings||{}),upgrades:Object.assign(defaultMeta().upgrades,d.upgrades||{})});}catch(e){}
 return defaultMeta();
}
function saveMeta(){localStorage.setItem(SAVE_KEY,JSON.stringify(meta))}
function saveRun(){
 if(run) localStorage.setItem(SAVE_KEY+"_run",JSON.stringify(run));
 else localStorage.removeItem(SAVE_KEY+"_run");
}
function loadRun(){try{return JSON.parse(localStorage.getItem(SAVE_KEY+"_run"))}catch(e){return null}}
function showScreen(id){$$(".screen").forEach(x=>x.classList.remove("active")); $("#"+id).classList.add("active"); updateMetaUI()}
function toast(t){const el=$("#toast");el.textContent=t;el.classList.add("show");clearTimeout(el._t);el._t=setTimeout(()=>el.classList.remove("show"),1700)}
function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
function rand(a,b){return a+Math.random()*(b-a)}
function randi(a,b){return Math.floor(rand(a,b+1))}
function weighted(items){let s=items.reduce((a,x)=>a+x.w,0),r=Math.random()*s;for(const x of items){r-=x.w;if(r<=0)return x.v}return items.at(-1).v}
function costOf(def,lvl){return Math.round(def.costBase*Math.pow(lvl+1,1.45))}
function updateMetaUI(){
 $("#menuTokens").textContent=meta.tokens; $("#upgradeTokens").textContent=meta.tokens;
}
function renderUpgradeTabs(){
 const box=$("#upgradeTabs");box.innerHTML="";
 upgradeDefs.forEach(d=>{const b=document.createElement("button");b.textContent=d.name;b.onclick=()=>{currentUpgrade=d.id;renderUpgradePanel()};box.appendChild(b)})
}
function renderUpgradePanel(){
 const d=upgradeDefs.find(x=>x.id===currentUpgrade),l=meta.upgrades[d.id]||0,c=costOf(d,l);
 $("#upgradeIcon").textContent=d.icon;$("#upgradeName").textContent=d.name;$("#upgradeDesc").textContent=d.desc;
 $("#upgradeLevel").textContent=`Lv.${l}`;$("#upgradeEffect").textContent=d.effect(l);
 $("#doUpgradeBtn").textContent=`◈ ${c} でアップグレード`;
 $("#doUpgradeBtn").disabled=meta.tokens<c;
}
function doUpgrade(){
 const d=upgradeDefs.find(x=>x.id===currentUpgrade),l=meta.upgrades[d.id]||0,c=costOf(d,l);
 if(meta.tokens<c)return;
 meta.tokens-=c;meta.upgrades[d.id]=l+1;saveMeta();updateMetaUI();renderUpgradePanel();toast(`${d.name} Lv.${l+1}`);
}
function renderRecords(){
 const vals=[
 ["最高到達距離",`${meta.bestDistance.toFixed(2)} ly`],["累計航行距離",`${meta.totalDistance.toFixed(1)} ly`],
 ["累計海賊撃破",meta.totalKills],["累計釣り成功",meta.totalCatches],["ラン回数",meta.runs],
 ["解禁武器設計図",`${meta.unlocks.weapons.length}/${weapons.length}`],["解禁装備設計図",`${meta.unlocks.equipments.length}/${equipments.length}`]
 ];
 $("#recordsGrid").innerHTML=vals.map(v=>`<div class="recordCard"><span>${v[0]}</span><strong>${v[1]}</strong></div>`).join("");
}
function newRun(startDistance=null){
 const beacon=meta.upgrades.beacon||0;
 const start=startDistance ?? beacon*2;
 run={
   distance:start,hp:100,maxHp:100,shipLevel:1,maxLoad:10,weaponSlots:2,equipSlots:2,storageCap:4,
   materials:{metal:5,circuit:3,mech:2,cell:1},
   weapons:[{id:"pulse",uid:uid()}],equipments:[{id:"armorplate",uid:uid()}],storage:[],
   rod:{rod:"標準",reel:"標準",line:"標準",hook:"standard"},
   kills:0,catches:0,tokensEarned:0,
   nextBite:rand(5,9),nextPirate:start+rand(2.4,3.8),mode:"fishing",
   pendingCatch:null,pendingSalvage:null,enemy:null,actionCooldowns:{},
   savedAt:Date.now()
 };
 recalcPlayer(); saveRun(); startGame();
}
function uid(){return Math.random().toString(36).slice(2,10)}
function recalcPlayer(){
 if(!run)return;
 const hullBonus=1+0.08*Math.sqrt(meta.upgrades.hull||0);
 let baseHp=(100+(run.shipLevel-1)*55)*hullBonus;
 let hpBonus=0,shield=0,repair=0,atkMult=0,fireRate=0,qte=0,partBonus=0;
 for(const inst of run.equipments){const e=equipments.find(x=>x.id===inst.id); if(!e)continue;hpBonus+=e.hp||0;shield+=e.shield||0;repair+=e.repair||0;atkMult+=e.atkMult||0;fireRate+=e.fireRate||0;qte+=e.qte||0;partBonus+=e.partBonus||0}
 const oldMax=run.maxHp||baseHp+hpBonus;
 run.maxHp=Math.round(baseHp+hpBonus);
 if(run.hp>run.maxHp)run.hp=run.maxHp;
 if(!run.hp)run.hp=run.maxHp;
 run.mods={shield,repair,atkMult,fireRate,qte,partBonus};
 run.maxLoad=10+(run.shipLevel-1)*5;
 run.weaponSlots=2+Math.floor((run.shipLevel-1)/1);
 run.equipSlots=2+Math.floor((run.shipLevel-1)/1);
 run.storageCap=4+(run.shipLevel-1)*2+Math.floor((meta.upgrades.storage||0)/2);
 updateHUD();
}
function getLoad(){
 let n=0;run.weapons.forEach(i=>n+=(weapons.find(x=>x.id===i.id)?.load||0));run.equipments.forEach(i=>n+=(equipments.find(x=>x.id===i.id)?.load||0));return n;
}
function updateHUD(){
 if(!run)return;
 $("#distanceText").textContent=run.distance.toFixed(2);$("#playerHpText").textContent=`${Math.ceil(run.hp)}/${run.maxHp}`;
 $("#playerHpFill").style.width=`${clamp(run.hp/run.maxHp*100,0,100)}%`;$("#loadText").textContent=`${getLoad()}/${run.maxLoad}`;
}
function startGame(){
 showScreen("gameScreen"); $("#drawer").classList.remove("active"); switchMode(run.mode||"fishing"); clearInterval(gameTimer);
 gameTimer=setInterval(gameTick,100); renderBattleActions(); updateHUD();
}
function gameTick(){
 if(!run || !$("#gameScreen").classList.contains("active"))return;
 if(run.mode==="fishing"){
   run.distance+=0.00167; // ~1 ly/min
   run.nextBite-=0.1;
   if(run.nextBite<=0 && !run.pendingCatch){triggerBite()}
   if(run.distance>=run.nextPirate && !run.pendingCatch){triggerPirate()}
 }
 updateHUD();
 if(Math.floor(run.distance*10)!==run._saveMark){run._saveMark=Math.floor(run.distance*10);saveRun()}
}
function triggerBite(){
 const hook=run.rod.hook;
 let rareBonus=hook==="probe"?0.08:0;
 const roll=Math.random();
 let signal=roll<0.05+rareBonus?"!?":roll<0.14?"!!!":roll<0.38?"!!":"!";
 $("#biteIndicator").textContent=signal;$("#biteIndicator").style.display="block";
 setTimeout(()=>{if(!run||run.mode!=="fishing")return;$("#biteIndicator").style.display="none";createCatch(signal);startFishing(false)},650);
}
function createCatch(signal){
 let quality={ "!":1,"!!":2,"!!!":3,"!?":4}[signal]||1;
 let kind;
 const hook=run.rod.hook;
 const completeChance=0.13+quality*0.08+(hook==="military"?0.11:0);
 if(Math.random()<completeChance){
   const pool=[...weapons.map(x=>({type:"weapon",id:x.id})),...equipments.map(x=>({type:"equip",id:x.id}))];
   kind=pool[randi(0,pool.length-1)];
 }else kind={type:"material",mat:weighted([{v:"metal",w:hook==="magnet"?5:3},{v:"circuit",w:2},{v:"mech",w:hook==="magnet"?4:2},{v:"cell",w:1}])};
 run.pendingCatch={signal,quality,kind,amount:randi(1,2+quality)+(hook==="recovery"?1:0),seed:Math.random()};
 saveRun();
}
function rodMod(){
 const count=[run.rod.rod,run.rod.reel,run.rod.line].reduce((a,x)=>(a[x]=(a[x]||0)+1,a),{});
 return {stable:(count["安定"]||0)*0.07,fast:(count["高速"]||0)*0.12,heavy:(count["重量"]||0)*0.08};
}
function startFishing(salvage){
 run.mode=salvage?"salvageFishing":"fishingMini";saveRun();
 $("#fishingMinigame").classList.add("active");
 $("#fishTitle").textContent=salvage?"SALVAGE HOOK":"SIGNAL "+(run.pendingCatch?.signal||"!");
 let line=.45,zone=.48,dir=1,progress=0,last=performance.now();
 let tapBoost=0;
 const mods=rodMod(), reelPenalty=1-Math.min(.45,.05*Math.sqrt(meta.upgrades.reel||0));
 const btn=$("#reelBtn");

 // 連打式：1タップごとに大きく上昇。長押しによる継続上昇は行わない。
 btn.onpointerdown=null;
 btn.onpointerup=null;
 btn.onpointercancel=null;
 btn.onpointerleave=null;
 btn.onclick=(e)=>{
   e.preventDefault();
   tapBoost += 0.115 + mods.heavy*0.22;
   if(tapBoost>0.22) tapBoost=0.22;
 };

 cancelAnimationFrame(fishingAnim);
 function loop(t){
   let dt=Math.min(.04,(t-last)/1000);last=t;

   // 成功ゾーンは上下移動
   zone+=dir*dt*(0.28+(run.pendingCatch?.quality||2)*0.035);
   if(zone>.78){zone=.78;dir=-1}
   if(zone<.08){zone=.08;dir=1}

   // ラインは常時下降。タップで瞬間的に上へ跳ねる。
   line -= dt*0.34;
   if(tapBoost>0){
     const applied=Math.min(tapBoost,dt*3.6);
     line += applied;
     tapBoost -= applied;
   }
   line=clamp(line,.01,.97);

   const width=.23+mods.stable;

   // 判定を明示化：
   // fishLine の中心位置が successZone の上下端の間にある時だけ成功扱い。
   const zoneTop = zone-width/2;
   const zoneBottom = zone+width/2;
   const inZone = line >= zoneTop && line <= zoneBottom;

   if(inZone){
     progress += dt*(0.32+mods.fast);
   }else{
     progress -= dt*(0.18*reelPenalty);
   }
   progress=clamp(progress,0,1);

   $("#successZone").style.top=`${zoneTop*100}%`;
   $("#successZone").style.height=`${width*100}%`;
   $("#fishLine").style.bottom=`${line*100}%`;
   $("#fishProgress").style.width=`${progress*100}%`;
   $("#fishProgressText").textContent=`${Math.floor(progress*100)}%`;

   if(progress>=1){finishFishing(true,salvage);return}
   fishingAnim=requestAnimationFrame(loop);
 }
 fishingAnim=requestAnimationFrame(loop);
}
function finishFishing(success,salvage){
 cancelAnimationFrame(fishingAnim);$("#fishingMinigame").classList.remove("active");
 if(salvage){finishSalvage(success);return}
 if(success && run.pendingCatch){
   run.catches++;meta.totalCatches++;
   const c=run.pendingCatch;
   if(c.kind.type==="material"){run.materials[c.kind.mat]+=c.amount;toast(`${matName(c.kind.mat)} ×${c.amount}`)}
   else{
     const inst={id:c.kind.id,uid:uid()};
     if(run.storage.length<run.storageCap){run.storage.push({...inst,type:c.kind.type});toast(`${itemName(c.kind)} を回収`)}
     else{disassemble(c.kind);toast(`倉庫満杯：${itemName(c.kind)} を自動分解`)}
     advanceBlueprint(c.kind);
   }
 }
 run.pendingCatch=null;run.nextBite=rand(5,9);run.mode="fishing";saveMeta();saveRun();switchMode("fishing");
}
function matName(m){return {metal:"金属片",circuit:"回路基板",mech:"機械部品",cell:"動力セル"}[m]||m}
function itemName(k){const a=k.type==="weapon"?weapons:equipments;return a.find(x=>x.id===k.id)?.name||k.id}
function advanceBlueprint(k){
 const key=k.type+":"+k.id;
 if((k.type==="weapon"&&meta.unlocks.weapons.includes(k.id))||(k.type==="equip"&&meta.unlocks.equipments.includes(k.id)))return;
 meta.blueprints[key]=(meta.blueprints[key]||0)+1;
 const def=(k.type==="weapon"?weapons:equipments).find(x=>x.id===k.id);
 const need=def.load>=5?4:def.load>=3?3:2;
 if(meta.blueprints[key]>=need){
   if(k.type==="weapon")meta.unlocks.weapons.push(k.id);else meta.unlocks.equipments.push(k.id);
   toast(`設計図解禁：${def.name}`);
 }
 saveMeta();
}
function triggerPirate(){
 run.mode="warning";saveRun();$("#warningBanner").style.display="block";
 setTimeout(()=>{$("#warningBanner").style.display="none";createEnemy();startBattle()},1000);
}
function createEnemy(){
 const d=run.distance;
 const tier=Math.floor(d/8);
 const hp=80*Math.pow(1.115,d)+tier*45;
 const atk=5*Math.pow(1.09,d)+tier*2;
 run.enemy={name:tier<2?"SCRAP RAIDER":tier<5?"VOID CORSAIR":"ABYSS MARAUDER",maxHp:hp,hp,atk,
  parts:{
    weapon:{name:"主砲",hp:hp*.24,max:hp*.24,destroyed:false,disabledUntil:0},
    engine:{name:"推進器",hp:hp*.20,max:hp*.20,destroyed:false,disabledUntil:0},
    shield:{name:"シールド",hp:hp*.18,max:hp*.18,destroyed:false,disabledUntil:0}
  },target:"core",nextBig:rand(5.5,9),attackClock:0
 };
 saveRun();
}
function switchMode(m){
 $$(".modeLayer").forEach(x=>x.classList.remove("active"));
 $("#battleActions").classList.remove("active");
 if(m==="battle"){ $("#battleScene").classList.add("active");$("#battleActions").classList.add("active")}
 else if(m==="salvage"){ $("#salvageScene").classList.add("active")}
 else $("#fishingScene").classList.add("active");
}
function startBattle(){
 run.mode="battle";switchMode("battle");renderEnemy();renderBattleActions();clearInterval(battleTimer);battleTimer=setInterval(battleTick,180);saveRun();
}
function totalAttack(){
 let atk=run.weapons.reduce((s,i)=>s+(weapons.find(x=>x.id===i.id)?.atk||0),0);
 atk*=1+0.06*Math.sqrt(meta.upgrades.fire||0)+(run.mods?.atkMult||0);
 return atk;
}
function battleTick(){
 if(!run||run.mode!=="battle"||!run.enemy)return;
 const e=run.enemy,dt=.18;
 e.attackClock+=dt;e.nextBig-=dt;
 const fr=Math.max(.55,1-(run.mods?.fireRate||0));
 if(e.attackClock>=fr){
   e.attackClock=0;
   let dmg=totalAttack()*rand(.80,1.15);
   if(e.target!=="core" && e.parts[e.target] && !e.parts[e.target].destroyed){
     dmg*=1+(run.mods?.partBonus||0)+((e.target==="weapon" && run.weapons.some(i=>i.id==="laser")) ? 0.15 : 0);
     e.parts[e.target].hp-=dmg;
     if(e.parts[e.target].hp<=0){e.parts[e.target].destroyed=true;toast(`${e.parts[e.target].name} 破壊`)}
   }
   e.hp-=dmg;
 }
 const enemyAttackMult=e.parts.weapon.destroyed?.55:1;
 if(Math.random()<.22){
   takeDamage(e.atk*enemyAttackMult*rand(.45,.7));
 }
 if(e.nextBig<=0 && !e.parts.weapon.destroyed){e.nextBig=rand(6.5,10);startQTE()}
 if(e.hp<=0){winBattle();return}
 renderEnemy();
}
function damageReduction(){
 const armor=Math.min(.18,.022*Math.sqrt(meta.upgrades.armor||0));
 return clamp(armor+(run.mods?.shield||0)+(run._barrierUntil>Date.now()?.55:0),0,.8);
}
function takeDamage(v){
 run.hp-=v*(1-damageReduction());if(meta.settings.shake)$("#gameViewport").animate([{transform:"translateX(-4px)"},{transform:"translateX(4px)"},{transform:"none"}],{duration:120});
 if(run.hp<=0){run.hp=0;endRun()}updateHUD()
}
function renderEnemy(){
 const e=run.enemy;if(!e)return;
 $("#enemyName").textContent=e.name;$("#enemyHpFill").style.width=`${clamp(e.hp/e.maxHp*100,0,100)}%`;
 $$(".enemyPart").forEach(b=>{const p=b.dataset.part;if(p==="core"){b.classList.toggle("targeted",e.target==="core");return}const part=e.parts[p];b.classList.toggle("destroyed",part.destroyed);b.classList.toggle("targeted",e.target===p)});
 $("#targetLabel").textContent=`PRIORITY: ${e.target==="core"?"HULL":e.parts[e.target]?.name||"HULL"}`;
}
function renderBattleActions(){
 const box=$("#battleActions");box.innerHTML="";if(!run)return;
 const activeWeapons=run.weapons.map(i=>weapons.find(x=>x.id===i.id)).filter(x=>x?.active).slice(0,4);
 activeWeapons.forEach(w=>{const b=document.createElement("button");let left=Math.max(0,(run.actionCooldowns[w.id]||0)-Date.now());b.textContent=left>0?`${w.active.name}\n${Math.ceil(left/1000)}s`:w.active.name;b.disabled=left>0;b.onclick=()=>useActive(w);box.appendChild(b)});
 while(box.children.length<4){const b=document.createElement("button");b.textContent="—";b.disabled=true;box.appendChild(b)}
}
function useActive(w){
 const a=w.active;if((run.actionCooldowns[w.id]||0)>Date.now())return;
 run.actionCooldowns[w.id]=Date.now()+a.cool*1000;
 if(a.type==="damage"){let d=a.power*(1+0.06*Math.sqrt(meta.upgrades.fire||0));run.enemy.hp-=d;if(run.enemy.target!=="core"&&run.enemy.parts[run.enemy.target]&&!run.enemy.parts[run.enemy.target].destroyed)run.enemy.parts[run.enemy.target].hp-=d*.65;toast(`${a.name}!`)}
 if(a.type==="emp"){const p=run.enemy.target;if(p!=="core"&&run.enemy.parts[p]&&!run.enemy.parts[p].destroyed){run.enemy.parts[p].disabledUntil=Date.now()+4500;run.enemy.nextBig+=3;toast("対象部位を一時停止")}}
 if(a.type==="barrier"){run._barrierUntil=Date.now()+3200;toast("防壁展開")}
 renderBattleActions();setTimeout(renderBattleActions,a.cool*1000+20)
}
function startQTE(){
 if($("#qteOverlay").classList.contains("active"))return;
 $("#qteOverlay").classList.add("active");let start=performance.now(),dur=Math.max(650,1500-run.distance*8),done=false;
 cancelAnimationFrame(qteAnim);
 function q(t){
   let p=clamp((t-start)/dur,0,1),size=220-(220-82)*p;$("#qteRing").style.width=size+"px";$("#qteRing").style.height=size+"px";
   if(p>=1){if(!done){done=true;$("#qteOverlay").classList.remove("active");takeDamage(run.enemy.atk*4.2);toast("大技直撃!")}return}
   qteAnim=requestAnimationFrame(q)
 } qteAnim=requestAnimationFrame(q);
 $("#qteBtn").onclick=()=>{
   if(done)return;done=true;cancelAnimationFrame(qteAnim);let ring=parseFloat(getComputedStyle($("#qteRing")).width),diff=Math.abs(ring-82);
   $("#qteOverlay").classList.remove("active");
   const leniency=22+(run.mods?.qte||0)*100;
   if(diff<leniency){toast("PERFECT DODGE")}
   else if(diff<leniency*2.4){takeDamage(run.enemy.atk*.9);toast("DODGE")}
   else{takeDamage(run.enemy.atk*2.6);toast("回避失敗")}
 };
}
function winBattle(){
 clearInterval(battleTimer);run.kills++;meta.totalKills++;
 const tokenBase=Math.max(1,Math.floor(2+run.distance*.28));const tokenGain=Math.max(1,Math.round(tokenBase*rand(.85,1.15)));
 run.tokensEarned+=tokenGain;meta.tokens+=tokenGain;
 const repair=(0.025+0.012*Math.sqrt(meta.upgrades.repair||0)+(run.mods?.repair||0))*run.maxHp;
 run.hp=Math.min(run.maxHp,run.hp+repair);
 run.mode="salvage";saveMeta();saveRun();showSalvage();toast(`海賊撃破 ◈ +${tokenGain}`);
}
function showSalvage(){
 switchMode("salvage");const box=$("#salvageParts");box.innerHTML="";
 Object.entries(run.enemy.parts).filter(([k,p])=>!p.destroyed).forEach(([k,p])=>{const b=document.createElement("button");b.textContent=p.name;b.onclick=()=>selectSalvage(k);box.appendChild(b)});
 if(!box.children.length){const b=document.createElement("button");b.textContent="船体残骸";b.onclick=()=>selectSalvage("core");box.appendChild(b)}
}
function selectSalvage(part){
 const pool=part==="weapon"?["weapon","weapon","equip","material"]:part==="engine"?["material","material","equip","weapon"]:part==="shield"?["equip","equip","material","weapon"]:["material","weapon","equip"];
 const type=pool[randi(0,pool.length-1)];
 let kind;if(type==="weapon")kind={type:"weapon",id:weapons[randi(0,weapons.length-1)].id};
 else if(type==="equip")kind={type:"equip",id:equipments[randi(0,equipments.length-1)].id};
 else kind={type:"material",mat:["metal","circuit","mech","cell"][randi(0,3)]};
 run.pendingSalvage={part,kind,amount:randi(2,4)};saveRun();startFishing(true);
}
function finishSalvage(success){
 if(success&&run.pendingSalvage){
   const s=run.pendingSalvage,bonus=1+0.03*Math.sqrt(meta.upgrades.salvage||0);
   if(s.kind.type==="material"){const n=Math.max(1,Math.round(s.amount*bonus));run.materials[s.kind.mat]+=n;toast(`${matName(s.kind.mat)} ×${n}`)}
   else{
     const inst={id:s.kind.id,uid:uid(),type:s.kind.type};if(run.storage.length<run.storageCap)run.storage.push(inst);else disassemble(s.kind);advanceBlueprint(s.kind);toast(`${itemName(s.kind)} 回収`);
   }
 }else toast("サルベージ失敗");
 run.pendingSalvage=null;run.enemy=null;run.nextPirate=run.distance+rand(2.3,3.6);run.nextBite=rand(3.5,7);run.mode="fishing";saveRun();switchMode("fishing");renderBattleActions()
}
function endRun(){
 clearInterval(battleTimer);clearInterval(gameTimer);cancelAnimationFrame(fishingAnim);cancelAnimationFrame(qteAnim);
 const dist=run.distance,k=run.kills,c=run.catches,t=run.tokensEarned;
 meta.totalDistance+=dist;meta.runs++;const newRec=dist>meta.bestDistance;if(newRec)meta.bestDistance=dist;
 saveMeta();run=null;saveRun();
 $("#resultDistance").textContent=dist.toFixed(2)+" ly";$("#resultKills").textContent=k;$("#resultCatches").textContent=c;$("#resultTokens").textContent="◈ "+t;
 $("#resultNewRecord").classList.toggle("active",newRec);showScreen("resultScreen")
}
function renderDrawer(tab){
 currentTab=tab;$("#drawer").classList.add("active");
 $$("#gameNav button").forEach(b=>b.classList.toggle("active",b.dataset.tab===tab));
 const title={upgrade:"強化",craft:"作成",storage:"倉庫",settings:"設定",fishing:"釣り"}[tab];$("#drawerTitle").textContent=title;
 if(tab==="upgrade")renderRunUpgrade();
 if(tab==="craft")renderCraft();
 if(tab==="storage")renderStorage();
 if(tab==="settings")renderRunSettings();
 if(tab==="fishing"){$("#drawer").classList.remove("active")}
}
function renderRunUpgrade(){
 const cost=8+run.shipLevel*6;
 let h=`<div class="statRow"><span>船体 Mk.${run.shipLevel}</span><strong>HP ${run.maxHp}</strong></div>
 <div class="statRow"><span>最大負荷</span><strong>${run.maxLoad}</strong></div><div class="statRow"><span>武器 / 装備枠</span><strong>${run.weaponSlots} / ${run.equipSlots}</strong></div>
 <div class="statRow"><span>倉庫</span><strong>${run.storage.length}/${run.storageCap}</strong></div>
 <button id="shipUpgradeBtn" class="primary" ${run.materials.metal<cost?"disabled":""}>船体強化：金属片 ${cost}</button>
 <h3>釣具</h3>`;
 for(const key of ["rod","reel","line"]){h+=`<div class="statRow"><span>${{rod:"ロッド",reel:"リール",line:"ライン"}[key]}</span><select data-rod="${key}">${rodTypes.map(x=>`<option ${run.rod[key]===x?"selected":""}>${x}</option>`).join("")}</select></div>`}
 h+=`<div class="statRow"><span>フック</span><select data-rod="hook">${hookTypes.map(x=>`<option value="${x.id}" ${run.rod.hook===x.id?"selected":""}>${x.name}</option>`).join("")}</select></div>`;
 $("#drawerContent").innerHTML=h;
 $("#shipUpgradeBtn").onclick=()=>{if(run.materials.metal>=cost){run.materials.metal-=cost;run.shipLevel++;run.hp+=55;recalcPlayer();saveRun();renderRunUpgrade();toast("船体アップグレード")}};
 $$("[data-rod]").forEach(s=>s.onchange=()=>{run.rod[s.dataset.rod]=s.value;saveRun();toast("釣具を変更")})
}
function materialsHTML(){return `<div class="materials">${Object.entries(run.materials).map(([k,v])=>`<span class="chip">${matName(k)} ${v}</span>`).join("")}</div>`}
function afford(cost){return Object.entries(cost).every(([k,v])=>run.materials[k]>=v)}
function costText(c){return Object.entries(c).map(([k,v])=>`${matName(k)}${v}`).join(" / ")}
function renderCraft(){
 let h=materialsHTML()+`<h3>武器</h3><div class="cardGrid">`;
 for(const w of weapons){const unlocked=meta.unlocks.weapons.includes(w.id);h+=`<div class="itemCard"><h3>${unlocked?w.name:"？？？？"}</h3><p>${unlocked?w.desc:"設計図未解析"}</p>${unlocked?`<p>ATK ${w.atk} / 負荷 ${w.load}</p><p>${costText(w.cost)}</p><div class="actions"><button data-craft="weapon:${w.id}" ${afford(w.cost)?"":"disabled"}>作成</button></div>`:""}</div>`}
 h+=`</div><h3>装備</h3><div class="cardGrid">`;
 for(const e of equipments){const unlocked=meta.unlocks.equipments.includes(e.id);h+=`<div class="itemCard"><h3>${unlocked?e.name:"？？？？"}</h3><p>${unlocked?e.desc:"設計図未解析"}</p>${unlocked?`<p>負荷 ${e.load}</p><p>${costText(e.cost)}</p><div class="actions"><button data-craft="equip:${e.id}" ${afford(e.cost)?"":"disabled"}>作成</button></div>`:""}</div>`}
 h+=`</div>`;$("#drawerContent").innerHTML=h;
 $$("[data-craft]").forEach(b=>b.onclick=()=>craft(...b.dataset.craft.split(":")))
}
function craft(type,id){
 const def=(type==="weapon"?weapons:equipments).find(x=>x.id===id);if(!afford(def.cost))return;Object.entries(def.cost).forEach(([k,v])=>run.materials[k]-=v);
 const inst={type,id,uid:uid()};if(run.storage.length<run.storageCap)run.storage.push(inst);else{toast("倉庫が満杯です");Object.entries(def.cost).forEach(([k,v])=>run.materials[k]+=v);return}
 saveRun();renderCraft();toast(`${def.name} 作成`)
}
function renderStorage(){
 let h=materialsHTML()+`<div class="statRow"><span>倉庫</span><strong>${run.storage.length}/${run.storageCap}</strong></div><h3>装備中の武器</h3><div class="cardGrid">`;
 run.weapons.forEach(i=>{const w=weapons.find(x=>x.id===i.id);h+=itemCard(i,"weapon",w,true)});
 h+=`</div><h3>装備中の装備</h3><div class="cardGrid">`;run.equipments.forEach(i=>{const e=equipments.find(x=>x.id===i.id);h+=itemCard(i,"equip",e,true)});
 h+=`</div><h3>倉庫</h3><div class="cardGrid">`;run.storage.forEach(i=>{const d=(i.type==="weapon"?weapons:equipments).find(x=>x.id===i.id);h+=itemCard(i,i.type,d,false)});
 h+=`</div>`;$("#drawerContent").innerHTML=h;
 $$("[data-equip]").forEach(b=>b.onclick=()=>equipFromStorage(b.dataset.equip));
 $$("[data-unequip]").forEach(b=>b.onclick=()=>unequipItem(b.dataset.unequip));
 $$("[data-disasm]").forEach(b=>b.onclick=()=>disasmStorage(b.dataset.disasm))
}
function itemCard(i,type,d,equipped){return `<div class="itemCard"><h3>${d.name}</h3><p>${d.desc}</p><p>負荷 ${d.load}</p><div class="actions">${equipped?`<button data-unequip="${i.uid}">外す</button>`:`<button data-equip="${i.uid}">装備</button><button data-disasm="${i.uid}">分解</button>`}</div></div>`}
function equipFromStorage(uidv){
 const idx=run.storage.findIndex(x=>x.uid===uidv);if(idx<0)return;const inst=run.storage[idx],def=(inst.type==="weapon"?weapons:equipments).find(x=>x.id===inst.id);
 if(getLoad()+def.load>run.maxLoad)return toast("装備負荷オーバー");
 const arr=inst.type==="weapon"?run.weapons:run.equipments,slots=inst.type==="weapon"?run.weaponSlots:run.equipSlots;if(arr.length>=slots)return toast("スロット不足");
 run.storage.splice(idx,1);arr.push({id:inst.id,uid:inst.uid});recalcPlayer();saveRun();renderStorage()
}
function unequipItem(uidv){
 let arr,type;let idx=run.weapons.findIndex(x=>x.uid===uidv);if(idx>=0){arr=run.weapons;type="weapon"}else{idx=run.equipments.findIndex(x=>x.uid===uidv);arr=run.equipments;type="equip"}
 if(idx<0)return;if(run.storage.length>=run.storageCap)return toast("倉庫満杯");const [x]=arr.splice(idx,1);run.storage.push({...x,type});recalcPlayer();saveRun();renderStorage()
}
function disassemble(kind){
 const d=(kind.type==="weapon"?weapons:equipments).find(x=>x.id===kind.id);run.materials.metal+=Math.max(1,Math.floor((d.load||2)*.8));if(Math.random()<.5)run.materials.circuit++;if(Math.random()<.3)run.materials.mech++;
}
function disasmStorage(uidv){const idx=run.storage.findIndex(x=>x.uid===uidv);if(idx<0)return;const [x]=run.storage.splice(idx,1);disassemble(x);saveRun();renderStorage();toast("分解しました")}
function renderRunSettings(){
 $("#drawerContent").innerHTML=`<div class="settingsList"><button id="saveExitBtn">セーブしてメニューへ</button><button id="endRunBtn" class="danger">ランを終了する</button></div>`;
 $("#saveExitBtn").onclick=()=>{saveRun();clearInterval(gameTimer);clearInterval(battleTimer);showScreen("menuScreen")};
 $("#endRunBtn").onclick=()=>endRun();
}

$$(".backBtn").forEach(b=>b.onclick=()=>showScreen(b.dataset.back));
$("#upgradeMenuBtn").onclick=()=>{renderUpgradePanel();showScreen("upgradeScreen")};
$("#recordsMenuBtn").onclick=()=>{renderRecords();showScreen("recordsScreen")};
$("#settingsMenuBtn").onclick=()=>showScreen("settingsScreen");
$("#doUpgradeBtn").onclick=doUpgrade;
$("#resultMenuBtn").onclick=()=>showScreen("menuScreen");
$("#resultUpgradeBtn").onclick=()=>{renderUpgradePanel();showScreen("upgradeScreen")};
$("#playBtn").onclick=()=>{
 const old=loadRun();
 if(old){run=old;recalcPlayer(); if(run.mode==="battle"){createEnemy();} startGame();}
 else{
   const max=meta.upgrades.beacon*2;if(max>0){
     const val=prompt(`開始地点を入力してください（0〜${max} ly / 2刻み推奨）`,String(max));
     if(val===null)return;newRun(clamp(Number(val)||0,0,max));
   }else newRun(0)
 }
};
$("#closeDrawerBtn").onclick=()=>$("#drawer").classList.remove("active");
$$("#gameNav button").forEach(b=>b.onclick=()=>renderDrawer(b.dataset.tab));
$$(".enemyPart").forEach(b=>b.onclick=()=>{if(run?.mode==="battle"){const p=b.dataset.part;if(p==="core"||!run.enemy.parts[p]?.destroyed){run.enemy.target=p;renderEnemy()}}});
$("#resetSaveBtn").onclick=()=>{if(confirm("セーブデータをすべて削除しますか？")){localStorage.removeItem(SAVE_KEY);localStorage.removeItem(SAVE_KEY+"_run");meta=defaultMeta();saveMeta();updateMetaUI();toast("初期化しました")}};
for(const [id,key] of [["bgmToggle","bgm"],["seToggle","se"],["shakeToggle","shake"],["vibeToggle","vibe"]]){
 $("#"+id).checked=meta.settings[key];$("#"+id).onchange=e=>{meta.settings[key]=e.target.checked;saveMeta()}
}
renderUpgradeTabs();renderUpgradePanel();updateMetaUI();
window.addEventListener("beforeunload",()=>{if(run)saveRun();saveMeta()});
})();

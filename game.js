
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
const fishingRecipes={
 rod:{
   "安定":{metal:3,mech:2},
   "高速":{metal:2,mech:3,circuit:1},
   "重量":{metal:5,mech:2}
 },
 reel:{
   "安定":{metal:2,mech:3},
   "高速":{metal:2,mech:3,circuit:2},
   "重量":{metal:4,mech:3}
 },
 line:{
   "安定":{metal:2,mech:1,circuit:2},
   "高速":{metal:2,circuit:3},
   "重量":{metal:5,mech:1}
 },
 hook:{
   magnet:{metal:4,mech:2},
   recovery:{metal:3,mech:3},
   military:{metal:5,circuit:3,cell:1},
   probe:{metal:2,circuit:5,cell:1}
 }
};


const visualAssets={
 materials:{
   metal:"assets/materials/mat_metal.png",
   circuit:"assets/materials/mat_circuit.png",
   mech:"assets/materials/mat_mech.png",
   cell:"assets/materials/mat_cell.png"
 },
 ships:{
   1:"assets/ships/ship_mk1.png",
   2:"assets/ships/ship_mk2.png",
   3:"assets/ships/ship_mk3.png",
   4:"assets/ships/ship_mk4.png"
 },
 weapons:{
   pulse:"assets/weapons/w_pulse.png",
   bolt:"assets/weapons/w_twin.png",
   laser:"assets/weapons/w_laser.png",
   missile:"assets/weapons/w_missile.png",
   emp:"assets/weapons/w_emp.png",
   barrier:"assets/weapons/w_barrier.png",
   scatter:"assets/weapons/w_scatter.png",
   piercer:"assets/weapons/w_piercer.png"
 },
 equipments:{
   armorplate:"assets/equipment/e_armor.png",
   shield:"assets/equipment/e_shield.png",
   repair:"assets/equipment/e_repair.png",
   aim:"assets/equipment/e_aim.png",
   cooler:"assets/equipment/e_cooler.png",
   bulk:"assets/equipment/e_cargo.png",
   sensor:"assets/equipment/e_sensor.png",
   stabilizer:"assets/equipment/e_salvage.png"
 }
};
function visualImg(src,alt="",cls="assetSprite"){
 return `<img class="${cls}" src="${src}" alt="${alt}" loading="lazy" draggable="false">`;
}
function hullAsset(){
 const mk=Math.max(1,Math.min(4,run?.shipLevel||1));
 return visualAssets.ships[mk];
}

const defaultMeta=()=>({
 tokens:0,
 upgrades:Object.fromEntries(upgradeDefs.map(x=>[x.id,0])),
 unlocks:{weapons:["pulse"],equipments:["armorplate","shield","repair"]},
 blueprints:{},
 discovered:{weapons:[],equipments:[]},
 bestDistance:0,totalDistance:0,totalKills:0,totalCatches:0,runs:0,
 settings:{bgm:true,se:true,shake:true,vibe:true}
});
let meta=loadMeta();
let run=null, gameTimer=null, fishingAnim=null, battleTimer=null, qteAnim=null, currentUpgrade="hull", currentTab="fishing", uiPaused=false;

function loadMeta(){
 try{
   const d=JSON.parse(localStorage.getItem(SAVE_KEY));
   if(d){
     const out=Object.assign(defaultMeta(),d,{
       settings:Object.assign(defaultMeta().settings,d.settings||{}),
       upgrades:Object.assign(defaultMeta().upgrades,d.upgrades||{})
     });
     out.discovered=Object.assign({weapons:[],equipments:[]},d.discovered||{});
     if(!Array.isArray(out.discovered.weapons))out.discovered.weapons=[];
     if(!Array.isArray(out.discovered.equipments))out.discovered.equipments=[];
     return out;
   }
 }catch(e){}
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

function blueprintNeed(def){ return def.load>=5?4:def.load>=3?3:2; }
function blueprintKey(type,id){ return `${type}:${id}`; }
function blueprintCount(type,id){ return meta.blueprints[blueprintKey(type,id)]||0; }
function isBlueprintUnlocked(type,id){
 return type==="weapon"?meta.unlocks.weapons.includes(id):meta.unlocks.equipments.includes(id);
}
function isMachineDiscovered(type,id){
 const arr=type==="weapon"?meta.discovered.weapons:meta.discovered.equipments;
 return arr.includes(id);
}
function markMachineDiscovered(type,id){
 const arr=type==="weapon"?meta.discovered.weapons:meta.discovered.equipments;
 if(arr.includes(id))return false;
 arr.push(id);saveMeta();return true;
}
function normalizeResumeState(){
 ensureRunShape();
 if(!Number.isFinite(run.nextBite) || run.nextBite<=0) run.nextBite=rand(1.5,4.5);
 if(!Number.isFinite(run.nextPirate) || run.nextPirate<=run.distance) run.nextPirate=run.distance+rand(2.2,3.6);
 if(run.pendingSignal && !run.pendingCatch) run.pendingSignal=null;
 if(run.mode==="warning" && !run.enemy){run.mode="fishing";run.nextPirate=run.distance+rand(.4,1.2);}
 if(run.mode==="fishing" && run.pendingCatch){run.mode="fishingMini";}
}
function setGameNavLocked(locked){
 const nav=$("#gameNav");nav.classList.toggle("locked",!!locked);
 $$("#gameNav button").forEach(b=>b.disabled=!!locked);
}
function lootIconFor(kind){
 if(kind.type==="material")return {metal:"▰",circuit:"▦",mech:"⚙",cell:"◆"}[kind.mat]||"◇";
 if(kind.type==="weapon")return "▰━";
 return "⬡";
}
function showLootReveal(kind,amount,isNew,detail,onDone){
 const overlay=$("#lootReveal");
 $("#lootIcon").textContent=lootIconFor(kind);
 $("#lootName").textContent=kind.type==="material"?`${matName(kind.mat)} ×${amount}`:itemName(kind);
 $("#lootKind").textContent=kind.type==="material"?"MATERIAL":kind.type==="weapon"?"WEAPON":"EQUIPMENT";
 $("#lootDetail").textContent=detail||"";
 $("#lootNew").classList.toggle("active",!!isNew);
 overlay.classList.add("active");
 setGameNavLocked(true);
 $("#lootOkBtn").onclick=()=>{
   overlay.classList.remove("active");
   if(onDone)onDone();
 };
}
function newRun(startDistance=null){
 const beacon=meta.upgrades.beacon||0;
 const start=startDistance ?? beacon*2;
 run={
   distance:start,hp:100,maxHp:100,shipLevel:1,maxLoad:10,weaponSlots:2,equipSlots:2,storageCap:4,
   materials:{metal:5,circuit:3,mech:2,cell:1},
   weapons:[{id:"pulse",uid:uid(),lvl:1}],equipments:[{id:"armorplate",uid:uid(),lvl:1}],storage:[],
   rod:{rod:"標準",reel:"標準",line:"標準",hook:"standard"},
   fishingInventory:{rod:["標準"],reel:["標準"],line:["標準"],hook:["standard"]},
   kills:0,catches:0,tokensEarned:0,
   nextBite:rand(5,9),nextPirate:start+rand(2.4,3.8),mode:"fishing",
   pendingCatch:null,pendingSalvage:null,pendingOverflow:null,enemy:null,actionCooldowns:{},
   savedAt:Date.now()
 };
 recalcPlayer(); saveRun(); startGame();
}
function uid(){return Math.random().toString(36).slice(2,10)}
function ensureRunShape(){
 if(!run)return;
 if(!run.rod) run.rod={rod:"標準",reel:"標準",line:"標準",hook:"standard"};
 if(!run.fishingInventory) run.fishingInventory={rod:["標準"],reel:["標準"],line:["標準"],hook:["standard"]};
 for(const k of ["rod","reel","line"]){
   if(!Array.isArray(run.fishingInventory[k])) run.fishingInventory[k]=["標準"];
   if(!run.fishingInventory[k].includes("標準")) run.fishingInventory[k].unshift("標準");
   if(run.rod[k] && !run.fishingInventory[k].includes(run.rod[k])) run.fishingInventory[k].push(run.rod[k]);
 }
 if(!Array.isArray(run.fishingInventory.hook)) run.fishingInventory.hook=["standard"];
 if(!run.fishingInventory.hook.includes("standard")) run.fishingInventory.hook.unshift("standard");
 if(run.rod.hook && !run.fishingInventory.hook.includes(run.rod.hook)) run.fishingInventory.hook.push(run.rod.hook);
 if(!run.materials) run.materials={metal:0,circuit:0,mech:0,cell:0};
 for(const k of ["metal","circuit","mech","cell"]) if(typeof run.materials[k]!=="number") run.materials[k]=0;
 if(!Array.isArray(run.storage)) run.storage=[];
 if(!Array.isArray(run.weapons)) run.weapons=[];
 if(!Array.isArray(run.equipments)) run.equipments=[];
 if(!run.pendingOverflow) run.pendingOverflow=null;
 if(!Number.isFinite(run.distance))run.distance=0;
 if(!Number.isFinite(run.nextBite))run.nextBite=rand(2,5);
 if(!Number.isFinite(run.nextPirate))run.nextPirate=run.distance+rand(2.5,4);
}
function recalcPlayer(){
 if(!run)return;
 ensureRunShape();
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
 normalizeResumeState();
 uiPaused=false;
 $("#subScreen").classList.remove("active");
 $("#drawer").classList.remove("active");
 $$("#gameNav button").forEach(b=>b.classList.toggle("active",b.dataset.tab==="fishing"));
 showScreen("gameScreen");
 $("#biteIndicator").style.display="none";
 setGameNavLocked(false);

 if(run.mode==="battle" && run.enemy){
   startBattle();
 }else if(run.mode==="salvage" && run.enemy){
   showSalvage();
 }else if(run.mode==="salvageFishing" && run.pendingSalvage){
   switchMode("salvage");
   setTimeout(()=>startFishing(true),80);
 }else if(run.mode==="fishingMini" && run.pendingCatch){
   switchMode("fishing");
   setTimeout(()=>startFishing(false),80);
 }else{
   run.mode="fishing";
   switchMode("fishing");
 }
 clearInterval(gameTimer);
 gameTimer=setInterval(gameTick,100);
 renderBattleActions();
 updateHUD();
 saveRun();
}
function gameTick(){
 if(!run || !$("#gameScreen").classList.contains("active"))return;
 if(run.mode==="fishing" && !uiPaused){
   run.distance+=0.00167; // ~1 ly/min
   run.nextBite-=0.1;
   if(run.nextBite<=0 && !run.pendingCatch){triggerBite()}
   if(run.distance>=run.nextPirate && !run.pendingCatch){triggerPirate()}
 }
 updateHUD();
 if(Math.floor(run.distance*10)!==run._saveMark){run._saveMark=Math.floor(run.distance*10);saveRun()}
}
function triggerBite(){
 if(!run || run.mode!=="fishing" || uiPaused || run.pendingSignal || run.pendingCatch)return;
 const hook=run.rod.hook;
 let rareBonus=hook==="probe"?0.08:0;
 const roll=Math.random();
 const signal=roll<0.05+rareBonus?"!?":roll<0.14?"!!!":roll<0.38?"!!":"!";
 run.pendingSignal=signal;
 run.mode="biteSignal";
 saveRun();
 setGameNavLocked(true);
 $("#biteIndicator").textContent=signal;
 $("#biteIndicator").style.display="block";
 setTimeout(()=>{
   if(!run)return;
   $("#biteIndicator").style.display="none";
   if(uiPaused){run.mode="fishing";run.pendingSignal=null;run.nextBite=rand(1.5,3.5);setGameNavLocked(false);saveRun();return;}
   const exactSignal=run.pendingSignal||signal;
   createCatch(exactSignal);
   run.pendingSignal=null;
   startFishing(false);
 },850);
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
 setGameNavLocked(true);
 $("#fishingMinigame").classList.add("active");
 $("#fishTitle").textContent=salvage?"SALVAGE HOOK":"SIGNAL "+(run.pendingCatch?.signal||"!");
 let line=.45,zone=.48,dir=1,progress=0,last=performance.now();
 let tapBoost=0,holding=false,holdStarted=0,longHold=false;
 const mods=rodMod(), reelPenalty=1-Math.min(.45,.05*Math.sqrt(meta.upgrades.reel||0));
 const btn=$("#reelBtn");
 const HOLD_THRESHOLD=220;

 btn.onclick=null;
 let tapLocked=false;
 btn.onpointerdown=(e)=>{
   e.preventDefault();
   if(tapLocked)return;
   tapLocked=true;
   holding=true;
   longHold=false;
   holdStarted=performance.now();
   // 押した瞬間には一切上昇しない。
 };
 btn.onpointerup=(e)=>{
   e.preventDefault();
   if(!tapLocked)return;
   const held=performance.now()-holdStarted;
   // 短押しの時だけ、離した瞬間に上昇。
   // 長押し判定に入った場合は、離しても上昇しない。
   if(held<HOLD_THRESHOLD && !longHold){
     tapBoost=Math.min(.25,tapBoost+0.14+mods.heavy*0.24);
   }
   tapLocked=false;holding=false;holdStarted=0;longHold=false;
 };
 const cancelHold=()=>{tapLocked=false;holding=false;holdStarted=0;longHold=false;};
 btn.onpointercancel=cancelHold;
 btn.onpointerleave=cancelHold;

 cancelAnimationFrame(fishingAnim);
 function loop(t){
   let dt=Math.min(.04,(t-last)/1000);last=t;
   zone+=dir*dt*(0.28+(run.pendingCatch?.quality||2)*0.035);
   if(zone>.78){zone=.78;dir=-1}
   if(zone<.08){zone=.08;dir=1}

   // 何もしなくても下がる。タップ直後は大きく上昇。
   line += dt*0.32;
   if(tapBoost>0){
     const applied=Math.min(tapBoost,dt*4.2);
     line -= applied;
     tapBoost -= applied;
   }
   // 長押し閾値を超えたら下方向へ強く引く。
   // この時点で長押し扱いになり、離しても上昇しない。
   if(holding && holdStarted && t-holdStarted>HOLD_THRESHOLD){
     longHold=true;
     line += dt*0.72;
   }
   line=clamp(line,.01,.97);

   const width=.23+mods.stable;
   const zoneTop=zone-width/2, zoneBottom=zone+width/2;
   const inZone=line>=zoneTop && line<=zoneBottom;
   $("#fishLine").classList.toggle("inside",inZone);
   progress += dt*(inZone?(0.32+mods.fast):(-0.18*reelPenalty));
   progress=clamp(progress,0,1);

   $("#successZone").style.top=`${zoneTop*100}%`;
   $("#successZone").style.height=`${width*100}%`;
   $("#fishLine").style.top=`${line*100}%`;
   $("#fishProgress").style.width=`${progress*100}%`;
   $("#fishProgressText").textContent=`${Math.floor(progress*100)}%`;

   if(progress>=1){finishFishing(true,salvage);return}
   fishingAnim=requestAnimationFrame(loop);
 }
 fishingAnim=requestAnimationFrame(loop);
}
function finishFishing(success,salvage){
 cancelAnimationFrame(fishingAnim);
 $("#fishingMinigame").classList.remove("active");
 if(salvage){finishSalvage(success);return}
 if(!success || !run.pendingCatch){
   run.pendingCatch=null;run.nextBite=rand(4,8);run.mode="fishing";setGameNavLocked(false);saveRun();switchMode("fishing");return;
 }
 run.catches++;meta.totalCatches++;
 const c=run.pendingCatch;
 let isNew=false,detail="";
 if(c.kind.type==="material"){
   run.materials[c.kind.mat]+=c.amount;
   detail="クラフトや機体強化に使用できます。";
 }else{
   isNew=markMachineDiscovered(c.kind.type,c.kind.id);
   const inst={id:c.kind.id,uid:uid(),type:c.kind.type,lvl:1};
   const bp=advanceBlueprint(c.kind);
   detail=bp.unlockedNow?"設計図完成！ 製作可能になりました。":
          bp.unlocked?"設計図は解禁済みです。":
          `設計図解析 ${bp.count}/${bp.need}（あと${bp.remaining}回）`;
   if(run.storage.length<run.storageCap) run.storage.push(inst);
   else{
     run.pendingOverflow={inst};
     detail+=" 倉庫が満杯です。新しい品を分解するか、倉庫から1つ分解して空きを作ってください。";
   }
 }
 const revealKind={...c.kind};
 run.pendingCatch=null;
 run.nextBite=rand(5,9);
 run.mode="lootReveal";
 saveMeta();saveRun();switchMode("fishing");
 showLootReveal(revealKind,c.amount,isNew,detail,()=>{
   if(run.pendingOverflow){
     openOverflowChoice(()=>{ run.mode="fishing";setGameNavLocked(false);saveRun();switchMode("fishing"); });
     return;
   }
   run.mode="fishing";setGameNavLocked(false);saveRun();switchMode("fishing");
 });
}
function matName(m){return {metal:"金属片",circuit:"回路基板",mech:"機械部品",cell:"動力セル"}[m]||m}
function itemName(k){const a=k.type==="weapon"?weapons:equipments;return a.find(x=>x.id===k.id)?.name||k.id}
function advanceBlueprint(k){
 const key=blueprintKey(k.type,k.id);
 const def=(k.type==="weapon"?weapons:equipments).find(x=>x.id===k.id);
 if(!def)return {unlocked:false,count:0,need:0,remaining:0};
 const need=blueprintNeed(def);
 if(isBlueprintUnlocked(k.type,k.id))return {unlocked:true,count:need,need,remaining:0};
 meta.blueprints[key]=(meta.blueprints[key]||0)+1;
 const count=meta.blueprints[key];
 let unlockedNow=false;
 if(count>=need){
   const arr=k.type==="weapon"?meta.unlocks.weapons:meta.unlocks.equipments;
   if(!arr.includes(k.id))arr.push(k.id);
   unlockedNow=true;
 }
 saveMeta();
 return {unlocked:count>=need,unlockedNow,count,need,remaining:Math.max(0,need-count)};
}
function triggerPirate(){
 if(!run||run.mode!=="fishing"||uiPaused)return;
 run.mode="warning";saveRun();setGameNavLocked(true);
 $("#warningBanner").style.display="block";
 setTimeout(()=>{
   if(!run)return;
   $("#warningBanner").style.display="none";
   createEnemy();startBattle();
 },1800);
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
 setGameNavLocked(true);
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
   let isNew=false,detail="",shownAmount=s.amount;
   if(s.kind.type==="material"){
     shownAmount=Math.max(1,Math.round(s.amount*bonus));
     run.materials[s.kind.mat]+=shownAmount;
     detail="海賊船から回収した素材。";
   }else{
     isNew=markMachineDiscovered(s.kind.type,s.kind.id);
     const inst={id:s.kind.id,uid:uid(),type:s.kind.type,lvl:1};
     const bp=advanceBlueprint(s.kind);
     detail=bp.unlockedNow?"設計図完成！ 製作可能になりました。":
            bp.unlocked?"設計図は解禁済みです。":
            `設計図解析 ${bp.count}/${bp.need}（あと${bp.remaining}回）`;
     if(run.storage.length<run.storageCap) run.storage.push(inst);
     else{
       run.pendingOverflow={inst};
       detail+=" 倉庫が満杯です。新しい品を分解するか、倉庫から1つ分解して空きを作ってください。";
     }
   }
   const reveal={...s.kind};
   run.pendingSalvage=null;run.enemy=null;run.nextPirate=run.distance+rand(2.3,3.6);run.nextBite=rand(3.5,7);run.mode="lootReveal";saveRun();
   switchMode("fishing");
   showLootReveal(reveal,shownAmount,isNew,detail,()=>{
     if(run.pendingOverflow){
       openOverflowChoice(()=>{ run.mode="fishing";setGameNavLocked(false);saveRun();switchMode("fishing");renderBattleActions(); });
       return;
     }
     run.mode="fishing";setGameNavLocked(false);saveRun();switchMode("fishing");renderBattleActions();
   });
 }else{
   toast("サルベージ失敗");
   run.pendingSalvage=null;run.enemy=null;run.nextPirate=run.distance+rand(2.3,3.6);run.nextBite=rand(3.5,7);run.mode="fishing";setGameNavLocked(false);saveRun();switchMode("fishing");renderBattleActions();
 }
}
function endRun(){
 setGameNavLocked(false);
 $("#lootReveal").classList.remove("active");
 clearInterval(battleTimer);clearInterval(gameTimer);cancelAnimationFrame(fishingAnim);cancelAnimationFrame(qteAnim);
 const dist=run.distance,k=run.kills,c=run.catches,t=run.tokensEarned;
 meta.totalDistance+=dist;meta.runs++;const newRec=dist>meta.bestDistance;if(newRec)meta.bestDistance=dist;
 saveMeta();run=null;saveRun();
 $("#resultDistance").textContent=dist.toFixed(2)+" ly";$("#resultKills").textContent=k;$("#resultCatches").textContent=c;$("#resultTokens").textContent="◈ "+t;
 $("#resultNewRecord").classList.toggle("active",newRec);showScreen("resultScreen")
}
function openSubScreen(tab){
 currentTab=tab;
 uiPaused=true;
 $("#subScreen").classList.add("active");
 $("#subScreenTitle").textContent={upgrade:"強化",craft:"作成",storage:"倉庫",settings:"設定"}[tab]||"";
 if(tab==="upgrade")renderUpgradeSubScreen("ship","hull");
 if(tab==="craft")renderCraftSubScreen();
 if(tab==="storage")renderStorageSubScreen();
 if(tab==="settings")renderSettingsSubScreen();
}
function closeSubScreen(){
 $("#subScreen").classList.remove("active");
 uiPaused=false;
 currentTab="fishing";
 $$("#gameNav button").forEach(b=>b.classList.toggle("active",b.dataset.tab==="fishing"));
}
function equipmentSummaryHTML(){
 return `<div class="previewPanel loadSummary">
   <div class="statRow"><span>装備負荷</span><strong>${getLoad()} / ${run.maxLoad}</strong></div>
   <div class="statRow"><span>武器スロット</span><strong>${run.weapons.length} / ${run.weaponSlots}</strong></div>
   <div class="statRow"><span>装備スロット</span><strong>${run.equipments.length} / ${run.equipSlots}</strong></div>
   <div class="statRow"><span>倉庫</span><strong>${run.storage.length} / ${run.storageCap}</strong></div>
 </div>`;
}
function fishingOwned(type,id){
 ensureRunShape();
 return run.fishingInventory[type]?.includes(id);
}
function renderUpgradeSubScreen(major="ship",minor=null){
 const body=$("#subScreenBody");
 if(major==="ship" && !minor) minor="hull";
 if(major==="fishing" && !minor) minor="rod";
 let h=`<div class="majorTabs">
   <button data-major="ship" class="${major==="ship"?"active":""}">戦艦</button>
   <button data-major="fishing" class="${major==="fishing"?"active":""}">釣り</button>
 </div>`;
 if(major==="ship"){
   h+=`<div class="minorTabs">
     <button data-minor="hull" class="${minor==="hull"?"active":""}">機体</button>
     <button data-minor="equipment" class="${minor==="equipment"?"active":""}">装備</button>
     <button data-minor="weapon" class="${minor==="weapon"?"active":""}">武器</button>
   </div>`;
   if(minor==="hull"){
     const cost=8+run.shipLevel*6;
     h+=`<div class="previewPanel"><h3>船体 Mk.${run.shipLevel}</h3>
       <div class="statRow"><span>HP</span><strong>${run.maxHp}</strong></div>
       <div class="statRow"><span>最大負荷</span><strong>${run.maxLoad}</strong></div>
       <div class="statRow"><span>武器枠</span><strong>${run.weaponSlots}</strong></div>
       <div class="statRow"><span>装備枠</span><strong>${run.equipSlots}</strong></div>
       <div class="statRow"><span>倉庫</span><strong>${run.storage.length}/${run.storageCap}</strong></div>
       <button id="shipUpgradeBtn2" class="primary" ${run.materials.metal<cost?"disabled":""}>船体強化：金属片 ${cost}</button>
     </div>`;
   } else if(minor==="equipment"){
     h+=equipmentSummaryHTML();
     h+=`<div class="previewPanel"><h3>装備中</h3><p>耐久・防御・補助系のパッシブ装備。</p></div><div class="cardGrid">`;
     run.equipments.forEach(i=>{const d=equipments.find(x=>x.id===i.id);h+=itemCard(i,"equip",d,true)});
     h+=`</div><h3>倉庫から装備</h3><div class="cardGrid">`;
     run.storage.filter(x=>x.type==="equip").forEach(i=>{const d=equipments.find(x=>x.id===i.id);h+=itemCard(i,"equip",d,false)});
     h+=`</div>`;
   } else {
     h+=equipmentSummaryHTML();
     h+=`<div class="previewPanel"><h3>武器</h3><p>自動攻撃。アクティブ能力は一部の武器のみ。</p></div><div class="cardGrid">`;
     run.weapons.forEach(i=>{const d=weapons.find(x=>x.id===i.id);h+=itemCard(i,"weapon",d,true)});
     h+=`</div><h3>倉庫から装備</h3><div class="cardGrid">`;
     run.storage.filter(x=>x.type==="weapon").forEach(i=>{const d=weapons.find(x=>x.id===i.id);h+=itemCard(i,"weapon",d,false)});
     h+=`</div>`;
   }
 }else{
   h+=`<div class="minorTabs">
     <button data-minor="rod" class="${minor==="rod"?"active":""}">ロッド</button>
     <button data-minor="reel" class="${minor==="reel"?"active":""}">リール</button>
     <button data-minor="line" class="${minor==="line"?"active":""}">ライン</button>
     <button data-minor="hook" class="${minor==="hook"?"active":""}">フック</button>
   </div>`;
   if(minor==="hook"){
     h+=`<div class="previewPanel"><h3>${hookTypes.find(x=>x.id===run.rod.hook)?.name||"標準フック"}</h3><p>${hookTypes.find(x=>x.id===run.rod.hook)?.desc||""}</p></div><div class="cardGrid">`;
     hookTypes.filter(x=>fishingOwned("hook",x.id)).forEach(x=>{h+=`<div class="itemCard"><h3>${x.name}</h3><p>${x.desc}</p><div class="actions"><button data-sethook="${x.id}" ${run.rod.hook===x.id?"disabled":""}>装備</button></div></div>`});
     h+=`</div>`;
   }else{
     const label={rod:"ロッド",reel:"リール",line:"ライン"}[minor];
     h+=`<div class="previewPanel"><h3>${label}: ${run.rod[minor]}</h3><p>基本的な釣り操作性能を調整する部位。</p></div><div class="cardGrid">`;
     rodTypes.filter(x=>fishingOwned(minor,x)).forEach(x=>{h+=`<div class="itemCard"><h3>${x}${label}</h3><p>${x==="安定"?"成功ゾーンへの追従が楽になる":x==="高速"?"回収進捗が速くなる":x==="重量"?"タップ上昇力が強くなる":"標準性能"}</p><div class="actions"><button data-setrod="${minor}:${x}" ${run.rod[minor]===x?"disabled":""}>装備</button></div></div>`});
     h+=`</div>`;
   }
 }
 body.innerHTML=h;
 $$("[data-major]").forEach(b=>b.onclick=()=>renderUpgradeSubScreen(b.dataset.major,null));
 $$("[data-minor]").forEach(b=>b.onclick=()=>renderUpgradeSubScreen(major,b.dataset.minor));
 if($("#shipUpgradeBtn2"))$("#shipUpgradeBtn2").onclick=()=>{const cost=8+run.shipLevel*6;if(run.materials.metal>=cost){run.materials.metal-=cost;run.shipLevel++;run.hp+=55;recalcPlayer();saveRun();renderUpgradeSubScreen("ship","hull");toast("船体アップグレード")}};
 $$("[data-equip]").forEach(b=>b.onclick=()=>{equipFromStorage(b.dataset.equip);renderUpgradeSubScreen(major,minor)});
 $$("[data-unequip]").forEach(b=>b.onclick=()=>{unequipItem(b.dataset.unequip);renderUpgradeSubScreen(major,minor)});
 $$("[data-disasm]").forEach(b=>b.onclick=()=>{disasmStorage(b.dataset.disasm);renderUpgradeSubScreen(major,minor)});
 $$("[data-sethook]").forEach(b=>b.onclick=()=>{run.rod.hook=b.dataset.sethook;saveRun();renderUpgradeSubScreen("fishing","hook")});
 $$("[data-setrod]").forEach(b=>b.onclick=()=>{const [k,v]=b.dataset.setrod.split(":");run.rod[k]=v;saveRun();renderUpgradeSubScreen("fishing",k)});
}

function materialIcon(mat){
 const src=visualAssets.materials[mat];
 return src?visualImg(src,mat,"materialSprite"):"◇";
}
function itemIconHTML(type,id){
 const src=type==="weapon"?visualAssets.weapons[id]:type==="equip"?visualAssets.equipments[id]:null;
 if(src) return `<div class="craftIllustration ${type} visualCraft">${visualImg(src,id,"craftAssetSprite")}</div>`;
 let symbol="⚙";
 if(type==="rod")symbol="╱";
 else if(type==="reel")symbol="◉";
 else if(type==="line")symbol="⌁";
 else if(type==="hook")symbol="J";
 return `<div class="craftIllustration ${type}">${symbol}</div>`;
}
function materialCostVisual(cost){
 if(!cost)return "";
 return `<div class="materialCostVisual">${Object.entries(cost).map(([k,v])=>`
   <div class="materialCostItem">
     <span class="materialIcon">${materialIcon(k)}</span>
     <span class="materialLabel">${matName(k)}</span>
     <strong>×${v}</strong>
   </div>`).join("")}</div>`;
}
function renderCraftSubScreen(category="weapon"){
 ensureRunShape();
 const labels={weapon:"武器",equip:"装備",rod:"ロッド",reel:"リール",line:"ライン",hook:"フック"};
 let h=materialsHTML();
 h+=`<div class="minorTabs">${Object.entries(labels).map(([k,v])=>`<button data-craftcat="${k}" class="${category===k?"active":""}">${v}</button>`).join("")}</div>`;

 if(category==="weapon" || category==="equip"){
   const list=category==="weapon"?weapons:equipments;
   h+=`<div class="previewPanel"><h3>${category==="weapon"?"武器":"装備"}作成</h3><p>発見済みの設計データを解析し、規定回数に達したものを製作できます。</p></div><div class="cardGrid craftGrid">`;
   for(const d of list){
     const unlocked=isBlueprintUnlocked(category,d.id);
     const count=blueprintCount(category,d.id);
     const known=unlocked || count>0;
     const need=blueprintNeed(d), remain=Math.max(0,need-count);
     const title=known?d.name:"？？？？";
     const desc=known?d.desc:"未発見";
     let prog = unlocked
       ? `<div class="blueprintProgress done">設計図完成・製作可能</div>`
       : known
         ? `<div class="blueprintProgress known">解析 ${count}/${need} ・ あと${remain}回入手</div>`
         : `<div class="blueprintProgress">未発見</div>`;
     h+=`<div class="itemCard craftCard">
       ${known?itemIconHTML(category,d.id):`<div class="craftIllustration unknown">?</div>`}
       <h3>${title}</h3>
       <p>${desc}</p>
       ${known?`<p>${category==="weapon"?`ATK ${d.atk} / `:""}負荷 ${d.load}</p>`:""}
       ${prog}
       ${unlocked?`${materialCostVisual(d.cost)}<div class="actions"><button data-craftitem="${category}:${d.id}" ${afford(d.cost)&&run.storage.length<run.storageCap?"":"disabled"}>作成</button></div>`:""}
     </div>`;
   }
   h+=`</div>`;
 } else if(["rod","reel","line"].includes(category)){
   const label=labels[category];
   h+=`<div class="previewPanel"><h3>${label}作成</h3><p>釣具の設計図は最初から全開放です。</p></div><div class="cardGrid craftGrid">`;
   for(const type of rodTypes){
     if(type==="標準"){
       h+=`<div class="itemCard craftCard">${itemIconHTML(category,type)}<h3>標準${label}</h3><p>初期所持。</p><div class="actions"><button disabled>所持済み</button></div></div>`;
       continue;
     }
     const cost=fishingRecipes[category]?.[type];
     const owned=fishingOwned(category,type);
     const desc=type==="安定"?"成功ゾーンへの追従が楽になる":type==="高速"?"回収進捗が速くなる":type==="重量"?"タップ上昇力が強くなる":"標準性能";
     h+=`<div class="itemCard craftCard">${itemIconHTML(category,type)}<h3>${type}${label}</h3><p>${desc}</p>
       ${materialCostVisual(cost)}
       <div class="actions"><button data-craftfish="${category}:${type}" ${owned||!afford(cost)?"disabled":""}>${owned?"所持済み":"作成"}</button></div>
     </div>`;
   }
   h+=`</div>`;
 } else {
   h+=`<div class="previewPanel"><h3>フック作成</h3><p>フックの設計図は最初から全開放です。</p></div><div class="cardGrid craftGrid">`;
   for(const hook of hookTypes){
     if(hook.id==="standard"){
       h+=`<div class="itemCard craftCard">${itemIconHTML("hook",hook.id)}<h3>${hook.name}</h3><p>${hook.desc}</p><div class="actions"><button disabled>所持済み</button></div></div>`;
       continue;
     }
     const cost=fishingRecipes.hook?.[hook.id],owned=fishingOwned("hook",hook.id);
     h+=`<div class="itemCard craftCard">${itemIconHTML("hook",hook.id)}<h3>${hook.name}</h3><p>${hook.desc}</p>
       ${materialCostVisual(cost)}
       <div class="actions"><button data-craftfish="hook:${hook.id}" ${owned||!afford(cost)?"disabled":""}>${owned?"所持済み":"作成"}</button></div>
     </div>`;
   }
   h+=`</div>`;
 }
 $("#subScreenBody").innerHTML=h;
 $$("[data-craftcat]").forEach(b=>b.onclick=()=>renderCraftSubScreen(b.dataset.craftcat));
 $$("[data-craftitem]").forEach(b=>b.onclick=()=>{const [type,id]=b.dataset.craftitem.split(":");craft(type,id);renderCraftSubScreen(category)});
 $$("[data-craftfish]").forEach(b=>b.onclick=()=>{const [type,id]=b.dataset.craftfish.split(":");craftFishing(type,id);renderCraftSubScreen(category)});
}

function craftFishing(type,id){
 ensureRunShape();
 const cost=fishingRecipes[type]?.[id];
 if(!cost || !afford(cost) || fishingOwned(type,id)) return;
 Object.entries(cost).forEach(([k,v])=>run.materials[k]-=v);
 run.fishingInventory[type].push(id);
 saveRun();
 const name=type==="hook"?(hookTypes.find(x=>x.id===id)?.name||id):`${id}${{rod:"ロッド",reel:"リール",line:"ライン"}[type]}`;
 toast(`${name} 作成`);
}

function renderStorageSubScreen(){
 ensureRunShape();
 let h=materialsHTML();
 h+=equipmentSummaryHTML();
 h+=`<div class="previewPanel"><h3>倉庫</h3><p>完成した武器・装備を保管します。釣具は専用所持欄で管理されるため倉庫容量を使用しません。</p></div>`;
 h+=`<h3>装備中の武器</h3><div class="cardGrid">`;
 run.weapons.forEach(i=>{const d=weapons.find(x=>x.id===i.id);if(d)h+=itemCard(i,"weapon",d,true)});
 h+=`</div><h3>装備中の装備</h3><div class="cardGrid">`;
 run.equipments.forEach(i=>{const d=equipments.find(x=>x.id===i.id);if(d)h+=itemCard(i,"equip",d,true)});
 h+=`</div><h3>保管中</h3><div class="cardGrid">`;
 if(!run.storage.length) h+=`<div class="itemCard"><p>倉庫は空です。</p></div>`;
 run.storage.forEach(i=>{const list=i.type==="weapon"?weapons:equipments;const d=list.find(x=>x.id===i.id);if(d)h+=itemCard(i,i.type,d,false)});
 h+=`</div>`;

 $("#subScreenBody").innerHTML=h;
 $$("[data-equip]").forEach(b=>b.onclick=()=>{equipFromStorage(b.dataset.equip);renderStorageSubScreen()});
 $$("[data-unequip]").forEach(b=>b.onclick=()=>{unequipItem(b.dataset.unequip);renderStorageSubScreen()});
 $$("[data-disasm]").forEach(b=>b.onclick=()=>{disasmStorage(b.dataset.disasm);renderStorageSubScreen()});
}

function renderSettingsSubScreen(){
 $("#subScreenBody").innerHTML=`<div class="settingsList panel"><button id="saveExitBtn2">セーブしてメニューへ</button><button id="endRunBtn2" class="danger">ランを終了する</button></div>`;
 $("#saveExitBtn2").onclick=()=>{
   closeSubScreen();
   closeActionModal();
   run.mode="fishing";
   run.pendingSignal=null;
   if(run.pendingCatch)run.pendingCatch=null;
   if(!Number.isFinite(run.nextBite)||run.nextBite<=0)run.nextBite=rand(1.5,4);
   $("#biteIndicator").style.display="none";
   setGameNavLocked(false);
   saveRun();
   clearInterval(gameTimer);
   clearInterval(battleTimer);
   showScreen("menuScreen");
 };
 $("#endRunBtn2").onclick=()=>endRun();
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
 const inst={type,id,uid:uid(),lvl:1};if(run.storage.length<run.storageCap)run.storage.push(inst);else{toast("倉庫が満杯です");Object.entries(def.cost).forEach(([k,v])=>run.materials[k]+=v);return}
 saveRun();toast(`${def.name} 作成`)
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
 run.storage.splice(idx,1);arr.push({id:inst.id,uid:inst.uid});recalcPlayer();saveRun()
}
function unequipItem(uidv){
 let arr,type;let idx=run.weapons.findIndex(x=>x.uid===uidv);if(idx>=0){arr=run.weapons;type="weapon"}else{idx=run.equipments.findIndex(x=>x.uid===uidv);arr=run.equipments;type="equip"}
 if(idx<0)return;if(run.storage.length>=run.storageCap)return toast("倉庫満杯");const [x]=arr.splice(idx,1);run.storage.push({...x,type});recalcPlayer();saveRun()
}
function disassemble(kind){
 const d=(kind.type==="weapon"?weapons:equipments).find(x=>x.id===kind.id);run.materials.metal+=Math.max(1,Math.floor((d.load||2)*.8));if(Math.random()<.5)run.materials.circuit++;if(Math.random()<.3)run.materials.mech++;
}
function disasmStorage(uidv){const idx=run.storage.findIndex(x=>x.uid===uidv);if(idx<0)return;const [x]=run.storage.splice(idx,1);disassemble(x);saveRun();toast("分解しました")}
function renderRunSettings(){
 $("#drawerContent").innerHTML=`<div class="settingsList"><button id="saveExitBtn">セーブしてメニューへ</button><button id="endRunBtn" class="danger">ランを終了する</button></div>`;
 $("#saveExitBtn").onclick=()=>{saveRun();clearInterval(gameTimer);clearInterval(battleTimer);showScreen("menuScreen")};
 $("#endRunBtn").onclick=()=>endRun();
}


/* ===== v9 maintenance refresh ===== */
let maintState={major:"ship",slot:null};

function ensureLevels(){
  if(!run)return;
  for(const arr of [run.weapons||[], run.equipments||[], run.storage||[]]){
    arr.forEach(inst=>{ if(inst && !inst.lvl) inst.lvl=1; });
  }
}
function weaponLevelMult(inst){ return 1 + 0.16*Math.max(0,(inst?.lvl||1)-1); }
function equipLevelMult(inst){ return 1 + 0.18*Math.max(0,(inst?.lvl||1)-1); }

function recalcPlayer(){
 if(!run)return;
 ensureRunShape(); ensureLevels();
 const hullBonus=1+0.08*Math.sqrt(meta.upgrades.hull||0);
 let baseHp=(100+(run.shipLevel-1)*55)*hullBonus;
 let hpBonus=0,shield=0,repair=0,atkMult=0,fireRate=0,qte=0,partBonus=0;
 for(const inst of run.equipments){
   const e=equipments.find(x=>x.id===inst.id); if(!e)continue;
   const mult=equipLevelMult(inst);
   hpBonus+=(e.hp||0)*mult;
   shield+=(e.shield||0)*mult;
   repair+=(e.repair||0)*mult;
   atkMult+=(e.atkMult||0)*mult;
   fireRate+=(e.fireRate||0)*mult;
   qte+=(e.qte||0)*mult;
   partBonus+=(e.partBonus||0)*mult;
 }
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
function playerAtk(){
  ensureLevels();
  let atk=run.weapons.reduce((s,i)=>{
    const d=weapons.find(x=>x.id===i.id);
    return s + ((d?.atk||0) * weaponLevelMult(i));
  },0);
  atk*=1+0.06*Math.sqrt(meta.upgrades.fire||0)+(run.mods?.atkMult||0);
  return atk;
}
function prettyItemIcon(type,id){
 const src=type==="weapon"?visualAssets.weapons[id]:type==="equip"?visualAssets.equipments[id]:null;
 if(src) return visualImg(src,id,"itemAssetSprite");
 let symbol="⚙";
 if(type==="rod")symbol="╱";
 else if(type==="reel")symbol="◉";
 else if(type==="line")symbol="⌁";
 else if(type==="hook")symbol="J";
 return symbol;
}
function getDef(type,id){ return (type==="weapon"?weapons:equipments).find(x=>x.id===id); }
function weaponProfile(defOrId){
  const id=typeof defOrId==="string" ? defOrId : defOrId?.id;
  return {
    pulse:{label:"高", interval:1.1},
    bolt:{label:"低", interval:1.9},
    laser:{label:"中", interval:1.3},
    missile:{label:"低", interval:1.8},
    emp:{label:"低", interval:2.0},
    barrier:{label:"低", interval:2.2},
    scatter:{label:"やや高", interval:1.2},
    piercer:{label:"かなり低", interval:2.5}
  }[id] || {label:"中", interval:1.5};
}
function weaponPowerValue(def,inst){
  return Math.round((def?.atk||0) * weaponLevelMult(inst||{lvl:1}));
}
function weaponSummaryLine(def,inst){
  const p=weaponProfile(def);
  return `攻撃力 ${weaponPowerValue(def,inst)} / 攻撃頻度 ${p.label}`;
}
function weaponDetailMeta(def,inst){
  const p=weaponProfile(def);
  const arr=[`攻撃力 ${weaponPowerValue(def,inst)}`,`攻撃頻度 ${p.label}`,`発射間隔 約${p.interval.toFixed(1)}秒`,`負荷 ${def.load}`];
  if(def.active) arr.push(`ACT ${def.active.name}`);
  return arr;
}
function instanceStatLine(type,inst){
  const d=getDef(type,inst.id); if(!d) return "";
  if(type==="weapon") return weaponSummaryLine(d,inst) + ` / 負荷 ${d.load}` + (d.active?` / ACT ${d.active.name}`:"");
  return `負荷 ${d.load}` + (d.hp?` / HP +${Math.round(d.hp*equipLevelMult(inst))}`:"");
}
function formatItemMeta(type,inst){
  const d=getDef(type,inst.id); if(!d) return [];
  if(type==="weapon"){
    const arr=[`Lv.${inst.lvl||1}`,...weaponDetailMeta(d,inst)];
    return arr;
  }
  const arr=[`Lv.${inst.lvl||1}`,`負荷 ${d.load}`];
  if(d.hp) arr.push(`HP +${Math.round(d.hp*equipLevelMult(inst))}`);
  if(d.shield) arr.push(`軽減 +${Math.round((d.shield*equipLevelMult(inst))*100)}%`);
  if(d.atkMult) arr.push(`火力 +${Math.round((d.atkMult*equipLevelMult(inst))*100)}%`);
  if(d.repair) arr.push(`自動修理`);
  return arr;
}
function shipUpgradeCostObj(){
  const lv=run.shipLevel||1;
  return { metal:6+lv*2, mech:Math.max(0,lv-1), circuit:Math.max(0,Math.floor((lv-1)/2)) };
}
function itemUpgradeCost(type,inst){
  const d=getDef(type,inst.id); const lv=inst.lvl||1;
  if(type==="weapon"){
    return { metal:Math.max(2,Math.ceil(d.load*0.9)+lv), circuit:Math.max(0,Math.floor(d.atk/5)+Math.floor((lv+1)/2)), mech:d.load>=5?1:0, cell:d.active?Math.floor((lv-1)/2):0 };
  }
  return { metal:Math.max(1,Math.ceil(d.load*0.75)+lv-1), mech:Math.max(0,Math.ceil(d.load/3)+Math.floor((lv-1)/2)), circuit:(d.shield||d.atkMult)?1+Math.floor((lv-1)/2):0, cell:(d.shield&&lv>=3)?1:0 };
}
function normalizeCost(cost){ const out={}; Object.entries(cost).forEach(([k,v])=>{ if(v>0) out[k]=v; }); return out; }
function costAfford(cost){ return Object.entries(cost).every(([k,v])=>(run.materials[k]||0)>=v); }
function spendCost(cost){ Object.entries(cost).forEach(([k,v])=>run.materials[k]-=v); }
function materialsStripHTML(){
  return `<div class="materialStrip">${Object.entries(run.materials).map(([k,v])=>`
    <div class="materialMini"><span class="materialIcon">${materialIcon(k)}</span><small>${matName(k)}</small><strong>${v}</strong></div>`).join("")}</div>`;
}
function materialNeedListHTML(cost){
  const safe=normalizeCost(cost||{});
  return `<div class="materialNeedGrid">${Object.entries(safe).map(([k,v])=>{
    const own=run.materials[k]||0, ok=own>=v;
    return `<div class="materialNeed ${ok?"ok":"ng"}"><span class="materialIcon">${materialIcon(k)}</span><em>${matName(k)}</em><strong>${own} / ${v}</strong></div>`;
  }).join("")}</div>`;
}
function loadPanelHTML(){
  const ratio=Math.min(1,getLoad()/Math.max(1,run.maxLoad));
  return `<div><div class="statRow"><span>過負荷ゲージ</span><strong>${getLoad()} / ${run.maxLoad}</strong></div><div class="loadMeterBar"><div style="width:${ratio*100}%"></div></div><div class="statRow" style="margin-top:8px"><span>武器 / 装備 / 倉庫</span><strong>${run.weapons.length}/${run.weaponSlots} ・ ${run.equipments.length}/${run.equipSlots} ・ ${run.storage.length}/${run.storageCap}</strong></div></div>`;
}
function shipLayoutForLevel(lv){
  const layouts={
    1:{
      weapons:[
        {x:24,y:38,w:34,h:22,side:"left"},
        {x:76,y:38,w:34,h:22,side:"right"}
      ],
      equips:[
        {x:50,y:34,w:22,h:18},
        {x:50,y:67,w:22,h:18}
      ]
    },
    2:{
      weapons:[
        {x:24,y:31,w:31,h:20,side:"left"},
        {x:76,y:31,w:31,h:20,side:"right"},
        {x:24,y:51,w:29,h:19,side:"left"}
      ],
      equips:[
        {x:50,y:30,w:21,h:17},
        {x:50,y:51,w:21,h:17},
        {x:50,y:73,w:21,h:17}
      ]
    },
    3:{
      weapons:[
        {x:23,y:29,w:30,h:19,side:"left"},
        {x:77,y:29,w:30,h:19,side:"right"},
        {x:23,y:48,w:30,h:19,side:"left"},
        {x:77,y:48,w:30,h:19,side:"right"}
      ],
      equips:[
        {x:50,y:28,w:20,h:16},
        {x:38,y:49,w:19,h:15},
        {x:62,y:49,w:19,h:15},
        {x:50,y:71,w:20,h:16}
      ]
    },
    4:{
      weapons:[
        {x:22,y:27,w:28,h:18,side:"left"},
        {x:78,y:27,w:28,h:18,side:"right"},
        {x:22,y:44,w:28,h:18,side:"left"},
        {x:78,y:44,w:28,h:18,side:"right"},
        {x:22,y:61,w:27,h:17,side:"left"}
      ],
      equips:[
        {x:50,y:24,w:18,h:15},
        {x:39,y:40,w:17,h:14},
        {x:61,y:40,w:17,h:14},
        {x:39,y:62,w:17,h:14},
        {x:61,y:62,w:17,h:14}
      ]
    }
  };
  return layouts[Math.max(1,Math.min(4,lv||1))]||layouts[1];
}
function renderShipComposite(){
  const lv=Math.max(1,Math.min(4,run.shipLevel||1));
  const layout=shipLayoutForLevel(lv);
  let out=`<div class="shipComposite">${visualImg(hullAsset(),`機体 Mk.${run.shipLevel}`,"shipHullSprite")}`;
  run.equipments.forEach((inst,i)=>{
    const pos=layout.equips[i];
    const src=visualAssets.equipments[inst?.id];
    if(!pos||!src) return;
    out += `<img class="shipOverlaySprite shipEquipOverlay" src="${src}" alt="" style="left:${pos.x}%;top:${pos.y}%;width:${pos.w}%;height:${pos.h}%" draggable="false">`;
  });
  run.weapons.forEach((inst,i)=>{
    const pos=layout.weapons[i];
    const src=visualAssets.weapons[inst?.id];
    if(!pos||!src) return;
    out += `<img class="shipOverlaySprite shipWeaponOverlay ${pos.side==="right"?"rightMount":"leftMount"}" src="${src}" alt="" style="left:${pos.x}%;top:${pos.y}%;width:${pos.w}%;height:${pos.h}%" draggable="false">`;
  });
  out += `</div>`;
  return out;
}
function renderShipSchematic(){
  let left='', right='';
  for(let i=0;i<run.weaponSlots;i++){
    const inst=run.weapons[i], title=inst?`${itemName({type:"weapon",id:inst.id})} Lv.${inst.lvl||1}`:"空き";
    const icon=inst?prettyItemIcon("weapon",inst.id):`<span class="slotEmptyMark">＋</span>`;
    left += `<button class="slotButton visualSlot ${inst?"":"empty"} ${(maintState.slot===`weapon:${i}`)?"active":""}" data-maint-slot="weapon:${i}">${icon}<small>武器 ${i+1}</small><strong>${title}</strong></button>`;
  }
  for(let i=0;i<run.equipSlots;i++){
    const inst=run.equipments[i], title=inst?`${itemName({type:"equip",id:inst.id})} Lv.${inst.lvl||1}`:"空き";
    const icon=inst?prettyItemIcon("equip",inst.id):`<span class="slotEmptyMark">＋</span>`;
    right += `<button class="slotButton visualSlot ${inst?"":"empty"} ${(maintState.slot===`equip:${i}`)?"active":""}" data-maint-slot="equip:${i}">${icon}<small>装備 ${i+1}</small><strong>${title}</strong></button>`;
  }
  return `<div class="maintPanel">${loadPanelHTML()}<div class="maintShipArea visualMaintShip"><div class="slotColumn">${left}</div><div class="shipCenterCore"><div class="shipVisualFrame">${renderShipComposite()}</div><button class="slotButton coreSlotButton ${(maintState.slot==="hull")?"active":""}" data-maint-slot="hull"><small>機体コア</small><strong>機体 Mk.${run.shipLevel}</strong></button></div><div class="slotColumn">${right}</div></div></div>`;
}
function renderFishingSchematic(){
  const parts=[["rod","ロッド",run.rod.rod+"ロッド","gear-slot-rod"],["reel","リール",run.rod.reel+"リール","gear-slot-reel"],["line","ライン",run.rod.line+"ライン","gear-slot-line"],["hook","フック",(hookTypes.find(x=>x.id===run.rod.hook)?.name||"標準フック"),"gear-slot-hook"]];
  return `<div class="maintPanel"><div class="gearBlueprint sideFishingView"><div class="gearRod"></div><div class="gearReel"></div><div class="gearLine"></div><div class="gearHookPoint"></div>${parts.map(([k,lbl,title,cls])=>`<button class="slotButton gearSlotButton ${cls} ${(maintState.slot===k)?"active":""}" data-maint-slot="${k}"><small>${lbl}</small><strong>${title}</strong></button>`).join("")}</div></div>`;
}
function currentCardHTML(type,inst,slotIndex){
  const d=getDef(type,inst.id), cost=normalizeCost(itemUpgradeCost(type,inst));
  return `<div class="bigCurrentCard"><div class="topLine"><div class="bigIconBadge">${prettyItemIcon(type,inst.id)}</div><div><div class="detailSectionTitle" style="margin:0">${d.name}</div><div style="font-size:.8rem;color:#aac0de">${d.desc}</div></div></div><div class="detailMeta">${formatItemMeta(type,inst).map(x=>`<span class="metaChip">${x}</span>`).join("")}</div><div class="detailSectionTitle">強化コスト</div>${materialNeedListHTML(cost)}<div class="actions"><button data-upgrade-inst="${type}:${slotIndex}" class="primary" ${costAfford(cost)?"":"disabled"}>強化</button><button data-unequip-slot="${type}:${slotIndex}">外す</button></div></div>`;
}
function hullCardHTML(){
  const cost=normalizeCost(shipUpgradeCostObj());
  return `<div class="bigCurrentCard"><div class="topLine"><div class="bigIconBadge hullBadge">${visualImg(hullAsset(),`機体 Mk.${run.shipLevel}`,"hullBadgeSprite")}</div><div><div class="detailSectionTitle" style="margin:0">機体 Mk.${run.shipLevel}</div><div style="font-size:.8rem;color:#aac0de">船体の耐久・スロット・積載を拡張します。</div></div></div><div class="detailMeta"><span class="metaChip">HP ${run.maxHp}</span><span class="metaChip">最大負荷 ${run.maxLoad}</span><span class="metaChip">武器枠 ${run.weaponSlots}</span><span class="metaChip">装備枠 ${run.equipSlots}</span><span class="metaChip">倉庫 ${run.storage.length}/${run.storageCap}</span></div><div class="detailSectionTitle">次の強化コスト</div>${materialNeedListHTML(cost)}<div class="actions"><button id="shipUpgradeBtnV9" class="primary" ${costAfford(cost)?"":"disabled"}>船体強化</button></div></div>`;
}
function simpleStorageCardHTML(inst,type,slotIndex){
  const d=getDef(type,inst.id);
  const extra = type==="weapon"
    ? `<div class="miniMeta"><span>負荷 ${d.load}</span>${d.active?`<span>ACT ${d.active.name}</span>`:""}</div>`
    : `<div class="miniMeta"><span>負荷 ${d.load}</span>${d.hp?`<span>HP +${Math.round(d.hp*equipLevelMult(inst))}</span>`:""}</div>`;
  return `<div class="simpleCard tapCard" data-open-owned="${type}:${inst.uid}:${slotIndex}"><div class="simpleCardHead"><div class="simpleCardIcon">${prettyItemIcon(type,inst.id)}</div><div><h4>${d.name}</h4><p>Lv.${inst.lvl||1} ・ ${type==="weapon"?weaponSummaryLine(d,inst):instanceStatLine(type,inst)}</p>${extra}</div></div></div>`;
}
function simpleCraftCardHTML(type,d,slotIndex,mode){
  const count=blueprintCount(type,d.id), unlocked=isBlueprintUnlocked(type,d.id), need=blueprintNeed(d), remain=Math.max(0,need-count);
  const summary = type==="weapon"
    ? `<div class="miniMeta"><span>攻撃力 ${d.atk}</span><span>攻撃頻度 ${weaponProfile(d).label}</span><span>負荷 ${d.load}</span>${mode==="lockedKnown"?`<span>あと${remain}回入手</span>`:""}</div>`
    : `<div class="miniMeta"><span>負荷 ${d.load}</span>${mode==="lockedKnown"?`<span>解析 ${count}/${need}</span><span>あと${remain}回入手</span>`:""}</div>`;
  const attr = mode==="unknown" ? "" : ` data-open-craft="${type}:${d.id}:${slotIndex}"`;
  const cls = mode==="unknown" ? "simpleCard" : "simpleCard tapCard";
  return `<div class="${cls}"${attr}><div class="simpleCardHead"><div class="simpleCardIcon">${mode==="unknown"?"?":prettyItemIcon(type,d.id)}</div><div><h4>${mode==="unknown"?"？？？？":d.name}</h4><p>${mode==="unknown"?"未発見":d.desc}</p>${mode==="unknown"?"":summary}</div></div></div>`;
}
function fishingOwnedList(type){ return (run.fishingInventory[type]||[]).filter(x=>type==="hook"?x!==run.rod.hook:x!==run.rod[type]); }
function fishingCurrentCardHTML(type){
  const current = type==="hook" ? (hookTypes.find(x=>x.id===run.rod.hook)?.name||"標準フック") : `${run.rod[type]}${{rod:"ロッド",reel:"リール",line:"ライン"}[type]}`;
  const desc = type==="hook" ? (hookTypes.find(x=>x.id===run.rod.hook)?.desc||"") : ({rod:"釣りの主軸となる竿本体。",reel:"回収時の操作感を左右する機構。",line:"釣りラインの安定性を調整します。"}[type]||"");
  return `<div class="bigCurrentCard"><div class="topLine"><div class="bigIconBadge">${prettyItemIcon(type,type==="hook"?run.rod.hook:run.rod[type])}</div><div><div class="detailSectionTitle" style="margin:0">${current}</div><div style="font-size:.8rem;color:#aac0de">${desc}</div></div></div><div class="detailMeta"><span class="metaChip">現在装備</span><span class="metaChip">${type==="hook"?"釣果傾向変更":"釣り操作補正"}</span></div></div>`;
}
function fishingOwnedCardHTML(type,id){
  const name = type==="hook" ? (hookTypes.find(x=>x.id===id)?.name||id) : `${id}${{rod:"ロッド",reel:"リール",line:"ライン"}[type]}`;
  const desc = type==="hook" ? (hookTypes.find(x=>x.id===id)?.desc||"") : (id==="安定"?"成功ゾーンへの追従が楽になる":id==="高速"?"回収進捗が速くなる":id==="重量"?"タップ上昇力が強くなる":"標準性能");
  return `<div class="simpleCard tapCard" data-open-fishing-owned="${type}:${id}"><div class="simpleCardHead"><div class="simpleCardIcon">${prettyItemIcon(type,id)}</div><div><h4>${name}</h4><p>${desc}</p></div></div></div>`;
}
function fishingCraftCardHTML(type,id,cost){
  const name = type==="hook" ? (hookTypes.find(x=>x.id===id)?.name||id) : `${id}${{rod:"ロッド",reel:"リール",line:"ライン"}[type]}`;
  const desc = type==="hook" ? (hookTypes.find(x=>x.id===id)?.desc||"") : (id==="安定"?"成功ゾーンへの追従が楽になる":id==="高速"?"回収進捗が速くなる":id==="重量"?"タップ上昇力が強くなる":"標準性能");
  return `<div class="simpleCard tapCard" data-open-fishing-craft="${type}:${id}"><div class="simpleCardHead"><div class="simpleCardIcon">${prettyItemIcon(type,id)}</div><div><h4>${name}</h4><p>${desc}</p></div></div></div>`;
}
function renderShipDetail(slot){
  if(slot==="hull") return hullCardHTML();
  const [type, idxStr] = slot.split(":"), idx=Number(idxStr), current = (type==="weapon"?run.weapons:run.equipments)[idx];
  let h=`<div class="maintPanel"><h3 class="detailSectionTitle">${type==="weapon"?"武器":"装備"}スロット ${idx+1}</h3>`;
  h += current ? currentCardHTML(type,current,idx) : `<div class="bigCurrentCard"><div class="detailSectionTitle">現在装備</div><p class="emptyText">このスロットは空です。所持中の装備や作成可能な装備から選べます。</p></div>`;
  const owned = run.storage.filter(x=>x.type===type);
  h += `<div class="sectionBlock"><h4 class="detailSectionTitle">所持中</h4>${owned.length?`<div class="detailList">${owned.map(inst=>simpleStorageCardHTML(inst,type,idx)).join("")}</div>`:`<p class="emptyText">このカテゴリの保管品はありません。</p>`}</div>`;
  const defs = (type==="weapon"?weapons:equipments);
  const craftable = defs.filter(d=>isBlueprintUnlocked(type,d.id) && afford(d.cost));
  const insufficient = defs.filter(d=>isBlueprintUnlocked(type,d.id) && !afford(d.cost));
  const analyzing = defs.filter(d=>!isBlueprintUnlocked(type,d.id) && blueprintCount(type,d.id)>0);
  const unknown = defs.filter(d=>!isBlueprintUnlocked(type,d.id) && blueprintCount(type,d.id)===0);
  const sec=(title,list,mode)=>`<div class="sectionBlock"><h4 class="detailSectionTitle ${mode==='unknown'?'mutedSectionTitle':''}">${title}</h4>${list.length?`<div class="detailList">${list.map(d=>simpleCraftCardHTML(type,d,idx,mode)).join("")}</div>`:`<p class="emptyText">なし</p>`}</div>`;
  h += sec("今すぐ作成可能", craftable, "craftable");
  h += sec("素材不足", insufficient, "insufficient");
  h += sec("解析中", analyzing, "lockedKnown");
  h += sec("未発見", unknown, "unknown");
  h += `</div>`;
  return h;
}
function renderFishingDetail(slot){
  const type=slot||"rod";
  let h=`<div class="maintPanel"><h3 class="detailSectionTitle">${{rod:"ロッド",reel:"リール",line:"ライン",hook:"フック"}[type]}</h3>`;
  h += fishingCurrentCardHTML(type);
  const owned = fishingOwnedList(type);
  h += `<div class="sectionBlock"><h4 class="detailSectionTitle">所持中</h4>${owned.length?`<div class="detailList">${owned.map(id=>fishingOwnedCardHTML(type,id)).join("")}</div>`:`<p class="emptyText">切り替え可能な所持品はありません。</p>`}</div>`;
  const source = type==="hook" ? hookTypes.map(x=>x.id) : rodTypes;
  const craftable = [], insufficient = [];
  source.forEach(id=>{
    const base=(type==="hook"?id==="standard":id==="標準");
    if(base || fishingOwned(type,id)) return;
    const cost=fishingRecipes[type]?.[id]; if(!cost) return;
    (afford(cost)?craftable:insufficient).push([id,cost]);
  });
  const block=(title,list)=>`<div class="sectionBlock"><h4 class="detailSectionTitle">${title}</h4>${list.length?`<div class="detailList">${list.map(([id,cost])=>fishingCraftCardHTML(type,id,cost)).join("")}</div>`:`<p class="emptyText">なし</p>`}</div>`;
  h += block("今すぐ作成可能", craftable);
  h += block("素材不足", insufficient);
  h += `</div>`;
  return h;
}

function warehouseStoredCardHTML(inst){
  const d=getDef(inst.type,inst.id); if(!d) return "";
  const summary = inst.type==="weapon" ? weaponSummaryLine(d,inst) : instanceStatLine(inst.type,inst);
  return `<div class="simpleCard tapCard" data-open-warehouse-store="${inst.uid}"><div class="simpleCardHead"><div class="simpleCardIcon">${prettyItemIcon(inst.type,inst.id)}</div><div><h4>${d.name}</h4><p>Lv.${inst.lvl||1} ・ ${summary}</p><div class="miniMeta"><span>${inst.type==="weapon"?"武器":"装備"}</span><span>保管中</span></div><div class="cardActionHint">タップで詳細</div></div></div></div>`;
}
function warehouseEquippedCardHTML(type, inst, idx){
  const d=getDef(type,inst.id); if(!d) return "";
  const summary = type==="weapon" ? weaponSummaryLine(d,inst) : instanceStatLine(type,inst);
  return `<div class="simpleCard tapCard" data-open-warehouse-equipped="${type}:${idx}"><div class="simpleCardHead"><div class="simpleCardIcon">${prettyItemIcon(type,inst.id)}</div><div><h4>${d.name}</h4><p>Lv.${inst.lvl||1} ・ ${summary}</p><div class="miniMeta"><span>装備中</span><span>${type==="weapon"?"武器スロット":"装備スロット"} ${idx+1}</span></div><div class="cardActionHint">タップで詳細</div></div></div></div>`;
}
function renderWarehouseOverview(){
  let h=`<div class="maintPanel"><div class="warehouseMeta"><div class="statRow"><span>倉庫容量</span><strong>${run.storage.length} / ${run.storageCap}</strong></div><div class="statRow"><span>保管品</span><strong>武器 ${run.storage.filter(x=>x.type==="weapon").length} / 装備 ${run.storage.filter(x=>x.type==="equip").length}</strong></div></div>`;
  h += `<div class="sectionBlock"><h4 class="detailSectionTitle">装備中の武器</h4>${run.weapons.length?`<div class="detailList">${run.weapons.map((inst,idx)=>warehouseEquippedCardHTML("weapon",inst,idx)).join("")}</div>`:`<p class="emptyText">装備中の武器はありません。</p>`}</div>`;
  h += `<div class="sectionBlock"><h4 class="detailSectionTitle">装備中の装備</h4>${run.equipments.length?`<div class="detailList">${run.equipments.map((inst,idx)=>warehouseEquippedCardHTML("equip",inst,idx)).join("")}</div>`:`<p class="emptyText">装備中の装備はありません。</p>`}</div>`;
  h += `<div class="sectionBlock"><h4 class="detailSectionTitle">倉庫</h4>${run.storage.length?`<div class="detailList">${run.storage.map(inst=>warehouseStoredCardHTML(inst)).join("")}</div>`:`<p class="emptyText">倉庫は空です。</p>`}</div>`;
  h += `</div>`;
  return h;
}
function upgradeEquippedItem(type, idx){
  const arr = type==="weapon" ? run.weapons : run.equipments;
  const inst = arr[idx]; if(!inst) return;
  const cost = normalizeCost(itemUpgradeCost(type, inst));
  if(!costAfford(cost)) return toast("素材不足");
  spendCost(cost);
  inst.lvl=(inst.lvl||1)+1;
  recalcPlayer(); saveRun(); toast("強化しました");
}
function openWarehouseStoredModal(uidv){
  const inst = run.storage.find(x=>x.uid===uidv); if(!inst) return;
  const d=getDef(inst.type,inst.id); if(!d) return;
  const body=`<div class="bigCurrentCard"><div class="topLine"><div class="bigIconBadge">${prettyItemIcon(inst.type,inst.id)}</div><div><div class="detailSectionTitle" style="margin:0">${d.name}</div><div style="font-size:.8rem;color:#aac0de">${d.desc}</div></div></div><div class="detailMeta">${formatItemMeta(inst.type,inst).map(x=>`<span class="metaChip">${x}</span>`).join("")}<span class="metaChip">保管中</span></div></div>`;
  openActionModal(d.name, body, [{label:"分解", danger:true, onClick:()=>{ disasmStorage(uidv); renderMaintenanceSubScreen("storage","warehouse"); }}]);
}
function openWarehouseEquippedModal(type, idx){
  const arr = type==="weapon" ? run.weapons : run.equipments;
  const inst = arr[idx]; if(!inst) return;
  const d=getDef(type,inst.id); if(!d) return;
  const cost = normalizeCost(itemUpgradeCost(type, inst));
  const body=`<div class="bigCurrentCard"><div class="topLine"><div class="bigIconBadge">${prettyItemIcon(type,inst.id)}</div><div><div class="detailSectionTitle" style="margin:0">${d.name}</div><div style="font-size:.8rem;color:#aac0de">${d.desc}</div></div></div><div class="detailMeta">${formatItemMeta(type,inst).map(x=>`<span class="metaChip">${x}</span>`).join("")}<span class="metaChip">装備中</span></div><div class="detailSectionTitle">次の強化コスト</div>${materialNeedListHTML(cost)}</div>`;
  openActionModal(d.name, body, [
    {label:"強化", primary:true, onClick:()=>{ if(costAfford(cost)){ upgradeEquippedItem(type, idx); } else { toast("素材不足"); } renderMaintenanceSubScreen("storage","warehouse"); }},
    {label:"外して倉庫へ", onClick:()=>{ if(run.storage.length>=run.storageCap){ toast("倉庫満杯"); renderMaintenanceSubScreen("storage","warehouse"); return; } unequipSpecificSlot(type, idx); renderMaintenanceSubScreen("storage","warehouse"); }}
  ]);
}
let overflowResolveCallback=null;
let overflowView="choice";
function finalizeOverflowAndResume(){
  closeOverflowModal();
  const cb = overflowResolveCallback;
  overflowResolveCallback=null;
  if(cb) cb();
}
function closeOverflowModal(){ $("#overflowModal").classList.remove("active"); }
function resolveOverflowByDisassemblingNew(){
  if(!run.pendingOverflow?.inst) return;
  disassemble(run.pendingOverflow.inst);
  run.pendingOverflow=null;
  saveRun();
  toast("新しい品を分解しました");
  finalizeOverflowAndResume();
}
function resolveOverflowByDisassemblingStored(uidv){
  const idx = run.storage.findIndex(x=>x.uid===uidv);
  if(idx<0 || !run.pendingOverflow?.inst) return;
  const [oldInst] = run.storage.splice(idx,1);
  disassemble(oldInst);
  const newInst = run.pendingOverflow.inst;
  run.storage.push(newInst);
  run.pendingOverflow=null;
  saveRun();
  toast(`${itemName(newInst)} を保管しました`);
  finalizeOverflowAndResume();
}
function overflowCandidateCardHTML(inst){
  const d=getDef(inst.type,inst.id); if(!d) return "";
  const summary = inst.type==="weapon" ? weaponSummaryLine(d,inst) : instanceStatLine(inst.type,inst);
  return `<div class="simpleCard tapCard" data-overflow-pick="${inst.uid}"><div class="simpleCardHead"><div class="simpleCardIcon">${prettyItemIcon(inst.type,inst.id)}</div><div><h4>${d.name}</h4><p>Lv.${inst.lvl||1} ・ ${summary}</p><div class="miniMeta"><span>${inst.type==="weapon"?"武器":"装備"}</span><span>保管中</span></div><div class="cardActionHint">タップでこの品を分解</div></div></div></div>`;
}
function renderOverflowSelectionList(){
  overflowView="select";
  $("#overflowTitle").textContent="何を分解しますか？";
  $("#overflowBody").innerHTML = `<div class="overflowNote">倉庫から1つ分解して空きを作ると、今回入手したアイテムが自動で保管されます。</div><div class="overflowStorageList">${run.storage.length?run.storage.map(inst=>overflowCandidateCardHTML(inst)).join(""):`<p class="emptyText">分解候補がありません。</p>`}</div>`;
  $("#overflowButtons").innerHTML = `<button id="overflowBackBtn">キャンセル</button>`;
  $("#overflowBackBtn").onclick=()=>renderOverflowChoice();
  $$("[data-overflow-pick]").forEach(card=>card.onclick=()=>openOverflowStoredDetail(card.dataset.overflowPick));
}
function openOverflowStoredDetail(uidv){
  const inst = run.storage.find(x=>x.uid===uidv); if(!inst) return;
  const d=getDef(inst.type,inst.id); if(!d) return;
  const body=`<div class="bigCurrentCard"><div class="topLine"><div class="bigIconBadge">${prettyItemIcon(inst.type,inst.id)}</div><div><div class="detailSectionTitle" style="margin:0">${d.name}</div><div style="font-size:.8rem;color:#aac0de">${d.desc}</div></div></div><div class="detailMeta">${formatItemMeta(inst.type,inst).map(x=>`<span class="metaChip">${x}</span>`).join("")}</div></div>`;
  openActionModal(`${d.name} を分解`, body, [
    {label:"これを分解して保管", danger:true, onClick:()=>{ resolveOverflowByDisassemblingStored(uidv); }},
    {label:"戻る", onClick:()=>{ renderOverflowSelectionList(); $("#overflowModal").classList.add("active"); }}
  ]);
}
function renderOverflowChoice(){
  overflowView="choice";
  const inst = run.pendingOverflow?.inst;
  if(!inst){ finalizeOverflowAndResume(); return; }
  const d=getDef(inst.type,inst.id); if(!d){ run.pendingOverflow=null; finalizeOverflowAndResume(); return; }
  $("#overflowTitle").textContent="倉庫がいっぱいです";
  $("#overflowBody").innerHTML = `<div class="overflowNote">新しいアイテムを分解するか、倉庫内の装備を1つ分解して空きを作る必要があります。</div><div class="bigCurrentCard"><div class="topLine"><div class="bigIconBadge">${prettyItemIcon(inst.type,inst.id)}</div><div><div class="detailSectionTitle" style="margin:0">新しく入手: ${d.name}</div><div style="font-size:.8rem;color:#aac0de">${d.desc}</div></div></div><div class="detailMeta">${formatItemMeta(inst.type,inst).map(x=>`<span class="metaChip">${x}</span>`).join("")}<span class="metaChip">倉庫 ${run.storage.length}/${run.storageCap}</span></div></div>`;
  $("#overflowButtons").innerHTML = `<button id="overflowBreakNewBtn" class="danger">新しい品を分解</button><button id="overflowChooseStoredBtn" class="primary">倉庫から1つ分解して保管</button>`;
  $("#overflowBreakNewBtn").onclick=()=>resolveOverflowByDisassemblingNew();
  $("#overflowChooseStoredBtn").onclick=()=>renderOverflowSelectionList();
}
function openOverflowChoice(onResolved){
  overflowResolveCallback=onResolved||null;
  $("#overflowModal").classList.add("active");
  renderOverflowChoice();
}

function renderMaintenanceSubScreen(major=maintState.major||"ship", slot=maintState.slot){
  ensureRunShape(); ensureLevels(); recalcPlayer();
  maintState.major=major;
  if(!slot) slot = major==="ship" ? "hull" : major==="fishing" ? "rod" : "warehouse";
  maintState.slot=slot;
  $("#subScreenTitle").textContent="整備";
  let h = materialsStripHTML();
  h += `<div class="maintMajorTabs"><button data-maint-major="ship" class="${major==="ship"?"active":""}">機体</button><button data-maint-major="fishing" class="${major==="fishing"?"active":""}">釣具</button><button data-maint-major="storage" class="${major==="storage"?"active":""}">倉庫</button></div>`;
  if(major==="ship"){
    h += renderShipSchematic();
    h += renderShipDetail(slot);
  }else if(major==="fishing"){
    h += renderFishingSchematic();
    h += renderFishingDetail(slot);
  }else{
    h += renderWarehouseOverview();
  }
  $("#subScreenBody").innerHTML=h;
  $$("[data-maint-major]").forEach(b=>b.onclick=()=>renderMaintenanceSubScreen(b.dataset.maintMajor, null));
  $$("[data-maint-slot]").forEach(b=>b.onclick=()=>renderMaintenanceSubScreen(maintState.major, b.dataset.maintSlot));
  if($("#shipUpgradeBtnV9")) $("#shipUpgradeBtnV9").onclick=()=>{ const cost=normalizeCost(shipUpgradeCostObj()); if(!costAfford(cost)) return; spendCost(cost); run.shipLevel++; run.hp+=55; recalcPlayer(); saveRun(); renderMaintenanceSubScreen("ship","hull"); toast("船体アップグレード"); };
  $$("[data-upgrade-inst]").forEach(b=>b.onclick=()=>{ const [type, idxStr] = b.dataset.upgradeInst.split(":"); const idx=Number(idxStr), arr = type==="weapon" ? run.weapons : run.equipments, inst = arr[idx]; if(!inst) return; const cost=normalizeCost(itemUpgradeCost(type,inst)); if(!costAfford(cost)) return toast("素材不足"); spendCost(cost); inst.lvl=(inst.lvl||1)+1; recalcPlayer(); saveRun(); renderMaintenanceSubScreen("ship", `${type}:${idx}`); toast("強化しました"); });
  $$("[data-unequip-slot]").forEach(b=>b.onclick=()=>{ const [type, idxStr] = b.dataset.unequipSlot.split(":"); unequipSpecificSlot(type, Number(idxStr)); renderMaintenanceSubScreen("ship", `${type}:${Math.max(0,Number(idxStr)-1)}`); });
  $$("[data-open-owned]").forEach(b=>b.onclick=()=>{ const [type, uidv, slotIndexStr]=b.dataset.openOwned.split(":"); const inst = run.storage.find(x=>x.uid===uidv); if(inst) openOwnedItemModal(type, inst, Number(slotIndexStr)); });
  $$("[data-open-craft]").forEach(b=>b.onclick=()=>{ const [type,id,slotIndexStr]=b.dataset.openCraft.split(":"); openCraftItemModal(type, id, Number(slotIndexStr)); });
  $$("[data-open-fishing-owned]").forEach(b=>b.onclick=()=>{ const [type,id]=b.dataset.openFishingOwned.split(":"); openFishingOwnedModal(type,id); });
  $$("[data-open-fishing-craft]").forEach(b=>b.onclick=()=>{ const [type,id]=b.dataset.openFishingCraft.split(":"); openFishingCraftModal(type,id); });
  $$("[data-open-warehouse-store]").forEach(b=>b.onclick=()=>openWarehouseStoredModal(b.dataset.openWarehouseStore));
  $$("[data-open-warehouse-equipped]").forEach(b=>b.onclick=()=>{ const [type, idxStr]=b.dataset.openWarehouseEquipped.split(":"); openWarehouseEquippedModal(type, Number(idxStr)); });
}
function equipSpecificFromStorage(uidv, type, slotIndex){
  ensureLevels();
  const storeIdx=run.storage.findIndex(x=>x.uid===uidv); if(storeIdx<0) return;
  const inst=run.storage[storeIdx]; if(inst.type!==type) return;
  const targetArr = type==="weapon" ? run.weapons : run.equipments;
  const targetSlots = type==="weapon" ? run.weaponSlots : run.equipSlots;
  if(slotIndex>=targetSlots) return;
  const newDef=getDef(type, inst.id);
  const current=targetArr[slotIndex], currentLoad = current ? (getDef(type,current.id)?.load||0) : 0;
  if(getLoad()-currentLoad+(newDef?.load||0) > run.maxLoad) return toast("装備負荷オーバー");
  run.storage.splice(storeIdx,1);
  if(current) run.storage.push({...current, type});
  targetArr[slotIndex]={id:inst.id,uid:inst.uid,lvl:inst.lvl||1};
  recalcPlayer(); saveRun(); toast("装備を変更");
}
function unequipSpecificSlot(type, slotIndex){
  if(run.storage.length>=run.storageCap) return toast("倉庫満杯");
  const targetArr = type==="weapon" ? run.weapons : run.equipments;
  const inst = targetArr[slotIndex]; if(!inst) return;
  targetArr.splice(slotIndex,1);
  run.storage.push({...inst,type});
  recalcPlayer(); saveRun(); toast("倉庫へ移しました");
}
function craftToStorage(type,id){
  const def=getDef(type,id); if(!def) return;
  if(!afford(def.cost)) return toast("素材不足");
  if(run.storage.length>=run.storageCap) return toast("倉庫が満杯です");
  Object.entries(def.cost).forEach(([k,v])=>run.materials[k]-=v);
  run.storage.push({type,id,uid:uid(),lvl:1});
  saveRun(); toast(`${def.name} 作成`);
}
function openActionModal(title, bodyHTML, buttons){
  $("#itemActionTitle").textContent=title;
  $("#itemActionBody").innerHTML=bodyHTML;
  $("#itemActionButtons").innerHTML=buttons.map((b,i)=>`<button data-modal-act="${i}" class="${b.primary?'primary':''} ${b.danger?'danger':''}">${b.label}</button>`).join("");
  $("#itemActionModal").classList.add("active");
  $$("[data-modal-act]").forEach(btn=>btn.onclick=()=>{ const action=buttons[Number(btn.dataset.modalAct)]; closeActionModal(); if(action?.onClick) action.onClick(); });
}
function closeActionModal(){ $("#itemActionModal").classList.remove("active"); }
function openOwnedItemModal(type, inst, slotIndex){
  const d=getDef(type, inst.id); if(!d) return;
  const body=`<div class="bigCurrentCard"><div class="topLine"><div class="bigIconBadge">${prettyItemIcon(type,inst.id)}</div><div><div class="detailSectionTitle" style="margin:0">${d.name}</div><div style="font-size:.8rem;color:#aac0de">${d.desc}</div></div></div><div class="detailMeta">${formatItemMeta(type,inst).map(x=>`<span class="metaChip">${x}</span>`).join("")}</div></div>`;
  openActionModal(d.name, body, [{label:"装備", primary:true, onClick:()=>{ equipSpecificFromStorage(inst.uid,type,slotIndex); renderMaintenanceSubScreen("ship", `${type}:${slotIndex}`); }},{label:"分解", danger:true, onClick:()=>{ disasmStorage(inst.uid); renderMaintenanceSubScreen("ship", `${type}:${slotIndex}`); }}]);
}
function openCraftItemModal(type,id,slotIndex){
  const d=getDef(type,id); if(!d) return;
  const count=blueprintCount(type,id), unlocked=isBlueprintUnlocked(type,id), need=blueprintNeed(d), remain=Math.max(0,need-count);
  const body=`<div class="bigCurrentCard"><div class="topLine"><div class="bigIconBadge">${prettyItemIcon(type,id)}</div><div><div class="detailSectionTitle" style="margin:0">${d.name}</div><div style="font-size:.8rem;color:#aac0de">${d.desc}</div></div></div><div class="detailMeta">${type==="weapon" ? weaponDetailMeta(d,{lvl:1}).map(x=>`<span class="metaChip">${x}</span>`).join("") : `<span class="metaChip">負荷 ${d.load}</span>`}${!unlocked?`<span class="metaChip">解析 ${count}/${need}</span><span class="metaChip">あと${remain}回入手</span>`:"<span class='metaChip'>設計図完成</span>"}</div>${unlocked?materialNeedListHTML(d.cost):""}</div>`;
  const buttons = unlocked ? [{label:"作成", primary:true, onClick:()=>{ craftToStorage(type,id); renderMaintenanceSubScreen("ship", `${type}:${slotIndex}`); }}] : [{label:"OK", primary:true, onClick:()=>{}}];
  openActionModal(d.name, body, buttons);
}
function openFishingOwnedModal(type,id){
  const name = type==="hook" ? (hookTypes.find(x=>x.id===id)?.name||id) : `${id}${{rod:"ロッド",reel:"リール",line:"ライン"}[type]}`;
  const desc = type==="hook" ? (hookTypes.find(x=>x.id===id)?.desc||"") : (id==="安定"?"成功ゾーンへの追従が楽になる":id==="高速"?"回収進捗が速くなる":id==="重量"?"タップ上昇力が強くなる":"標準性能");
  const body=`<div class="bigCurrentCard"><div class="topLine"><div class="bigIconBadge">${prettyItemIcon(type,id)}</div><div><div class="detailSectionTitle" style="margin:0">${name}</div><div style="font-size:.8rem;color:#aac0de">${desc}</div></div></div></div>`;
  openActionModal(name, body, [{label:"装備", primary:true, onClick:()=>{ if(type==="hook") run.rod.hook=id; else run.rod[type]=id; saveRun(); renderMaintenanceSubScreen("fishing", type); toast("装備を変更"); }}]);
}
function openFishingCraftModal(type,id){
  const cost=fishingRecipes[type]?.[id]; if(!cost) return;
  const name = type==="hook" ? (hookTypes.find(x=>x.id===id)?.name||id) : `${id}${{rod:"ロッド",reel:"リール",line:"ライン"}[type]}`;
  const desc = type==="hook" ? (hookTypes.find(x=>x.id===id)?.desc||"") : (id==="安定"?"成功ゾーンへの追従が楽になる":id==="高速"?"回収進捗が速くなる":id==="重量"?"タップ上昇力が強くなる":"標準性能");
  const body=`<div class="bigCurrentCard"><div class="topLine"><div class="bigIconBadge">${prettyItemIcon(type,id)}</div><div><div class="detailSectionTitle" style="margin:0">${name}</div><div style="font-size:.8rem;color:#aac0de">${desc}</div></div></div>${materialNeedListHTML(cost)}</div>`;
  openActionModal(name, body, [{label:"作成", primary:true, onClick:()=>{ craftFishing(type,id); renderMaintenanceSubScreen("fishing", type); }}]);
}
function openSubScreen(tab){
 currentTab=tab; uiPaused=true; $("#subScreen").classList.add("active");
 if(tab==="maintenance"){ renderMaintenanceSubScreen(maintState.major||"ship", maintState.slot || "hull"); return; }
 if(tab==="settings"){ $("#subScreenTitle").textContent="設定"; renderSettingsSubScreen(); return; }
}
function closeSubScreen(){
 $("#subScreen").classList.remove("active");
 $("#itemActionModal").classList.remove("active");
 uiPaused=false; currentTab="fishing";
 $$("#gameNav button").forEach(b=>b.classList.toggle("active",b.dataset.tab==="fishing"));
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
 if(old){
   const info=`${Number(old.distance||0).toFixed(2)} ly / 海賊撃破 ${old.kills||0}`;
   $("#saveChoiceInfo").textContent=`前回の航行データ：${info}`;
   $("#saveChoiceModal").classList.add("active");
   $("#continueRunBtn").onclick=()=>{
     $("#saveChoiceModal").classList.remove("active");
     run=loadRun();normalizeResumeState();recalcPlayer();startGame();
   };
   $("#finishSavedRunBtn").onclick=()=>{
     $("#saveChoiceModal").classList.remove("active");
     run=loadRun();normalizeResumeState();recalcPlayer();endRun();
   };
   $("#cancelSaveChoiceBtn").onclick=()=>$("#saveChoiceModal").classList.remove("active");
   return;
 }
 const max=meta.upgrades.beacon*2;
 if(max>0){
   const val=prompt(`開始地点を入力してください（0〜${max} ly / 2刻み推奨）`,String(max));
   if(val===null)return;newRun(clamp(Number(val)||0,0,max));
 }else newRun(0);
};
$("#closeDrawerBtn").onclick=()=>$("#drawer").classList.remove("active");
$("#subBackBtn").onclick=closeSubScreen;
$("#itemActionClose").onclick=closeActionModal;
$("#itemActionModal").onclick=(e)=>{if(e.target.id==="itemActionModal")closeActionModal()};
$("#overflowCloseBtn").onclick=()=>{ if(overflowView==="select") renderOverflowChoice(); };
$("#overflowModal").onclick=(e)=>{ if(e.target.id==="overflowModal" && overflowView==="select") renderOverflowChoice(); };
$$("#gameNav button").forEach(b=>b.onclick=()=>{
 const tab=b.dataset.tab;
 if(b.disabled)return;
 if(tab==="fishing"){closeSubScreen();return}
 $$("#gameNav button").forEach(x=>x.classList.toggle("active",x===b));
 openSubScreen(tab);
});
$$(".enemyPart").forEach(b=>b.onclick=()=>{if(run?.mode==="battle"){const p=b.dataset.part;if(p==="core"||!run.enemy.parts[p]?.destroyed){run.enemy.target=p;renderEnemy()}}});
$("#resetSaveBtn").onclick=()=>{if(confirm("セーブデータをすべて削除しますか？")){localStorage.removeItem(SAVE_KEY);localStorage.removeItem(SAVE_KEY+"_run");meta=defaultMeta();saveMeta();updateMetaUI();toast("初期化しました")}};
for(const [id,key] of [["bgmToggle","bgm"],["seToggle","se"],["shakeToggle","shake"],["vibeToggle","vibe"]]){
 $("#"+id).checked=meta.settings[key];$("#"+id).onchange=e=>{meta.settings[key]=e.target.checked;saveMeta()}
}
renderUpgradeTabs();renderUpgradePanel();updateMetaUI();
window.addEventListener("beforeunload",()=>{
 if(run){
   // 釣り中・戦闘中はその状態を保存し、再開処理側で安全に復元する。
   if(uiPaused && ["fishing","biteSignal","lootReveal"].includes(run.mode)){
     run.mode="fishing";
     run.pendingSignal=null;
   }
   saveRun();
 }
 saveMeta();
});
})();

(function(global){
  'use strict';

  const imageCache = new Map();
  function loadImage(src){
    if(!src) return Promise.reject(new Error('missing image src'));
    if(imageCache.has(src)) return imageCache.get(src);
    const p = new Promise((resolve,reject)=>{
      const img = new Image();
      img.onload=()=>resolve(img);
      img.onerror=()=>reject(new Error('image load failed'));
      img.src=src;
    });
    imageCache.set(src,p);
    return p;
  }

  function viewportVirtualSize(viewport='phone'){
    if(viewport==='landscape') return {width:1600,height:900};
    if(viewport==='square') return {width:1000,height:1000};
    if(viewport==='wide') return {width:2100,height:900};
    return {width:900,height:1600};
  }

  // Canonical v4.4 geometry.
  // w/h describe an element box in scene-canvas %. The processed bitmap is
  // object-fit:contain inside that box. A/M/T are image-local points and are
  // mapped through that contain transform before placement/rotation.
  function elementGeometry(el, proc, rect){
    const boxW=rect.width*(Number(el.w||10)/100)*(Number(el.scale||1));
    const boxH=rect.height*(Number(el.h||10)/100)*(Number(el.scale||1));
    const srcW=Math.max(1,Number(proc.width||1));
    const srcH=Math.max(1,Number(proc.height||1));
    const containScale=Math.min(boxW/srcW,boxH/srcH);
    const drawW=srcW*containScale, drawH=srcH*containScale;
    const padX=(boxW-drawW)/2, padY=(boxH-drawH)/2;

    const aSrc={x:Number(proc.anchor?.x ?? srcW/2),y:Number(proc.anchor?.y ?? srcH/2)};
    const mSrc={x:Number(proc.mount?.x ?? srcW/2),y:Number(proc.mount?.y ?? srcH/2)};
    const tSrc={x:Number((proc.muzzle||proc.tip)?.x ?? srcW/2),y:Number((proc.muzzle||proc.tip)?.y ?? srcH/2)};
    const aBox={x:padX+aSrc.x*containScale,y:padY+aSrc.y*containScale};
    const mBox={x:padX+mSrc.x*containScale,y:padY+mSrc.y*containScale};
    const tBox={x:padX+tSrc.x*containScale,y:padY+tSrc.y*containScale};

    const targetX=rect.width*(Number(el.x||0)/100), targetY=rect.height*(Number(el.y||0)/100);
    const rot=(Number(el.rotation)||0)*Math.PI/180;
    const fx=el.flipX?-1:1, fy=el.flipY?-1:1;
    const mode=el.placementMode==='mount'?'mount':'anchor';
    const qBox=mode==='mount'?mBox:aBox;
    const dx=(qBox.x-aBox.x)*fx, dy=(qBox.y-aBox.y)*fy;
    const rdx=dx*Math.cos(rot)-dy*Math.sin(rot), rdy=dx*Math.sin(rot)+dy*Math.cos(rot);
    const anchorWorld={x:targetX-rdx,y:targetY-rdy};
    const leftPx=anchorWorld.x-aBox.x, topPx=anchorWorld.y-aBox.y;

    function transformBoxPoint(p){
      const px=(p.x-aBox.x)*fx, py=(p.y-aBox.y)*fy;
      const rx=px*Math.cos(rot)-py*Math.sin(rot), ry=px*Math.sin(rot)+py*Math.cos(rot);
      return {x:anchorWorld.x+rx,y:anchorWorld.y+ry};
    }
    return {
      wPx:boxW,hPx:boxH,boxW,boxH,drawW,drawH,padX,padY,containScale,
      leftPx,topPx,rot,fx,fy,anchorWorld,
      aBox,mBox,tBox,
      ax:aBox.x/boxW,ay:aBox.y/boxH,mx:mBox.x/boxW,my:mBox.y/boxH,tx:tBox.x/boxW,ty:tBox.y/boxH,
      anchor:anchorWorld,mount:transformBoxPoint(mBox),tip:transformBoxPoint(tBox),
      mode
    };
  }

  function drawBackground(ctx,w,h){
    const g=ctx.createLinearGradient(0,0,0,h);
    g.addColorStop(0,'#0b1630'); g.addColorStop(.70,'#081019'); g.addColorStop(1,'#081019');
    ctx.fillStyle=g; ctx.fillRect(0,0,w,h);
    const r=ctx.createRadialGradient(w*.5,h*.22,0,w*.5,h*.22,Math.max(w,h)*.45);
    r.addColorStop(0,'rgba(80,147,255,.20)'); r.addColorStop(1,'rgba(80,147,255,0)');
    ctx.fillStyle=r; ctx.fillRect(0,0,w,h);
  }

  async function renderSceneToCanvas(canvas, options){
    const {
      viewport='phone', camera={x:0,y:0,w:100,h:100}, elements=[], processedAssets={},
      cssWidth, cssHeight, pixelRatio=(global.devicePixelRatio||1), background=true
    } = options||{};
    const base=viewportVirtualSize(viewport);
    const camPx={
      x:base.width*(Number(camera.x||0)/100), y:base.height*(Number(camera.y||0)/100),
      width:base.width*(Number(camera.w||100)/100), height:base.height*(Number(camera.h||100)/100)
    };
    const targetW=Math.max(1,Number(cssWidth)||canvas.clientWidth||620);
    const targetH=Math.max(1,Number(cssHeight)||canvas.clientHeight||Math.round(targetW*camPx.height/camPx.width));
    const dpr=Math.max(1,Math.min(3,Number(pixelRatio)||1));
    canvas.width=Math.round(targetW*dpr); canvas.height=Math.round(targetH*dpr);
    canvas.style.width=`${targetW}px`; canvas.style.height=`${targetH}px`;
    const ctx=canvas.getContext('2d',{alpha:true});
    // Hard-reset every frame to transparent pixels before drawing. Using
    // globalCompositeOperation='copy' avoids stale RGB/alpha from any prior
    // render regardless of the current transform/state.
    ctx.save();
    ctx.setTransform(1,0,0,1,0,0);
    ctx.globalCompositeOperation='copy';
    ctx.fillStyle='rgba(0,0,0,0)';
    ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.restore();
    ctx.setTransform(dpr,0,0,dpr,0,0);
    ctx.globalCompositeOperation='source-over';
    if(background) drawBackground(ctx,targetW,targetH);

    const scale=Math.min(targetW/camPx.width,targetH/camPx.height);
    const shownW=camPx.width*scale, shownH=camPx.height*scale;
    const centerX=(targetW-shownW)/2, centerY=(targetH-shownH)/2;
    const worldW=base.width*scale, worldH=base.height*scale;
    const offsetX=centerX-camPx.x*scale, offsetY=centerY-camPx.y*scale;
    const rect={width:worldW,height:worldH};

    const points={};
    for(const el of [...elements].filter(e=>e?.visible!==false).sort((a,b)=>(a.z||0)-(b.z||0))){
      const proc=processedAssets[el.assetId]; if(!proc?.url) continue;
      let img; try{ img=await loadImage(proc.url); }catch(_){ continue; }
      const g=elementGeometry(el,proc,rect);
      const anchorX=offsetX+g.anchorWorld.x, anchorY=offsetY+g.anchorWorld.y;
      ctx.save();
      ctx.globalAlpha=Number(el.opacity??1);
      ctx.translate(anchorX,anchorY); ctx.rotate(g.rot); ctx.scale(g.fx,g.fy);
      ctx.imageSmoothingEnabled=false;
      // Bitmap-local A is at the transform origin. This is the same contain
      // mapping used by elementGeometry, so A/M/T remain attached to pixels.
      const drawX=-Number(proc.anchor?.x ?? proc.width/2)*g.containScale;
      const drawY=-Number(proc.anchor?.y ?? proc.height/2)*g.containScale;
      ctx.drawImage(img,drawX,drawY,g.drawW,g.drawH);
      ctx.restore();

      points[el.id]={
        anchor:{x:offsetX+g.anchor.x,y:offsetY+g.anchor.y},
        mount:{x:offsetX+g.mount.x,y:offsetY+g.mount.y},
        tip:{x:offsetX+g.tip.x,y:offsetY+g.tip.y},
        key:el.key,assetId:el.assetId
      };
    }
    return {width:targetW,height:targetH,base,camera:camPx,scale,offsetX,offsetY,points};
  }

  global.VoidAnglerCanvasRenderer={
    version:'canvas-v1.2-transparent', viewportVirtualSize, elementGeometry, renderSceneToCanvas
  };
})(window);

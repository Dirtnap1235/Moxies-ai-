'use strict';
const W=240,H=160;
const cv=document.getElementById('screen');let ctx=cv.getContext('2d');
ctx.imageSmoothingEnabled=false;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const rnd=n=>Math.floor(Math.random()*n);
const pick=a=>a[rnd(a.length)];

// ---------- layout ----------
function fit(){
  const vw=innerWidth,vh=innerHeight,portrait=vw<=vh;let px,cu;
  if(portrait){cu=Math.min(vw/8.2,58);px=Math.min((vw-cu*1.4)/240,(vh-cu*6.6)/160);}
  else{cu=Math.min(vh/8.5,56);px=Math.min((vw-cu*8)/240,(vh-cu*2.8)/160);}
  px=px>=2?Math.floor(px*2)/2:Math.max(.8,px);
  const s=document.documentElement.style;s.setProperty('--px',px.toFixed(2));s.setProperty('--cu',cu.toFixed(1)+'px');
}
addEventListener('resize',fit);fit();

// ---------- input ----------
let hit={},FH={},held={};
const KEYS={arrowup:'up',arrowdown:'down',arrowleft:'left',arrowright:'right',w:'up',s:'down',a:'left',d:'right',z:'a',' ':'a',j:'a',x:'b',k:'b',escape:'b',enter:'start',shift:'select',backspace:'select',q:'select'};
function press(k){try{initAudio();}catch(e){}if(!held[k]){held[k]=1;hit[k]=1;}}
function release(k){held[k]=0;}
addEventListener('keydown',e=>{if(e.metaKey||e.ctrlKey||e.altKey)return;const k=KEYS[e.key.toLowerCase()];if(k){e.preventDefault();if(!e.repeat)press(k);}});
addEventListener('keyup',e=>{const k=KEYS[e.key.toLowerCase()];if(k)release(k);});
addEventListener('blur',()=>{held={};});
document.querySelectorAll('[data-k]').forEach(b=>{
  const k=b.dataset.k;
  b.addEventListener('pointerdown',e=>{e.preventDefault();try{b.setPointerCapture(e.pointerId);}catch(_){}press(k);b.classList.add('on');});
  const up=()=>{release(k);b.classList.remove('on');};
  ['pointerup','pointercancel','lostpointercapture'].forEach(n=>b.addEventListener(n,up));
});

// ---------- frame loop with awaitable ticks ----------
let waiters=[],T=0,lastT=0,accT=0,renderFn=()=>{};
const tick=()=>new Promise(r=>waiters.push(r));
const wait=async n=>{for(let i=0;i<n;i++)await tick();};
async function waitHit(...ks){for(;;){await tick();for(const k of ks)if(FH[k])return k;}}
function frame(t){
  requestAnimationFrame(frame);
  accT+=Math.min(100,t-lastT);lastT=t;let n=0;
  while(accT>=1000/60&&n<2){
    accT-=1000/60;n++;
    const nh=hit;hit={};FH=n>1?Object.assign(nh,FH):nh;T++;
    const w=waiters;waiters=[];w.forEach(r=>r());
  }
  if(accT>100)accT=0;
  if(n){ctx.imageSmoothingEnabled=false;ctx.globalAlpha=1;renderFn();UI.draw();}
}

// ---------- drawing helpers ----------
const FONT='8px "Press Start 2P",monospace';
const FONT5='0000000000 00005F0000 0007000700 147F147F14 242A7F2A12 2313086462 3649552250 0005030000 001C224100 0041221C00 082A1C2A08 08083E0808 0050300000 0808080808 0060600000 2010080402 3E5149453E 00427F4000 4261514946 2141454B31 1814127F10 2745454539 3C4A494930 0171090503 3649494936 064949291E 0036360000 0056360000 0008142241 1414141414 4122140800 0201510906 324979413E 7E1111117E 7F49494936 3E41414122 7F4141221C 7F49494941 7F09090901 3E4149497A 7F0808087F 00417F4100 2040413F01 7F08142241 7F40404040 7F020C027F 7F0408107F 3E4141413E 7F09090906 3E4151215E 7F09192946 4649494931 01017F0101 3F4040403F 1F2040201F 3F4038403F 6314081463 0708700807 6151494543 00007F4141 0204081020 41417F0000 0402010204 4040404040 0001020400 2054545478 7F48444438 3844444420 384444487F 3854545418 087E090102 081454543C 7F08040478 00447D4000 2040443D00 007F102844 00417F4000 7C04180478 7C08040478 3844444438 7C14141408 081414187C 7C08040408 4854545420 043F444020 3C4040207C 1C2040201C 3C4030403C 4428102844 0C5050503C 4464544C44 0008364100 00007F0000 0041360800 0804081008'.split(' ').map(h=>[0,1,2,3,4].map(c=>parseInt(h.substr(c*2,2),16)));
let FONT_OK=false;
function bmText(s,x,y,col){ctx.fillStyle=col;for(let i=0;i<s.length;i++){const g=FONT5[s.charCodeAt(i)-32];if(!g)continue;for(let c=0;c<5;c++)for(let r=0;r<7;r++)if((g[c]>>r)&1)ctx.fillRect(x+i*8+1+c,y+r,1,1);}}
function txt(s,x,y,col='#383848',sh='#b8b8c8'){
  if(!FONT_OK){if(sh)bmText(s,x+1,y+1,sh);bmText(s,x,y,col);return;}
  ctx.font=FONT;ctx.textBaseline='top';ctx.textAlign='left';
  if(sh){ctx.fillStyle=sh;ctx.fillText(s,x+1,y+1);}
  ctx.fillStyle=col;ctx.fillText(s,x,y);
}
function txtR(s,xr,y,col,sh){txt(s,xr-s.length*8,y,col,sh);}
function txtC(s,y,col,sh,cx=W/2){txt(s,Math.round(cx-s.length*4),y,col,sh);}
const rr=(x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(x+1,y,w-2,h);ctx.fillRect(x,y+1,w,h-2);};
const fr=(x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(x,y,w,h);};
function box(x,y,w,h){rr(x,y,w,h,'#303048');rr(x+1,y+1,w-2,h-2,'#d85a5a');rr(x+2,y+2,w-4,h-4,'#fffcf0');}
function arrow(x,y,c='#303048'){fr(x,y,1,7,c);fr(x+1,y+1,1,5,c);fr(x+2,y+2,1,3,c);fr(x+3,y+3,1,1,c);}
function hpColor(f){return f>.5?'#40c850':f>.2?'#f8c820':'#e84030';}

// ---------- UI layer: message box, menus, fades ----------
const TB={x:0,y:112,w:240,h:48};
const UI={msg:null,menus:[],fade:0,fadeCol:'#000',flash:0,flashCol:'#fff',extra:[]};
UI.draw=function(){
  for(const f of UI.extra)f();
  if(UI.msg){
    const m=UI.msg,b=m.box,n=Math.floor(m.n);
    box(b.x,b.y,b.w,b.h);
    txt(m.a.slice(0,n),b.x+10,b.y+11);
    if(n>m.a.length)txt(m.b.slice(0,n-m.a.length),b.x+10,b.y+27);
    if(m.arrow&&((T>>4)&1)){fr(b.x+b.w-17,b.y+b.h-15,6,2,'#d85a5a');fr(b.x+b.w-16,b.y+b.h-13,4,2,'#d85a5a');fr(b.x+b.w-15,b.y+b.h-11,2,1,'#d85a5a');}
  }
  for(const m of UI.menus)drawMenu(m);
  if(UI.flash>0){ctx.globalAlpha=UI.flash;fr(0,0,W,H,UI.flashCol);ctx.globalAlpha=1;}
  if(UI.fade>0){ctx.globalAlpha=UI.fade;fr(0,0,W,H,UI.fadeCol);ctx.globalAlpha=1;}
};
function wrapText(s,max){
  const out=[];
  for(const para of String(s).split('\n')){let line='';
    for(const w of para.split(' ')){const t=line?line+' '+w:w;if(t.length>max&&line){out.push(line);line=w;}else line=t;}
    out.push(line);}
  return out;
}
async function say(text,o={}){
  const L=wrapText(text,o.max||25),b=o.box||TB;
  for(let i=0;i<L.length;i+=2){
    const m=UI.msg={a:L[i],b:L[i+1]||'',n:0,arrow:false,box:b},tot=m.a.length+m.b.length;
    while(m.n<tot){m.n+=(held.a||held.b)?1.5:(o.fast?1.5:.6);await tick();}
    m.n=tot;const last=i+2>=L.length;
    if(o.auto&&last)await wait(o.auto);
    else if(!(last&&o.noWait)){m.arrow=true;await waitHit('a','b');m.arrow=false;sfx('cursor');}
  }
  if(!o.keep)UI.msg=null;
}
function drawMenu(m){
  box(m.x,m.y,m.w,m.h);
  const vis=m.vis*m.cols;
  for(let k=0;k<vis;k++){
    const idx=m.top*m.cols+k;if(idx>=m.lab.length)break;
    const col=k%m.cols,row=Math.floor(k/m.cols),x=m.x+14+col*m.cw,y=m.y+Math.floor((m.h-m.vis*13)/2)+1+row*13;
    txt(m.lab[idx],x,y,m.dis&&m.dis[idx]?'#a0a0b0':'#383848',m.dis&&m.dis[idx]?null:'#b8b8c8');
    if(m.rt[idx])txtR(m.rt[idx],x+m.cw-10,y);
    if(idx===m.i)arrow(m.x+6+col*m.cw,y,'#303048');
  }
  if(m.top>0)fr(m.x+m.w-11,m.y+5,5,1,'#d85a5a');
  if((m.top+m.vis)*m.cols<m.lab.length)fr(m.x+m.w-11,m.y+m.h-6,5,1,'#d85a5a');
}
async function choose(opts,o={}){
  const cols=o.cols||1,total=Math.ceil(opts.length/cols),vis=Math.min(o.rows||total,total);
  const lab=opts.map(v=>Array.isArray(v)?v[0]:v),rt=opts.map(v=>Array.isArray(v)?v[1]:'');
  const cw=o.cw||Math.max(...lab.map((s,i)=>(s.length+(rt[i]?rt[i].length+1:0))*8))+18;
  const w=cols*cw+8,h=o.h||vis*13+9;
  const m={lab,rt,x:o.x??W-w-2,y:o.y??108-h,w,h,cw,cols,vis,top:0,i:o.idx||0,dis:o.dis,onMove:o.onMove};
  UI.menus.push(m);
  try{
    for(;;){
      await tick();
      const n=lab.length;let d=0;
      if(FH.up)d=-cols;else if(FH.down)d=cols;else if(cols>1&&FH.left)d=-1;else if(cols>1&&FH.right)d=1;
      if(d){const ni=m.i+d;if(ni>=0&&ni<n){m.i=ni;sfx('cursor');}else if(cols===1){m.i=ni<0?n-1:0;sfx('cursor');}}
      const row=Math.floor(m.i/cols);if(row<m.top)m.top=row;if(row>=m.top+vis)m.top=row-vis+1;
      if(FH.a){sfx('select');return m.i;}
      if(FH.b&&o.cancel!==false){sfx('cursor');return -1;}
    }
  }finally{UI.menus.splice(UI.menus.indexOf(m),1);}
}
async function yesno(o={}){return (await choose(['YES','NO'],{cw:50,...o}))===0;}
async function fade(to,fr=18,col='#000'){UI.fadeCol=col;const f0=UI.fade;for(let i=1;i<=fr;i++){UI.fade=f0+(to-f0)*i/fr;await tick();}UI.fade=to;}
async function flashScr(col='#fff',n=2,len=4){UI.flashCol=col;for(let i=0;i<n;i++){UI.flash=.85;await wait(len);UI.flash=0;await wait(len);}}
function bar(x,y,w,f,col){fr(x,y,w,5,'#383848');fr(x+1,y+1,w-2,3,'#e8e8e0');const n=Math.round((w-2)*clamp(f,0,1));if(n>0){fr(x+1,y+1,n,3,col);fr(x+1,y+1,n,1,'rgba(255,255,255,.4)');}}

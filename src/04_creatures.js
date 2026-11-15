// ---------- procedural creature sprites with banded shading + outline ----------
function hexRGB(h){return [parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];}
function mixRGB(a,b,t){return [a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];}
const css=c=>`rgb(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])})`;
// 5-tone hue-shifted ramp: shadows drift cool/violet, lights drift warm
function ramp(hex){
  const b=hexRGB(hex),m=(t,a)=>css(mixRGB(b,hexRGB(t),a));
  return [m('#1c0e3c',.6),m('#46288a',.3),css(b),m('#fff0a0',.24),m('#fffbe6',.55)];
}
const outlineOf=(hex,a)=>css(mixRGB(hexRGB(hex),hexRGB('#0e0818'),a));
function expandShapes(list,back){
  const out=[];
  for(const s of list){
    if(back&&s.face)continue;
    out.push(s);
    if(s.m){const m={...s};if(s.e)m.e=[1-s.e[0],s.e[1],s.e[2],s.e[3]];if(s.t)m.t=s.t.map(([x,y])=>[1-x,y]);out.push(m);}
  }
  return out;
}
const BAY=[[0,0],[0,0]];
function mkCreature(def,S,back){
  const shapes=expandShapes(def.sh,back),grid=new Array(S*S).fill(-1),geo=[];
  const at=(x,y)=>x<0||y<0||x>=S||y>=S?-1:grid[y*S+x];
  shapes.forEach((s,i)=>{
    if(s.e){const [cx,cy,rx,ry]=s.e.map(v=>v*S);geo[i]=[cx,cy,rx,ry];
      for(let y=Math.floor(cy-ry);y<=Math.ceil(cy+ry);y++)for(let x=Math.floor(cx-rx);x<=Math.ceil(cx+rx);x++){
        const dx=(x+.5-cx)/rx,dy=(y+.5-cy)/ry;if(dx*dx+dy*dy<=1&&x>=0&&y>=0&&x<S&&y<S)grid[y*S+x]=i;}}
    else{const pts=s.t.map(p=>[p[0]*S,p[1]*S]),[[ax,ay],[bx,by],[cx,cy]]=pts;
      const xs=pts.map(p=>p[0]),ys=pts.map(p=>p[1]);
      geo[i]=[(Math.min(...xs)+Math.max(...xs))/2,(Math.min(...ys)+Math.max(...ys))/2,(Math.max(...xs)-Math.min(...xs))/2||1,(Math.max(...ys)-Math.min(...ys))/2||1];
      const dn=((by-cy)*(ax-cx)+(cx-bx)*(ay-cy));
      for(let y=0;y<S;y++)for(let x=0;x<S;x++){
        const px=x+.5,py=y+.5;
        const l1=((by-cy)*(px-cx)+(cx-bx)*(py-cy))/dn,l2=((cy-ay)*(px-cx)+(ax-cx)*(py-cy))/dn,l3=1-l1-l2;
        if(l1>=0&&l2>=0&&l3>=0)grid[y*S+x]=i;}}
  });
  const ramps=shapes.map(s=>ramp(def.c[s.c]));
  const [c,g]=mkCanvas(S,S);
  const col=new Array(S*S).fill(null);
  // 1. directional shading with ordered dither
  const L=[-.5,-.62,.6];
  for(let y=0;y<S;y++)for(let x=0;x<S;x++){
    const o=grid[y*S+x];if(o<0)continue;
    const [cx,cy,rx,ry]=geo[o];
    let nx=clamp((x+.5-cx)/(rx*1.05),-1,1),ny=clamp((y+.5-cy)/(ry*1.05),-1,1);
    const nz=Math.sqrt(Math.max(0,1-nx*nx-ny*ny));
    let d=nx*L[0]+ny*L[1]+nz*L[2]+BAY[y&1][x&1];
    const r=ramps[o];
    let t=d>.5?3:d>-.08?2:d>-.55?1:0;
    col[y*S+x]=r[t];
  }
  // 2. interior separation lines where a shape sits over another
  const lines=[];
  for(let y=0;y<S;y++)for(let x=0;x<S;x++){
    const o=grid[y*S+x];if(o<0||shapes[o].c===3||shapes[o].nl)continue;
    const down=at(x,y+1),right=at(x+1,y),up=at(x,y-1),left=at(x-1,y);
    if((down>=0&&down<o&&shapes[down].c!==3)||(right>=0&&right<o&&shapes[right].c!==3))lines.push([x,y,ramps[o][0]]);
    else if((up>=0&&up<o&&shapes[up].c!==3)||(left>=0&&left<o&&shapes[left].c!==3))lines.push([x,y,ramps[o][1]]);
  }
  for(const [x,y,cc] of lines)col[y*S+x]=cc;
  for(let y=0;y<S;y++)for(let x=0;x<S;x++){const cc=col[y*S+x];if(cc){g.fillStyle=cc;g.fillRect(x,y,1,1);}}
  // 3. selective outline (4-neighbour), tinted from the neighbouring fill; lighter on lit side
  const outs=[];
  for(let y=0;y<S;y++)for(let x=0;x<S;x++){
    if(grid[y*S+x]>=0)continue;
    let best=-1,amt=.86;
    for(const [dx,dy] of [[1,0],[0,1],[-1,0],[0,-1]]){const o=at(x+dx,y+dy);if(o>=0){best=o;}}
    if(best>=0)outs.push([x,y,outlineOf(def.c[shapes[best].c],amt)]);
  }
  for(const [x,y,cc] of outs){g.fillStyle=cc;g.fillRect(x,y,1,1);}
  // 4. eyes: 3x4 with rounded top, white glint toward centre, soft lower sheen
  if(!back&&def.eye){
    const w=S>=40?3:2,h=w+1,[ex,ey]=def.eye,y0=Math.round(ey*S);
    for(const left of [true,false]){
      const x0=left?Math.round(ex*S):Math.round((1-ex)*S)-w;
      g.fillStyle='#1a1226';g.fillRect(x0,y0,w,h);
      g.clearRect(x0+(left?0:w-1),y0,1,1);g.fillStyle='#1a1226';
      g.fillStyle='#ffffff';g.fillRect(left?x0+w-1:x0,y0+1,1,1);
      g.fillStyle='#6a5aa8';g.fillRect(left?x0:x0+w-1,y0+h-1,1,1);
    }
  }
  return c;
}
function silhouette(img,col){
  const [c,g]=mkCanvas(img.width,img.height);g.drawImage(img,0,0);g.globalCompositeOperation='source-atop';g.fillStyle=col;g.fillRect(0,0,c.width,c.height);return c;
}
// ---- species look definitions (normalized coords 0..1; c = palette index; m = mirror; face = hidden from back view)
// palette: [base, dark, accent, belly, accent2]
const LOOK={
1:{c:['#f0883a','#c25a28','#ffd54a','#ffe8c4','#f05030'],eye:[.38,.34],sh:[
  {e:[.82,.62,.09,.2],c:1},{t:[[.76,.46],[.86,.14],[.94,.46]],c:2},{e:[.5,.66,.24,.22],c:0},{e:[.5,.7,.13,.15],c:3,face:1},
  {e:[.36,.89,.09,.05],c:1,m:1},{e:[.5,.36,.22,.19],c:0},{t:[[.3,.26],[.28,.02],[.44,.18]],c:0,m:1},{t:[[.3,.2],[.3,.08],[.38,.17]],c:3,m:1,face:1},{t:[[.29,.42],[.13,.47],[.3,.5]],c:3,m:1}]},
2:{c:['#d8402e','#9a2a22','#ffc83a','#ffd8b0','#ff7a30'],eye:[.37,.3],sh:[
  {e:[.84,.56,.1,.24],c:1},{t:[[.78,.44],[.9,.06],[.98,.46]],c:2},{t:[[.82,.5],[.94,.2],[.98,.5]],c:4},
  {e:[.5,.64,.3,.26],c:0},{e:[.5,.7,.16,.18],c:3,face:1},{e:[.34,.9,.1,.06],c:1,m:1},{e:[.2,.62,.07,.14],c:0,m:1},
  {t:[[.27,.36],[.06,.14],[.34,.2]],c:2,m:1},{t:[[.28,.48],[.04,.5],[.26,.36]],c:2,m:1},
  {e:[.5,.32,.24,.2],c:0},{t:[[.34,.2],[.34,-.0],[.44,.16]],c:1,m:1},{e:[.5,.42,.1,.07],c:3,face:1}]},
3:{c:['#68c45a','#3e9246','#e85f8a','#d9f2a8','#ffe66a'],eye:[.37,.42],sh:[
  {e:[.5,.66,.27,.24],c:0},{e:[.5,.72,.15,.14],c:3,face:1},{e:[.34,.9,.09,.05],c:1,m:1},{e:[.5,.4,.25,.2],c:0},
  {t:[[.48,.24],[.22,.04],[.38,.22]],c:1,m:1},{e:[.5,.14,.07,.09],c:2},{e:[.26,.38,.06,.06],c:3,m:1,face:1}]},
4:{c:['#4aa860','#2d7a46','#f060a0','#b8e890','#ffe66a'],eye:[.38,.4],sh:[
  {e:[.5,.68,.28,.24],c:0},{e:[.5,.74,.15,.14],c:3,face:1},{e:[.32,.91,.1,.05],c:1,m:1},{e:[.19,.62,.06,.15],c:1,m:1},
  {e:[.5,.42,.2,.17],c:0},{e:[.5,.14,.1,.1],c:2},{e:[.3,.22,.1,.1],c:2,m:1},{e:[.34,.08,.09,.08],c:2,m:1},{e:[.5,.2,.05,.05],c:4}]},
5:{c:['#4a8ae8','#2e5fc0','#9ee0ff','#d8f4ff','#ffffff'],eye:[.34,.5],sh:[
  {e:[.5,.66,.32,.27],c:0},{e:[.5,.76,.18,.14],c:3,face:1},{t:[[.5,.0],[.36,.3],[.64,.3]],c:0},{t:[[.2,.6],[.03,.5],[.2,.74]],c:1,m:1},
  {e:[.34,.93,.1,.04],c:1,m:1}]},
6:{c:['#2f9aa8','#1e6a8a','#f0e060','#e8f6e0','#ffffff'],eye:[.26,.18],sh:[
  {e:[.5,.7,.3,.24],c:0},{e:[.5,.76,.2,.16],c:3,face:1},{e:[.2,.86,.1,.09],c:1,m:1},{e:[.5,.42,.26,.2],c:0},
  {e:[.3,.22,.1,.1],c:0,m:1},{t:[[.44,.22],[.5,.0],[.56,.22]],c:2},{e:[.5,.5,.12,.03],c:1,face:1}]},
7:{c:['#e8b848','#b8842a','#f08a3a','#fff0c8','#ffffff'],eye:[.4,.36],sh:[
  {t:[[.42,.8],[.5,1],[.6,.8]],c:1},{e:[.5,.58,.27,.3],c:0},{e:[.5,.66,.16,.2],c:3,face:1},{e:[.24,.6,.09,.17],c:1,m:1},
  {e:[.4,.93,.05,.04],c:2,m:1},{t:[[.44,.22],[.5,.0],[.56,.22]],c:1},{t:[[.43,.46],[.5,.58],[.57,.46]],c:2,face:1}]},
8:{c:['#5aa0e0','#3a70b8','#ffd860','#f4f4ff','#ffffff'],eye:[.4,.26],sh:[
  {e:[.12,.5,.13,.3],c:1,m:1},{t:[[.04,.24],[.0,.74],[.14,.52]],c:1,m:1},{t:[[.4,.82],[.5,1],[.6,.82]],c:1},
  {e:[.5,.6,.24,.3],c:0},{e:[.5,.68,.14,.2],c:3,face:1},{e:[.5,.28,.18,.16],c:0},{t:[[.4,.16],[.5,.0],[.6,.16]],c:2},{t:[[.44,.34],[.5,.46],[.56,.34]],c:2,face:1}]},
9:{c:['#b88a58','#8a6238','#ffffff','#f0d8b0','#e090a0'],eye:[.37,.34],sh:[
  {e:[.84,.74,.08,.14],c:1},{e:[.5,.66,.25,.24],c:0},{e:[.5,.7,.14,.16],c:3,face:1},{e:[.36,.9,.09,.05],c:1,m:1},
  {e:[.5,.36,.22,.19],c:0},{e:[.3,.15,.09,.12],c:0,m:1},{e:[.3,.16,.04,.07],c:4,m:1,face:1},{e:[.5,.52,.05,.05],c:2,face:1},{e:[.5,.45,.03,.02],c:4,face:1}]},
10:{c:['#c8b8e8','#8f7cc0','#f0a0c0','#fff4ff','#ffffff'],eye:[.42,.28],sh:[
  {e:[.2,.4,.17,.22],c:2,m:1},{e:[.22,.66,.1,.14],c:1,m:1},{e:[.5,.62,.17,.28],c:0},{e:[.5,.7,.1,.16],c:3,face:1},
  {e:[.5,.28,.15,.14],c:0},{t:[[.44,.16],[.36,-.0],[.48,.14]],c:1,m:1}]},
11:{c:['#a8e0b0','#58a878','#f0d868','#f8fff0','#ffffff'],eye:[.42,.26],sh:[
  {e:[.16,.38,.18,.3],c:1,m:1},{e:[.2,.74,.12,.16],c:1,m:1},{e:[.14,.36,.06,.06],c:2,m:1},{e:[.2,.7,.04,.04],c:2,m:1},
  {e:[.5,.62,.15,.3],c:0},{e:[.5,.7,.09,.16],c:3,face:1},{e:[.5,.26,.15,.13],c:0},{t:[[.43,.14],[.28,-.02],[.46,.12]],c:1,m:1}]},
12:{c:['#9a9aa8','#6c6c80','#f0b050','#c8c8d4','#ffffff'],eye:[.37,.56],sh:[
  {e:[.5,.66,.3,.26],c:0},{e:[.3,.52,.14,.14],c:0},{e:[.68,.5,.12,.12],c:1},{e:[.34,.92,.1,.05],c:1,m:1},{t:[[.44,.34],[.5,.06],[.56,.34]],c:2},{t:[[.56,.38],[.64,.16],[.7,.38]],c:2}]},
13:{c:['#8a8aa0','#5a5a74','#ff9a40','#b8b8cc','#ffffff'],eye:[.37,.3],sh:[
  {e:[.5,.66,.34,.3],c:0},{e:[.14,.66,.1,.18],c:1,m:1},{e:[.3,.4,.14,.12],c:0,m:1},{e:[.32,.93,.1,.05],c:1,m:1},
  {e:[.5,.3,.2,.16],c:0},{t:[[.3,.2],[.22,-.0],[.38,.2]],c:2,m:1},{t:[[.43,.17],[.5,-.03],[.57,.17]],c:2},{e:[.5,.56,.14,.1],c:3,face:1}]},
14:{c:['#5cc8e0','#3a90b8','#ffe040','#e8f8ff','#ffffff'],eye:[.38,.38],sh:[
  {t:[[.68,.8],[.9,.46],[.8,.66]],c:2},{t:[[.84,.6],[.99,.3],[.94,.64]],c:2},{e:[.5,.68,.23,.21],c:0},{e:[.5,.73,.12,.12],c:3,face:1},
  {e:[.38,.9,.08,.05],c:1,m:1},{e:[.5,.4,.21,.18],c:0},{t:[[.3,.3],[.24,.08],[.4,.22]],c:0,m:1},{t:[[.44,.22],[.5,-.01],[.56,.22]],c:2},{t:[[.5,.2],[.64,.06],[.6,.26]],c:2},{e:[.27,.47,.04,.04],c:2,m:1,face:1}]},
15:{c:['#9a5ad0','#6a3a9a','#d8f060','#e8d0f8','#ffffff'],eye:[.34,.5],pupil:0,sh:[
  {e:[.5,.72,.35,.24],c:0},{e:[.5,.44,.22,.2],c:0},{t:[[.4,.28],[.34,.06],[.46,.26]],c:2,m:1},{e:[.2,.95,.06,.05],c:0,m:1},{e:[.5,.8,.2,.1],c:3,face:1},{e:[.34,.3,.04,.05],c:3,m:1,face:1}]},
};
const FS=40,BS=40,SPR={};
var sprites=function(id){
  if(SPR[id])return SPR[id];
  const d=LOOK[id];const s={front:mkCreature(d,FS,false),back:mkCreature(d,BS,true)};
  const [ic,ig]=mkCanvas(28,28);ig.drawImage(s.front,0,0,28,28);s.icon=ic;
  return SPR[id]=s;
}

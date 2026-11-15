// ---------- roster v2: drawn-from-parts creatures with unique body plans ----------
// Each species is a function that paints parts onto a 40x40 char grid; then shade + inner lines + outline.
const HAD={};
const _h2r=h=>[1,3,5].map(i=>parseInt(h.substr(i,2),16));
const _r2h=r=>'#'+r.map(v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0')).join('');
const _mx=(a,b,t)=>_r2h(_h2r(a).map((v,i)=>v+(_h2r(b)[i]-v)*t));
const rampOf=h=>({d:_mx(_mx(h,'#201040',.38),h,.0),m:h,l:_mx(h,'#fff4c0',.34)});
function palFrom(o){
  const P={o:o.ol||'#26182c',e:'#1c1430',w:'#ffffff',k:'#3a1a24',h:'#ffffff'};
  const R=(key,hex)=>{if(!hex)return;const r=rampOf(hex);P[key[0]]=r.d;P[key[1]]=r.m;P[key[2]]=r.l;};
  R('123',o.body);R('dcC',o.belly);R('nmM',o.wing);R('AaB',o.acc);R('xyz',o.extra);
  P.q=_mx(P[1],P.o,.45);P.F='#c8281c';P.G='#f26a1c';P.Y='#ffc830';P.W='#fff4b8';
  Object.assign(P,o.raw||{});return P;
}
function mkDraw(){
  const S=40,g=Array.from({length:S},()=>Array(S).fill('.')),L=Array.from({length:S},()=>Array(S).fill(-1)),sep=[];let part=0,symm=false;
  const d={g};
  const put=(x,y,c)=>{x=Math.round(x);y=Math.round(y);if(x<0||y<0||x>=S||y>=S||c==='.')return;g[y][x]=c;L[y][x]=part;};
  d.px=(x,y,c)=>{put(x,y,c);if(symm)put(S-1-x,y,c);};
  d.part=(s=true)=>{part++;sep[part]=s;};
  d.sym=fn=>{symm=true;fn();symm=false;};
  d.ell=(cx,cy,rx,ry,c)=>{for(let y=Math.floor(cy-ry-1);y<=cy+ry+1;y++)for(let x=Math.floor(cx-rx-1);x<=cx+rx+1;x++)if(((x-cx)/(rx+.5))**2+((y-cy)/(ry+.5))**2<=1)d.px(x,y,c);};
  d.rect=(x,y,w,h,c)=>{for(let j=0;j<h;j++)for(let i=0;i<w;i++)d.px(x+i,y+j,c);};
  d.line=(x0,y0,x1,y1,c)=>{const n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0),1);for(let i=0;i<=n;i++)d.px(x0+(x1-x0)*i/n,y0+(y1-y0)*i/n,c);};
  d.tube=(pts,c)=>{for(let i=0;i<pts.length-1;i++){const [x0,y0,r0]=pts[i],[x1,y1,r1]=pts[i+1],n=Math.ceil(Math.hypot(x1-x0,y1-y0)*2)+1;
    for(let k=0;k<=n;k++){const t=k/n;d.ell(x0+(x1-x0)*t,y0+(y1-y0)*t,(r0+(r1-r0)*t)-.5,(r0+(r1-r0)*t)-.5,c);}}};
  d.poly=(pts,c)=>{let y0=Math.min(...pts.map(p=>p[1])),y1=Math.max(...pts.map(p=>p[1]));
    for(let y=Math.floor(y0);y<=Math.ceil(y1);y++){const xs=[];for(let i=0;i<pts.length;i++){const [ax,ay]=pts[i],[bx,by]=pts[(i+1)%pts.length];
      if((ay<=y&&by>y)||(by<=y&&ay>y))xs.push(ax+(y-ay)*(bx-ax)/(by-ay));}
      xs.sort((a,b)=>a-b);for(let k=0;k+1<xs.length;k+=2)for(let x=Math.round(xs[k]);x<=Math.round(xs[k+1]);x++)d.px(x,y,c);}};
  d.stamp=(x,y,rows,flip)=>rows.forEach((r,j)=>{for(let i=0;i<r.length;i++){const ch=r[flip?r.length-1-i:i];if(ch!=='.')d.px(x+i,y+j,ch);}});
  d.eye=(x,y)=>d.stamp(x,y,['we','ee']);
  d.dots=(pts,step,c)=>{let acc=0;for(let i=0;i<pts.length-1;i++){const [x0,y0]=pts[i],[x1,y1]=pts[i+1],n=Math.hypot(x1-x0,y1-y0);for(let t=0;t<n;t+=1){acc++;if(acc%step===0)d.px(x0+(x1-x0)*t/n,y0+(y1-y0)*t/n,c);}}};
  d.flame=(x,y)=>d.stamp(x,y,['..F..','.FGF.','.FGYF','FGYWF','FGYWG','.FGYG','..FG.']);
  d.finish=(shadeMap,pal)=>{
    // cell shading from a fixed top-left light, based on the whole silhouette
    const sil=(x,y)=>x>=0&&y>=0&&x<S&&y<S&&g[y][x]!=='.';
    const snap=g.map(r=>r.slice());
    for(let y=0;y<S;y++)for(let x=0;x<S;x++){const m=shadeMap[snap[y][x]];if(!m)continue;
      if(!sil(x-2,y-2)||!sil(x-2,y-1)&&!sil(x-1,y-2))g[y][x]=m[0];
      else if(!sil(x+3,y+3)||!sil(x+3,y+2)||!sil(x+2,y+3))g[y][x]=m[1];}
    // inner lines where a later "separate" part overlaps an earlier one
    const mark=[];
    for(let y=0;y<S;y++)for(let x=0;x<S;x++){if(g[y][x]==='.')continue;
      for(const [dx,dy] of [[1,0],[0,1],[-1,0],[0,-1]]){const xx=x+dx,yy=y+dy;if(xx<0||yy<0||xx>=S||yy>=S||g[yy][xx]==='.')continue;
        if(L[yy][xx]>L[y][x]&&sep[L[yy][xx]]&&!'FGYWe'.includes(g[y][x])){mark.push([x,y]);break;}}}
    for(const [x,y] of mark)if('123nmMcCdaAB'.includes(g[y][x]))g[y][x]='q';
    return d;
  };
  return d;
}
function buildRoster(id,back){
  const def=HAD[id];const d=mkDraw();def.draw(d);d.finish(def.shade||{'2':['3','1'],c:['C','d'],m:['M','n'],a:['B','A']});
  if(def.over)def.over(d);
  const S=40,g=d.g,P=palFrom(def.pal);
  const [c,x]=mkCanvas(S,S);
  const bm={e:'2',w:'2',k:'2',c:'2',d:'1',C:'3'};
  const px=(X,Y,col)=>{x.fillStyle=col;x.fillRect(X,Y,1,1);};
  for(let Y=0;Y<S;Y++)for(let X=0;X<S;X++){let ch=g[Y][X];if(ch==='.')continue;if(back&&def.face&&bm[ch]&&!'FGYW'.includes(ch))ch=bm[ch];px(X,Y,P[ch]||'#f0f');}
  for(let Y=0;Y<S;Y++)for(let X=0;X<S;X++){if(g[Y][X]!=='.')continue;let near=false;
    for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const xx=X+dx,yy=Y+dy;if(xx>=0&&yy>=0&&xx<S&&yy<S&&g[yy][xx]!=='.'&&!'FGYW'.includes(g[yy][xx]))near=true;}
    if(near)px(X,Y,P.o);}
  return c;
}
const _spritesHA=sprites;
sprites=function(id){
  if(SPR[id])return SPR[id];
  if(!HAD[id])return _spritesHA(id);
  const front=buildRoster(id,false),back=buildRoster(id,true);
  const [ic,ig]=mkCanvas(28,28);ig.drawImage(front,0,0,28,28);
  return SPR[id]={front,back,icon:ic};
};
// ---- 1 FLICKIT: small ember serpent, coiled, hooded ----
HAD[1]={pal:{body:'#e8582a',belly:'#ffe6a8',acc:'#ffc43a',wing:'#a83a20'},face:1,draw(d){
  d.part(false);d.tube([[35,22,1],[34,27,1.6],[31,32,2.8],[25,34,3.7],[17,34,4.1],[10,31,3.9],[8,26,3.6],[12,22,3.4],[19,20,3.3],[23,16,3.2],[23,12,3.4]],'2');
  d.part(false);d.poly([[16,8],[9,3],[11,9],[7,12],[12,13],[16,14]],'a');d.poly([[28,8],[35,3],[33,9],[37,12],[32,13],[28,14]],'a');
  d.part();d.ell(22,9,6.6,5,'2');d.ell(22,12,4.6,3,'2');
  d.part(false);for(let y=14;y<=22;y+=2){d.rect(20,y,5,1,'c');d.rect(20,y+1,5,1,'d');}
  for(let x=13;x<=28;x+=3)d.rect(x,31,2,3,'c');
  d.dots([[35,24],[34,28],[31,32],[25,34],[17,34],[10,31],[8,26],[12,22]],4,'a');
  d.rect(21,3,2,2,'h');
  d.flame(33,15);
},over(d){d.eye(18,8);d.eye(24,8);d.px(21,12,'k');d.px(23,12,'k');d.line(20,13,25,13,'k');}};

const SH2={'2':['3','1'],c:['C','d'],m:['M','n'],a:['B','A'],y:['z','x']};
// ---- 2 BLAZEFANG: upright drake servant, horns, claws, wing nubs, tail flame ----
HAD[2]={pal:{body:'#d8481e',belly:'#ffe2a0',acc:'#ffc43a',wing:'#8a2c24'},face:1,draw(d){
  d.part(false);d.tube([[24,31,3],[30,34,2.6],[35,31,2],[36,26,1.4]],'2');
  d.part(false);d.poly([[14,17],[6,9],[9,17],[5,21],[11,23],[15,22]],'m');d.poly([[26,17],[34,9],[31,17],[35,21],[29,23],[25,22]],'m');
  d.part();d.ell(15,33,4.2,4.5,'2');d.ell(25,33,4.2,4.5,'2');
  d.part();d.ell(20,24,7.5,8.5,'2');
  d.part(false);d.ell(20,25,4.2,6.5,'c');for(let y=21;y<=30;y+=3)d.rect(16,y,9,1,'d');
  d.part();d.ell(12,23,2.6,4.2,'2');d.ell(28,23,2.6,4.2,'2');
  d.part(false);for(const x of [9,11,13])d.px(x,27,'h');for(const x of [26,28,30])d.px(x,27,'h');
  d.part();d.ell(20,10,6.6,5.5,'2');d.part(false);d.ell(20,13,4.3,2.8,'c');
  d.part(false);d.sym(()=>{d.line(15,6,10,1,'h');d.line(16,6,11,1,'h');});d.rect(19,3,2,2,'a');
  d.part(false);for(const x of [12,14,16,24,26,28])d.px(x,37,'h');
  d.flame(33,19);
},over(d){d.eye(16,9);d.eye(22,9);d.line(15,8,18,9,'k');d.line(25,8,22,9,'k');d.px(19,12,'k');d.px(21,12,'k');d.line(18,14,22,14,'k');}};
// ---- 16 PYROVANE: full winged dragon, flame mane, tail flame ----
HAD[16]={pal:{body:'#c8381c',belly:'#ffd890',acc:'#ffc43a',wing:'#7a2230'},face:1,draw(d){
  d.sym(()=>{d.part(false);d.poly([[14,17],[5,6],[1,14],[3,15],[2,21],[6,22],[6,27],[11,26],[14,24]],'m');
    d.line(5,6,1,14,'n');d.line(5,6,2,21,'n');d.line(5,6,6,27,'n');d.line(5,6,14,17,'n');d.line(6,6,14,18,'n');});
  d.part(false);d.tube([[24,30,3.2],[30,34,2.8],[35,32,2.2],[37,27,1.5]],'2');
  d.part();d.ell(15,34,4.2,4.2,'2');d.ell(25,34,4.2,4.2,'2');
  d.part();d.ell(20,23,6.8,9,'2');
  d.part(false);d.ell(20,24,3.8,7,'c');for(let y=18;y<=30;y+=3)d.rect(17,y,7,1,'d');
  d.part();d.ell(12.5,22,2.4,4,'2');d.ell(27.5,22,2.4,4,'2');
  d.part();d.tube([[20,17,3.2],[20,12,3]],'2');
  d.part(false);d.stamp(8,10,['..F.','.FGF','FGYG','.FGF'],false);d.stamp(28,10,['..F.','.FGF','FGYG','.FGF'],true);
  d.part();d.ell(20,8,5.4,4.6,'2');d.part(false);d.ell(20,11,3.4,2.4,'c');
  d.part(false);d.sym(()=>{d.line(16,5,10,1,'h');d.line(16,6,10,2,'h');d.line(15,7,11,5,'h');});d.rect(19,2,2,3,'a');
  d.part(false);for(const x of [12,14,16,24,26,28])d.px(x,38,'h');
  d.flame(34,20);d.stamp(36,17,['.F.','FGF','.F.']);
},over(d){d.eye(16,7);d.eye(22,7);d.line(15,6,18,7,'k');d.line(25,6,22,7,'k');d.px(19,11,'k');d.px(21,11,'k');}};
// ---- 3 SPROUTLE: squat four-legged seed-pod critter ----
HAD[3]={pal:{body:'#78b84a',belly:'#f0eca8',acc:'#c8764a',extra:'#4cb04a'},face:1,shade:SH2,draw(d){
  d.part(false);for(const x of [11,18,26,32])d.ell(x,36,2.7,2.5,'2');
  d.part();d.ell(22,30,10.5,6,'2');
  d.part(false);d.poly([[32,29],[37,26],[36,31]],'y');
  d.part();d.ell(26,24,6.6,6.6,'a');d.part(false);d.line(23,19,23,29,'A');d.line(26,18,26,30,'A');d.line(29,19,29,29,'A');
  d.part(false);d.poly([[26,18],[19,10],[24,9],[27,15]],'y');d.poly([[27,18],[33,8],[36,12],[30,17]],'y');
  d.part();d.ell(13,25,6.6,5.6,'2');d.part(false);d.ell(9,27,3.3,2.6,'c');
  d.part(false);d.poly([[12,20],[9,14],[16,19]],'y');
},over(d){d.eye(10,23);d.eye(16,23);d.px(7,27,'k');d.line(9,29,12,29,'k');}};
// ---- 4 THORNBLOOM: big low quadruped, giant flower bloom, thorn spines ----
HAD[4]={pal:{body:'#3f9a40',belly:'#e6e29a',acc:'#e8507c',extra:'#86d058'},face:1,shade:SH2,draw(d){
  d.part(false);for(const x of [9,17,27,34])d.ell(x,35,3.6,3.4,'2');
  d.part(false);d.tube([[34,27,1.8],[38,23,1.2]],'2');d.poly([[36,24],[39,19],[38,25]],'y');
  d.part();d.ell(22,27,13.6,7.6,'2');
  d.part(false);for(let x=13;x<=31;x+=4)d.poly([[x,21],[x+1.5,16],[x+3,21]],'A');
  d.part(false);d.ell(24,13,3.2,3.2,'a');d.ell(29,15,3.2,3.2,'a');d.ell(27,20,3.2,3.2,'a');d.ell(21,20,3.2,3.2,'a');d.ell(19,15,3.2,3.2,'a');d.part(false);d.ell(24,16,2.6,2.6,'Y');
  d.part();d.ell(9,22,7,6.4,'2');d.part(false);d.ell(4,25,3.6,3,'c');d.px(3,28,'w');d.px(4,28,'w');
  d.part(false);d.poly([[9,16],[6,8],[13,14]],'y');
},over(d){d.eye(8,20);d.line(6,19,11,19,'k');d.px(2,24,'k');d.line(4,29,9,28,'k');}};
// ---- 5 DRIBBO: tadpole-droplet with a fin tail ----
HAD[5]={pal:{body:'#3b86e0',belly:'#cfe9ff',acc:'#7cc8ff',wing:'#6cb4f0'},face:1,draw(d){
  d.part(false);d.tube([[27,28,2.8],[32,25,2.2],[35,19,1.6],[33,13,1.2]],'2');d.poly([[34,20],[38,14],[35,8],[31,14]],'m');
  d.part(false);d.poly([[19,8],[15,17],[23,17]],'2');
  d.part();d.ell(19,25,10,9.4,'2');
  d.part(false);d.ell(18,30,6.5,4.6,'c');
  d.part();d.ell(10,29,2.3,3.4,'2');d.ell(28,30,2.3,3.4,'2');
  d.part(false);for(const [x,y] of [[6,10],[10,6],[30,33]])d.stamp(x,y,['.w.','w.w','.w.']);
},over(d){d.ell(14,22,3.3,3.5,'w');d.ell(24,22,3.3,3.5,'w');d.rect(14,22,3,3,'e');d.rect(23,22,3,3,'e');d.px(14,22,'w');d.px(23,22,'w');d.line(16,28,22,28,'k');d.px(15,27,'k');d.px(23,27,'k');d.stamp(11,17,['.h','hh']);}};
// ---- 6 TORRENTOAD: heavy wide toad with eye bumps and throat sac ----
HAD[6]={pal:{body:'#2e66c8',belly:'#d8ecff',acc:'#7ee0ff'},face:1,draw(d){
  d.part(false);d.ell(8,37,5,2,'2');d.ell(32,37,5,2,'2');
  d.part();d.ell(20,29,16,9,'2');
  d.part();d.ell(8,30,4.2,6.5,'2');d.ell(32,30,4.2,6.5,'2');
  d.part(false);d.ell(20,30,8,5,'c');for(const y of [28,31])d.rect(14,y,13,1,'d');
  d.part();d.ell(20,19,12.5,8,'2');
  d.part();d.ell(12,11,4,3.6,'2');d.ell(28,11,4,3.6,'2');
  d.part(false);d.ell(12,11,2.6,2.6,'w');d.ell(28,11,2.6,2.6,'w');d.rect(12,11,2,2,'e');d.rect(27,11,2,2,'e');
  d.part(false);d.stamp(15,3,['.a.','aBa','.a.']);d.stamp(24,3,['.a.','aBa','.a.']);
},over(d){d.line(9,20,13,23,'k');d.line(13,23,27,23,'k');d.line(27,23,31,20,'k');d.px(18,16,'k');d.px(22,16,'k');for(const [x,y] of [[14,15],[26,16],[10,27],[30,26]])d.px(x,y,'A');for(const x of [4,7,10,29,32,35])d.px(x,38,'q');}};
// ---- 7 CHIRPA: tiny round chick ----
HAD[7]={pal:{body:'#f4c83c',belly:'#fff4c0',acc:'#f08a2a'},face:1,draw(d){
  d.part(false);for(const x of [14,16,22,24])d.px(x,37,'a');d.rect(15,35,2,2,'a');d.rect(23,35,2,2,'a');d.rect(13,37,3,1,'a');d.rect(17,37,2,1,'a');d.rect(22,37,3,1,'a');d.rect(26,37,2,1,'a');
  d.part();d.ell(20,28,9.6,9,'2');
  d.part(false);d.ell(20,32,5.6,4.4,'c');
  d.part();d.ell(10.5,29,2.5,4,'2');d.ell(29.5,29,2.5,4,'2');
  d.part(false);d.poly([[18,19],[17,13],[20,17]],'2');d.poly([[20,18],[20,10],[22,18]],'2');d.poly([[22,19],[25,13],[23,17]],'2');
  d.part();d.poly([[18,26],[22,26],[20,30]],'a');
},over(d){d.eye(14,22);d.eye(24,22);d.px(12,26,'a');d.px(27,26,'a');}};
// ---- 8 GUSTWING: slender raptor with wide spread wings ----
HAD[8]={pal:{body:'#7a8fd8',belly:'#f2eee0',acc:'#f2b630',wing:'#5b6fb8'},face:1,draw(d){
  d.sym(()=>{d.part(false);d.poly([[16,14],[8,9],[2,8],[1,12],[5,13],[3,17],[8,18],[7,22],[13,21],[16,19]],'m');d.line(16,15,3,10,'n');d.line(16,17,4,16,'n');d.line(16,19,8,21,'n');});
  d.part(false);d.poly([[18,26],[22,26],[24,36],[20,38],[16,36]],'m');
  d.part(false);d.rect(17,28,2,7,'a');d.rect(21,28,2,7,'a');d.rect(15,35,5,1,'a');d.rect(20,35,5,1,'a');
  d.part();d.ell(20,20,5.2,7.5,'2');d.part(false);d.ell(20,22,3,5.5,'c');
  d.part(false);d.rect(17,13,6,2,'c');
  d.part();d.ell(20,9,4.8,4.4,'2');
  d.part(false);d.sym(()=>{d.poly([[17,6],[14,1],[19,5]],'a');});
  d.part();d.stamp(18,10,['aaaa','.aaa','..aA']);
},over(d){d.eye(16,8);d.eye(22,8);d.line(15,7,18,8,'k');d.line(25,7,22,8,'k');}};
// ---- 9 NIBBIT: upright rodent with huge ears and buck teeth ----
HAD[9]={pal:{body:'#c49a6c',belly:'#f6ead2',acc:'#f0a0a8'},face:1,draw(d){
  d.part(false);d.tube([[27,33,1.7],[32,33,1.7],[34,29,1.7],[32,25,1.8]],'2');d.ell(32,24,2.6,2.6,'c');
  d.part(false);d.ell(15,37,4.5,2,'2');d.ell(25,37,4.5,2,'2');
  d.part();d.ell(20,29,7.6,8,'2');d.part(false);d.ell(20,31,4.5,5.5,'c');
  d.part();d.ell(12.5,28,2,3.5,'2');d.ell(27.5,28,2,3.5,'2');
  d.part(false);d.sym(()=>{d.ell(13,8,3.6,7,'2');});d.sym(()=>{d.ell(13,9,1.8,5,'a');});
  d.part();d.ell(20,17,7,6,'2');d.part(false);d.ell(14.5,19,2.6,2,'c');d.ell(25.5,19,2.6,2,'c');
},over(d){d.eye(15,15);d.eye(23,15);d.px(19,19,'k');d.px(20,19,'k');d.stamp(19,20,['ww','ww']);for(const y of [19,21])d.px(10,y,'q');}};
// ---- 10 MOTHLET: horizontal larva with stripes and feelers ----
HAD[10]={pal:{body:'#f0e6c8',belly:'#ffffff',acc:'#9a86e0'},face:1,draw(d){
  d.part(false);for(const x of [8,15,22,29,35])d.rect(x-1,36,2,2,'1');
  d.part(false);d.ell(35,33,3.6,4,'2');
  d.part();d.ell(29,31,5,5.5,'2');d.part(false);d.line(29,27,29,35,'a');
  d.part();d.ell(22,30,5.6,6,'2');d.part(false);d.line(22,25,22,35,'a');
  d.part();d.ell(15,29,6,6.5,'2');d.part(false);d.line(15,24,15,35,'a');
  d.part();d.ell(8,26,6.6,6.6,'2');
  d.part(false);d.line(6,20,3,13,'1');d.line(10,20,13,13,'1');d.ell(3,12,1.6,1.6,'a');d.ell(13,12,1.6,1.6,'a');
},over(d){d.eye(4,24);d.eye(9,24);d.line(5,29,9,29,'k');d.px(35,31,'a');d.px(35,34,'a');}};
// ---- 11 LUNAMOTH: big moth, huge eye-spot wings ----
HAD[11]={pal:{body:'#d8d0f4',belly:'#f4f0ff',acc:'#f2d85a',wing:'#8a82d8'},face:1,draw(d){
  d.sym(()=>{d.part(false);d.poly([[19,15],[10,5],[2,3],[1,12],[5,19],[12,21],[19,19]],'m');d.poly([[19,19],[12,22],[6,29],[9,36],[16,35],[19,28]],'m');
    d.part(false);d.ell(7,11,3.4,3.4,'a');d.ell(12,30,2.6,2.6,'a');d.line(19,16,3,6,'n');d.line(19,20,8,33,'n');});
  d.part();d.ell(20,17,3,5,'2');d.part(false);d.ell(20,27,2.5,7,'c');for(const y of [24,27,30])d.rect(18,y,5,1,'d');
  d.part();d.ell(20,10,3.8,3.3,'2');
  d.part(false);d.sym(()=>{d.line(18,8,14,2,'1');for(const [x,y] of [[13,3],[15,4],[14,5]])d.px(x,y,'B');});
},over(d){d.sym(()=>{d.ell(7,11,1.6,1.6,'e');d.ell(12,30,1,1,'e');});d.rect(18,9,2,2,'e');d.rect(21,9,2,2,'e');}};

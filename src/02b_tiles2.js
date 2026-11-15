// ---------- GBA-style terrain: overlapping tree sprites, auto-edged path & water ----------
function cfill(g,cx,cy,r,col){g.fillStyle=col;for(let y=-r;y<=r;y++)for(let x=-r;x<=r;x++)if(x*x+y*y<=r*r+r*.6)g.fillRect(cx+x,cy+y,1,1);}
function treeSprite(v){
  const o=v?'#12382c':'#17402a',b=v?'#2b7e4c':'#3a9a40',l=v?'#62bc6c':'#8ad860',sh=v?'#1b5a3c':'#226c34';
  const [c,g]=mkCanvas(16,24);
  g.fillStyle='rgba(0,0,0,.22)';g.fillRect(3,22,10,2);g.fillRect(2,23,12,1);
  R_(g,6,16,4,7,'#2a1a10');R_(g,7,16,2,7,'#7a5030');R_(g,7,16,1,7,'#a8743c');R_(g,6,22,4,1,'#2a1a10');
  const C=[[8,6,6],[5,11,5],[11,11,5],[8,13,5],[3,15,3],[13,15,3]];
  for(const [cx,cy,r] of C){
    cfill(g,cx,cy,r+1,o);
    for(let y=-r;y<=r;y++)for(let x=-r;x<=r;x++){
      if(x*x+y*y>r*r+r*.6)continue;
      const d2=(x+1.4)**2+(y+1.4)**2,hl=(x+2)**2+(y+2)**2;
      g.fillStyle=hl<(r*.55)**2?l:d2>r*r+r*.4?sh:b;g.fillRect(cx+x,cy+y,1,1);
    }
  }
  return c;
}
const TREES=[treeSprite(0),treeSprite(1)];
// cliff + bridge
def('q',1,g=>{R_(g,0,0,16,16,'#b48c54');R_(g,0,0,16,3,'#d8b47c');R_(g,0,3,16,1,'#6b4a28');for(const y of [7,11]){R_(g,0,y,16,1,'#8c6838');R_(g,(y*3)%9+2,y-3,1,3,'#8c6838');R_(g,(y*5)%7+9,y-3,1,3,'#8c6838');}R_(g,0,13,16,3,'#8c6838');R_(g,0,15,16,1,'#4a3018');});
def('b',0,g=>{R_(g,0,0,16,16,'#3a78d8');R_(g,1,0,14,16,'#cc9a5a');for(const y of [3,7,11,15]){R_(g,1,y,14,1,'#a87438');}for(const y of [1,5,9,13]){R_(g,1,y,14,1,'#e0b474');}R_(g,0,0,2,16,'#5a3a1c');R_(g,14,0,2,16,'#5a3a1c');R_(g,0,0,1,16,'#8a5c30');R_(g,14,0,1,16,'#8a5c30');});
for(const ch of ['#','f','"','q','b'])TI[ch]=Array.from({length:TILE_DEF[ch].frames},(_,f)=>{const [c,g]=mkCanvas(16,16);TILE_DEF[ch].fn(g,f);return c;});
// rebuild tiles that bake grass underneath
for(const ch of ['.','-','S','r'])TI[ch]=[(()=>{const [c,g]=mkCanvas(16,16);TILE_DEF[ch].fn(g,0);return c;})()];
// ---- neighbour-aware variants ----
function nbMask(m,x,y,pred){
  let k=0;const t=(dx,dy)=>{const xx=x+dx,yy=y+dy;if(xx<0||yy<0||xx>=m.w||yy>=m.h)return true;return pred(m.t[yy][xx]);};
  if(t(0,-1))k|=1;if(t(1,0))k|=2;if(t(0,1))k|=4;if(t(-1,0))k|=8;if(t(1,-1))k|=16;if(t(1,1))k|=32;if(t(-1,1))k|=64;if(t(-1,-1))k|=128;return k;
}
const isPathCh=c=>c==='='||c===':'||c==='D';
const isWaterCh=c=>c==='~'||c==='b';
const VCACHE={};
function pathVariant(mk){
  const key='p'+mk;if(VCACHE[key])return VCACHE[key];
  const [c,g]=mkCanvas(16,16);grassBase(g);
  const [lc,l]=mkCanvas(16,16);
  const N=mk&1,E=mk&2,S=mk&4,Wm=mk&8;
  const L=Wm?0:2,T_=N?0:2,Rr=E?0:2,B=S?0:2,w=16-L-Rr,h=16-T_-B;
  R_(l,L,T_,w,h,'#ecd9a2');
  for(const [x,y] of [[3,4],[10,3],[6,10],[12,11],[4,13]])R_(l,x,y,2,1,'#d6bb7c');
  for(const [x,y] of [[7,6],[13,7],[2,9],[9,13]])P_(l,x,y,'#f8eecb');
  const ed='#b8955a',rim='#f8f0cc';
  if(!N){R_(l,L,T_,w,1,ed);R_(l,L,T_+1,w,1,rim);}
  if(!S){R_(l,L,T_+h-1,w,1,ed);}
  if(!Wm){R_(l,L,T_,1,h,ed);R_(l,L+1,T_,1,h,rim);}
  if(!E){R_(l,L+w-1,T_,1,h,ed);}
  if(!N&&!Wm)l.clearRect(L,T_,1,1);if(!N&&!E)l.clearRect(L+w-1,T_,1,1);if(!S&&!Wm)l.clearRect(L,T_+h-1,1,1);if(!S&&!E)l.clearRect(L+w-1,T_+h-1,1,1);
  if(N&&Wm&&!(mk&128)){l.clearRect(0,0,2,2);R_(l,2,0,1,2,ed);R_(l,0,2,2,1,ed);}
  if(N&&E&&!(mk&16)){l.clearRect(14,0,2,2);R_(l,13,0,1,2,ed);R_(l,14,2,2,1,ed);}
  if(S&&Wm&&!(mk&64)){l.clearRect(0,14,2,2);R_(l,2,14,1,2,ed);R_(l,0,13,2,1,ed);}
  if(S&&E&&!(mk&32)){l.clearRect(14,14,2,2);R_(l,13,14,1,2,ed);R_(l,14,13,2,1,ed);}
  g.drawImage(lc,0,0);return VCACHE[key]=c;
}
function waterVariant(mk,f){
  const key='w'+mk+f;if(VCACHE[key])return VCACHE[key];
  const [c,g]=mkCanvas(16,16);R_(g,0,0,16,16,'#3a7cdc');
  const o=f*6;R_(g,(2+o)%12,4,4,1,'#6ea8f4');R_(g,(9+o)%12,9,4,1,'#6ea8f4');R_(g,(4+o)%11,13,5,1,'#6ea8f4');P_(g,(11+o)%16,6,'#d0ecff');P_(g,(6+o)%16,11,'#d0ecff');
  const N=mk&1,E=mk&2,S=mk&4,Wm=mk&8,dk='#1c3e90',mid='#5a98ec';
  if(!N){R_(g,0,0,16,1,dk);R_(g,0,1,16,1,mid);}
  if(!S){R_(g,0,15,16,1,dk);R_(g,0,14,16,1,mid);}
  if(!Wm){R_(g,0,0,1,16,dk);R_(g,1,0,1,16,mid);}
  if(!E){R_(g,15,0,1,16,dk);R_(g,14,0,1,16,mid);}
  if(N&&Wm&&!(mk&128)){R_(g,0,0,2,2,dk);}if(N&&E&&!(mk&16)){R_(g,14,0,2,2,dk);}
  if(S&&Wm&&!(mk&64)){R_(g,0,14,2,2,dk);}if(S&&E&&!(mk&32)){R_(g,14,14,2,2,dk);}
  return VCACHE[key]=c;
}
const ROOF_COL={'^':['#d8483c','#a43028','#f07a64'],'v':['#4a78d8','#30509c','#78a4f4'],'%':['#e48c2c','#a85a1c','#f8bc58']};
const isRoofCh=c=>c==='^'||c==='v'||c==='%';
const isWallCh=c=>'hHDCMG'.includes(c);
function roofVariant(ch,mk){
  const key='r'+ch+mk;if(VCACHE[key])return VCACHE[key];
  const [c1,c2,c3]=ROOF_COL[ch],ol='#2a2030';
  const [c,g]=mkCanvas(16,16);const N=mk&1,E=mk&2,S=mk&4,Wm=mk&8;
  R_(g,0,0,16,16,c1);
  for(let b=0;b<4;b++){const y=b*4;R_(g,0,y,16,1,c3);R_(g,0,y+3,16,1,c2);for(let x=(b%2)*4+1;x<16;x+=8)R_(g,x,y+1,1,2,c2);}
  if(!N){R_(g,0,0,16,3,c1);R_(g,0,0,16,1,ol);R_(g,0,1,16,1,c3);R_(g,0,2,16,1,c3);R_(g,0,3,16,1,c2);}
  if(!S){R_(g,0,11,16,1,c2);R_(g,0,12,16,2,c1);R_(g,0,13,16,1,c2);R_(g,0,14,16,2,ol);}
  if(!Wm){R_(g,0,0,1,16,ol);R_(g,1,N?0:2,1,S?16:13,c3);}
  if(!E){R_(g,15,0,1,16,ol);R_(g,14,N?0:2,1,S?16:13,c2);}
  if(!N&&!Wm){g.clearRect(0,0,1,1);P_(g,1,1,ol);}if(!N&&!E){g.clearRect(15,0,1,1);P_(g,14,1,ol);}
  return VCACHE[key]=c;
}
function wallVariant(ch,mk){
  const key='w'+ch+mk;if(VCACHE[key])return VCACHE[key];
  const [c,g]=mkCanvas(16,16);g.drawImage(TI[ch][0],0,0);
  const N=mk&1,E=mk&2,Wm=mk&8;
  if(N){R_(g,0,0,16,1,'rgba(40,20,20,.38)');R_(g,0,1,16,1,'rgba(40,20,20,.24)');R_(g,0,2,16,1,'rgba(40,20,20,.12)');}
  if(!Wm){R_(g,0,0,1,16,'#8a7650');R_(g,1,0,1,16,'#fff8e0');}
  if(!E){R_(g,15,0,1,16,'#8a7650');R_(g,14,0,1,16,'#d8c8a0');}
  return VCACHE[key]=c;
}
function tileImg(m,x,y,f){
  const ch=m.t[y][x];
  if(ch==='=')return pathVariant(nbMask(m,x,y,isPathCh));
  if(ch==='~')return waterVariant(nbMask(m,x,y,isWaterCh),f);
  if(isRoofCh(ch))return roofVariant(ch,nbMask(m,x,y,c=>c===ch)&15);
  if(isWallCh(ch)){let k=0;const at=(dx,dy)=>{const xx=x+dx,yy=y+dy;return(xx<0||yy<0||xx>=m.w||yy>=m.h)?' ':m.t[yy][xx];};
    if(isRoofCh(at(0,-1)))k|=1;if(!isWallCh(at(1,0)))k|=2;if(!isWallCh(at(-1,0)))k|=8;return wallVariant(ch,k);}
  const t=TI[ch]||TI['.'];return t[t.length>1?f:0];
}

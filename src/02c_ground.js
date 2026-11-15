// ---------- ground families, hash-picked grass variants, sand ----------
function H2(x,y,s){let n=(Math.imul(x|0,0x27d4eb2d)^Math.imul(y|0,0x165667b1)^Math.imul(s|0,0x9e3779b1))>>>0;
  n=Math.imul(n^(n>>>15),0x85ebca6b);n=Math.imul(n^(n>>>13),0xc2b2ae35);return((n^(n>>>16))>>>0)/4294967296;}
const _ss=t=>t*t*(3-2*t);
function VN(x,y,s){const xi=Math.floor(x),yi=Math.floor(y),fx=_ss(x-xi),fy=_ss(y-yi);
  const a=H2(xi,yi,s),b=H2(xi+1,yi,s),c=H2(xi,yi+1,s),d=H2(xi+1,yi+1,s);
  return a+(b-a)*fx+((c+(d-c)*fx)-(a+(b-a)*fx))*fy;}
function addTile(ch,solid,fn){TILE_DEF[ch]={solid,fn,frames:1};const [c,g]=mkCanvas(16,16);fn(g,0);TI[ch]=[c];}
// grass families: [base, shadow, mid, light]
const GF={
  '.':['#6ec85a','#58b048','#7fd668','#98e676'],
  ',':['#55b04c','#3d9444','#66c058','#82d468'],   // lush / forest-floor grass
  'y':['#a6d058','#8cb840','#b6dc66','#cfe888']    // dry meadow grass
};
function tuft(g,x,y,F){P_(g,x,y,F[1]);P_(g,x+2,y,F[1]);P_(g,x+1,y-1,F[2]);P_(g,x+1,y,F[1]);P_(g,x+1,y-2,F[3]);}
function grassVar(fam,k,mir){
  const key='g'+fam+k+(mir?'m':'');if(VCACHE[key])return VCACHE[key];
  const F=GF[fam],[c,g]=mkCanvas(16,16);R_(g,0,0,16,16,F[0]);
  const pos={0:[[2,3],[11,9]],1:[[3,4],[10,11],[13,2]],2:[[6,6],[1,12],[12,5]],3:[],4:[[2,9],[9,3]]}[k];
  if(k===0){for(const [x,y] of [[4,2],[12,7],[7,12]]){P_(g,x,y,F[1]);P_(g,x+1,y,F[1]);}}
  if(k===1||k===2)for(const [x,y] of pos)tuft(g,x,y,F);
  if(k===3){for(const [x,y] of [[2,2],[9,1],[13,6],[5,8],[11,12],[3,13],[8,6]])P_(g,x,y,F[3]);for(const [x,y] of [[6,4],[12,10]]){P_(g,x,y,F[1]);P_(g,x+1,y,F[1]);}}
  if(k===4){R_(g,3,8,4,3,F[1]);R_(g,4,8,2,1,F[0]);for(const [x,y] of pos)tuft(g,x,y,F);P_(g,8,13,F[1]);P_(g,9,13,F[1]);}
  if(fam==='y')for(const [x,y] of [[5,5],[13,12]])P_(g,x,y,'#d8c070');
  if(mir){const [c2,g2]=mkCanvas(16,16);g2.translate(16,0);g2.scale(-1,1);g2.drawImage(c,0,0);return VCACHE[key]=c2;}
  return VCACHE[key]=c;
}
const FLW=['#ffffff','#ffe35a','#f07aa8','#78a0f0'];
function withFlowers(base,x,y,c,two,key){
  const k2=key;if(VCACHE[k2])return VCACHE[k2];
  const [cv,g]=mkCanvas(16,16);g.drawImage(base,0,0);
  const sp=two?[[4,5],[11,10]]:[[8,7]];sp.forEach(([fx,fy],i)=>{const col=FLW[(c+i*(two?2:0))%4];flower(g,fx,fy,col);});
  return VCACHE[k2]=cv;
}
// pick a ground tile for a map cell: noise chooses patch type, hash chooses variant
function groundTile(ch,x,y,m){
  const sd=m.seed||7;
  if(ch==='f'){const b=grassVar('.',0,H2(x,y,sd)<.5);return withFlowers(b,0,0,(H2(x,y,sd+9)*4)|0,H2(x,y,sd+8)<.5,'F'+(((H2(x,y,sd+9)*4)|0))+(H2(x,y,sd+8)<.5?'2':'1')+(H2(x,y,sd)<.5?'m':''));}
  const fam=ch;
  const patch=VN(x/6,y/6,sd+11)*.75+VN(x/2.5,y/2.5,sd+12)*.25,r=H2(x,y,sd+2),mir=H2(x,y,sd+6)<.5;
  let k;
  if(patch>.62)k=r<.45?4:r<.8?1:2;
  else if(patch<.34)k=r<.8?0:3;
  else k=r<.6?0:r<.78?1:r<.9?2:3;
  if(fam==='.'&&VN(x/4.5,y/4.5,sd+3)>.72&&H2(x,y,sd+4)<.32){   // flower drift
    const fk=(H2(x,y,sd+5)*4)|0,two=H2(x,y,sd+13)<.35;
    return withFlowers(grassVar(fam,k===4?0:k,mir),0,0,fk,two,'Fv'+k+fk+(two?2:1)+(mir?'m':''));
  }
  return grassVar(fam,k,mir);
}
// extra ground types
addTile(',',0,g=>g.drawImage(grassVar(',',0),0,0));
addTile('y',0,g=>g.drawImage(grassVar('y',0),0,0));
addTile('*',0,g=>{R_(g,0,0,16,16,'#2b7a48');   // deep tall grass (also wild encounters)
  for(let r=0;r<4;r++)for(let c=0;c<4;c++){const x=c*4+(r%2)*2,y=r*4;R_(g,x,y+3,2,1,'#154a2c');R_(g,x,y,1,3,'#4cb85c');R_(g,x+2,y-1,1,4,'#4cb85c');P_(g,x,y,'#b8f09c');P_(g,x+2,y-1,'#b8f09c');}});
addTile('n',0,g=>R_(g,0,0,16,16,'#f4e4b0'));
const isSandCh=c=>c==='n';
function sandVariant(mk){
  const key='s'+mk;if(VCACHE[key])return VCACHE[key];
  const [c,g]=mkCanvas(16,16);g.drawImage(grassVar('.',0),0,0);
  const [lc,l]=mkCanvas(16,16);const N=mk&1,E=mk&2,S=mk&4,Wm=mk&8;
  const L=Wm?0:1,T_=N?0:1,Rr=E?0:1,B=S?0:1,w=16-L-Rr,h=16-T_-B;
  R_(l,L,T_,w,h,'#f4e4b0');
  for(const [x,y] of [[2,3],[9,2],[5,9],[12,12],[3,13]])R_(l,x,y,3,1,'#e2cc8c');
  for(const [x,y] of [[7,6],[13,5],[1,10],[9,13]])P_(l,x,y,'#fff6d4');
  const ed='#cdb072';
  if(!N)R_(l,L,T_,w,1,ed);if(!S)R_(l,L,T_+h-1,w,1,ed);if(!Wm)R_(l,L,T_,1,h,ed);if(!E)R_(l,L+w-1,T_,1,h,ed);
  g.drawImage(lc,0,0);return VCACHE[key]=c;
}
const _tileImg1=tileImg;
tileImg=function(m,x,y,f){
  const ch=m.t[y][x];
  if(ch==='.'||ch==='f'||ch===','||ch==='y')return groundTile(ch,x,y,m);
  if(ch==='n')return sandVariant(nbMask(m,x,y,isSandCh)&15|0);
  if(ch==='#'){return groundTile(m.under&&m.under(x,y)||'.',x,y,m);}
  return _tileImg1(m,x,y,f);
};

// ---------- tile art (16x16, hand-placed pixels, GBA-style palette) ----------
const PAL={k:'#23302a',d:'#2d7a3a',g:'#46a845',l:'#7ed05a',y:'#b4ee82',b:'#6b4528',B:'#9a6a38',s:'#dcc088',S:'#eedcaa',w:'#ffffff',r:'#c8443c',R:'#ea6e5c',o:'#ee9a3a',p:'#e890b4',u:'#3b72d6',U:'#74a8f4',c:'#b4e0ff',e:'#8c92a0',E:'#c8ccd8',n:'#2c3866',Y:'#f4d84a',m:'#6a5a90',t:'#a67c4a',T:'#caa06a',x:'#14141c',z:'#e8e0d0'};
function mkCanvas(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');g.imageSmoothingEnabled=false;return [c,g];}
const P_=(g,x,y,c)=>{g.fillStyle=PAL[c]||c;g.fillRect(x,y,1,1);};
const R_=(g,x,y,w,h,c)=>{g.fillStyle=PAL[c]||c;g.fillRect(x,y,w,h);};
function ell(g,cx,cy,rx,ry,c){g.fillStyle=PAL[c]||c;for(let y=-ry;y<=ry;y++)for(let x=-rx;x<=rx;x++)if((x*x)/(rx*rx+.5)+(y*y)/(ry*ry+.5)<=1)g.fillRect(cx+x,cy+y,1,1);}
function art(g,rows,ox=0,oy=0){rows.forEach((r,y)=>{for(let x=0;x<r.length;x++){const ch=r[x];if(ch!=='.')P_(g,ox+x,oy+y,ch);}});}

function grassBase(g){
  R_(g,0,0,16,16,'#6ec85a');
  for(const [x,y] of [[2,3],[10,1],[13,8],[5,10],[9,14],[1,14]]){P_(g,x,y,'#58b048');P_(g,x+1,y-1,'#58b048');P_(g,x+2,y,'#58b048');P_(g,x+1,y,'#8ae068');}
}
function flower(g,x,y,c){P_(g,x,y-1,c);P_(g,x-1,y,c);P_(g,x+1,y,c);P_(g,x,y+1,c);P_(g,x,y,'Y');}
function roofTile(g,c1,c2,c3){
  R_(g,0,0,16,16,c1);
  for(let b=0;b<4;b++){const y=b*4;R_(g,0,y,16,1,c3);R_(g,0,y+3,16,1,c2);for(let x=(b%2)*4;x<16;x+=8)R_(g,x,y+1,1,2,c2);}
  R_(g,0,14,16,2,'rgba(0,0,0,.28)');
}
function wallTile(g,win){
  R_(g,0,0,16,16,'#f2e6c8');R_(g,0,5,16,1,'#e4d6b0');R_(g,0,10,16,1,'#e4d6b0');R_(g,0,13,16,3,'#c8b48a');R_(g,0,13,16,1,'#a89468');
  if(win){R_(g,3,2,10,9,'#6a4a30');R_(g,4,3,8,7,'#8cccf4');R_(g,7,3,2,7,'#6a4a30');R_(g,4,6,8,1,'#6a4a30');P_(g,5,4,'w');P_(g,6,4,'w');P_(g,10,4,'w');R_(g,2,11,12,2,'#8a6a48');}
}
function disc(g,cx,cy,r,c){ell(g,cx,cy,r,r,c);}
function floorTile(g){R_(g,0,0,16,16,'#d8aa6a');R_(g,0,0,16,1,'#b88848');R_(g,0,8,16,1,'#b88848');R_(g,5,1,1,7,'#c49858');R_(g,12,9,1,7,'#c49858');P_(g,2,4,'#e4be82');P_(g,9,12,'#e4be82');}
const TILE_DEF={};
function def(ch,solid,fn,frames=1){TILE_DEF[ch]={solid,fn,frames};}
def('.',0,g=>grassBase(g));
def('f',0,g=>{grassBase(g);for(const [x,y,c] of [[3,3,'#ffffff'],[10,2,'#f07aa8'],[7,7,'#ffe35a'],[13,8,'#ffffff'],[3,11,'#f07aa8'],[9,13,'#ffffff'],[14,14,'#ffe35a']])flower(g,x,y,c);});
def('"',0,g=>{R_(g,0,0,16,16,'#2f8c3e');
  for(let r=0;r<4;r++)for(let c=0;c<4;c++){const x=c*4+(r%2)*2,y=r*4;R_(g,x,y+3,2,1,'#1c5e2c');R_(g,x,y+1,1,2,'#5cc04c');R_(g,x+2,y,1,3,'#5cc04c');P_(g,x,y+1,'#a4ec78');P_(g,x+2,y,'#a4ec78');}});
def('=',0,g=>{R_(g,0,0,16,16,'#e6cf94');for(const [x,y] of [[2,3],[9,2],[5,9],[12,8],[3,13],[11,13]])R_(g,x,y,2,1,'#d2b676');for(const [x,y] of [[6,5],[13,4],[9,11],[1,8]])P_(g,x,y,'#f2e0b0');});
def(':',0,g=>{R_(g,0,0,16,16,'#d6d2ca');R_(g,0,7,16,1,'#b4b0a8');R_(g,0,15,16,1,'#b4b0a8');R_(g,3,0,1,7,'#b4b0a8');R_(g,11,8,1,7,'#b4b0a8');P_(g,6,3,'#ece8e0');P_(g,13,11,'#ece8e0');P_(g,1,11,'#ece8e0');});
def('~',1,(g,f)=>{R_(g,0,0,16,16,'#3a78d8');const o=f*5;R_(g,(2+o)%16,3,5,1,'#6ca6f2');R_(g,(9+o)%12,8,5,1,'#6ca6f2');R_(g,(3+o)%11,12,6,1,'#6ca6f2');P_(g,(11+o)%16,5,'#c4e4ff');P_(g,(5+o)%16,10,'#c4e4ff');},2);
def('#',1,g=>grassBase(g));
def('-',1,g=>{grassBase(g);R_(g,0,5,16,2,'#9a6a38');R_(g,0,10,16,2,'#9a6a38');R_(g,0,5,16,1,'#c89a60');R_(g,0,10,16,1,'#c89a60');for(const x of [1,12]){R_(g,x,3,3,12,'#b07c48');R_(g,x,3,3,1,'#d8a870');R_(g,x+2,4,1,11,'#6b4528');}R_(g,0,14,16,1,'rgba(0,0,0,.2)');});
def('S',1,g=>{grassBase(g);R_(g,7,9,2,6,'#6b4528');R_(g,2,2,12,8,'#6b4528');R_(g,3,3,10,6,'#d8aa6a');R_(g,3,3,10,1,'#eec890');R_(g,4,5,8,1,'#8a5a30');R_(g,4,7,6,1,'#8a5a30');});
def('r',1,g=>{grassBase(g);ell(g,8,10,7,5,'k');ell(g,8,10,6,4,'e');ell(g,6,8,3,2,'E');R_(g,9,11,4,1,'#6c7280');P_(g,10,12,'#6c7280');});
def('^',1,g=>roofTile(g,'#d0483c','#a4342c','#ea6a58'));
def('v',1,g=>roofTile(g,'#4a74d0','#34509c','#6c98ec'));
def('%',1,g=>roofTile(g,'#e08a2c','#a85c1c','#f4b04c'));
def('h',1,g=>wallTile(g,0));
def('H',1,g=>wallTile(g,1));
def('D',0,g=>{wallTile(g,0);R_(g,2,2,12,14,'#4a2c1c');R_(g,3,3,10,13,'#a46a38');R_(g,3,3,10,1,'#c88c50');R_(g,4,5,3,4,'#8a5428');R_(g,9,5,3,4,'#8a5428');R_(g,4,10,3,5,'#8a5428');R_(g,9,10,3,5,'#8a5428');P_(g,10,9,'Y');R_(g,1,15,14,1,'#8c8c98');});
def('C',1,g=>{wallTile(g,0);disc(g,8,7,5,'k');disc(g,8,7,4,'w');R_(g,7,4,2,7,'#e04848');R_(g,5,6,6,2,'#e04848');});
def('M',1,g=>{wallTile(g,0);disc(g,8,7,5,'k');disc(g,8,7,4,'#4a74d0');R_(g,5,5,1,5,'w');R_(g,10,5,1,5,'w');P_(g,6,6,'w');P_(g,7,7,'w');P_(g,8,7,'w');P_(g,9,6,'w');});
def('G',1,g=>{wallTile(g,0);disc(g,8,7,5,'k');disc(g,8,7,4,'#e08a2c');R_(g,7,3,2,2,'#fff4b0');R_(g,6,5,4,3,'#fff4b0');R_(g,7,8,2,1,'#fff4b0');});
// interiors
def('_',0,g=>floorTile(g));
def('J',0,g=>{R_(g,0,0,16,16,'#bcb4a8');R_(g,0,0,8,8,'#a8a094');R_(g,8,8,8,8,'#a8a094');R_(g,0,0,16,1,'#cec8bc');R_(g,0,8,16,1,'#cec8bc');});
def('W',1,g=>{R_(g,0,0,16,16,'#f0e4c4');for(let y=1;y<10;y+=4)for(let x=(y>>2&1)*4;x<16;x+=8)P_(g,x+1,y+1,'#e0d0a8');R_(g,0,10,16,1,'#b89c6c');R_(g,0,11,16,5,'#9a6a38');R_(g,0,11,16,1,'#c08c58');R_(g,0,15,16,1,'#6b4528');});
def('R',0,g=>{R_(g,0,0,16,16,'#c84850');R_(g,0,0,16,1,'#b83c48');R_(g,0,8,16,1,'#b83c48');R_(g,3,3,2,2,'#f0cc70');R_(g,11,3,2,2,'#f0cc70');R_(g,3,11,2,2,'#f0cc70');R_(g,11,11,2,2,'#f0cc70');R_(g,7,7,2,2,'#e8a8a0');});
def('X',0,g=>{floorTile(g);R_(g,1,0,14,16,'#7a4a30');R_(g,2,1,12,14,'#c88458');R_(g,3,2,10,12,'#a86840');});
def('T',1,g=>{floorTile(g);R_(g,1,3,14,10,'#6b4528');R_(g,1,3,14,8,'#b8824c');R_(g,2,4,12,2,'#d8a468');R_(g,1,13,14,2,'rgba(0,0,0,.25)');});
def('K',1,g=>{R_(g,0,0,16,16,'#5a3418');R_(g,1,1,14,6,'#3a2010');R_(g,1,9,14,6,'#3a2010');const cs=['#c84848','#4878c8','#58a858','#e8c848','#8858b8'];for(const [y0,sh] of [[2,5],[10,5]])for(let i=0;i<7;i++){R_(g,2+i*2,y0+(i%3),2,sh-(i%3),cs[(i+y0)%5]);}R_(g,0,7,16,2,'#8a5a30');});
def('P',1,g=>{floorTile(g);R_(g,5,10,6,5,'#b86840');R_(g,5,10,6,1,'#d88858');ell(g,8,6,6,5,'k');ell(g,8,6,5,4,'d');ell(g,6,5,2,2,'g');P_(g,5,4,'l');P_(g,10,7,'g');});
def('N',1,g=>{floorTile(g);R_(g,0,4,16,10,'#a87840');R_(g,0,4,16,3,'#f4dca4');R_(g,0,7,16,1,'#c89c60');R_(g,0,14,16,2,'rgba(0,0,0,.25)');});
def('Q',1,g=>{floorTile(g);R_(g,0,4,16,10,'#a87840');R_(g,0,4,16,3,'#f4dca4');R_(g,3,0,10,8,'k');R_(g,4,1,8,6,'#c8ccd8');R_(g,5,2,6,2,'#58d0a8');for(let i=0;i<3;i++){R_(g,5+i*2,5,2,1,i==1?'#e04848':'#f4f4ff');}R_(g,0,14,16,2,'rgba(0,0,0,.25)');});
def('B',1,g=>{floorTile(g);R_(g,2,0,12,15,'#4a3020');R_(g,3,1,10,13,'#f4f4fc');R_(g,4,2,8,3,'#dcdcf0');R_(g,3,6,10,8,'#5878d8');R_(g,3,6,10,2,'#7898f0');R_(g,3,10,10,1,'#4060b8');});
def('Y',1,g=>{R_(g,0,0,16,16,'#7a4c28');R_(g,1,1,14,6,'#4a2c14');R_(g,1,9,14,6,'#4a2c14');const cs=['#e85858','#58b8e8','#f4d84a','#68c868'];for(const y0 of [3,11])for(let i=0;i<4;i++){R_(g,2+i*3,y0,2,3,cs[(i+y0)%4]);R_(g,2+i*3,y0,2,1,'rgba(255,255,255,.5)');}R_(g,0,7,16,2,'#a8743c');});
def('U',1,g=>{floorTile(g);R_(g,4,13,8,3,'#6c7280');R_(g,5,6,6,8,'#a0a6b4');R_(g,5,6,2,8,'#c8ccd8');R_(g,4,4,8,3,'#8c92a0');R_(g,7,0,2,2,'#ee9a3a');R_(g,6,2,4,2,'#f4d84a');});
def('1',1,g=>{def_table(g);orb(g,'#e85838','#ffb090');});
def('2',1,g=>{def_table(g);orb(g,'#48b848','#a8f090');});
def('3',1,g=>{def_table(g);orb(g,'#4888e8','#a8d0ff');});
function def_table(g){floorTile(g);R_(g,0,3,16,11,'#6b4528');R_(g,0,3,16,9,'#b8824c');R_(g,0,3,16,2,'#d8a468');R_(g,0,14,16,2,'rgba(0,0,0,.25)');}
function orb(g,c,hi){ell(g,8,7,4,4,'k');ell(g,8,7,3,3,c);R_(g,7,5,2,1,'w');P_(g,6,6,hi);R_(g,7,8,3,1,'rgba(0,0,0,.25)');}
def(' ',1,g=>R_(g,0,0,16,16,'#101018'));
const TI={};
for(const ch in TILE_DEF){const d=TILE_DEF[ch];TI[ch]=[];for(let f=0;f<d.frames;f++){const [c,g]=mkCanvas(16,16);d.fn(g,f);TI[ch].push(c);}}
const isSolid=ch=>!TILE_DEF[ch]||TILE_DEF[ch].solid;

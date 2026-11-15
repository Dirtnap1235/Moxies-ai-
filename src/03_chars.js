// ---------- character sprites (procedural, 16x16, auto outline) ----------
// dir: 0 down 1 up 2 left 3 right.  frame: 0 stand, 1/2 step
const CPAL={
  boy:{emblem:1,hat:'#d83a3a',brim:'#a82828',hair:'#4a3020',skin:'#f4c8a0',shirt:'#3a6ad8',pants:'#3a3a5a',shoe:'#f4f4f4',long:0},
  girl:{emblem:1,skirt:'#e05a8a',hat:'#f4f0f0',brim:'#c8c0d0',hair:'#7a4a28',skin:'#f4c8a0',shirt:'#e86a9a',pants:'#3a5a9a',shoe:'#f4f4f4',long:1},
  rival:{hat:'#3a3a48',brim:'#2a2a34',hair:'#d8a838',skin:'#f4c8a0',shirt:'#8a4ac8',pants:'#2a2a3a',shoe:'#e0e0e0',long:0,spiky:1},
  prof:{hat:'#d8d8e0',brim:'#d8d8e0',hair:'#d8d8e0',skin:'#e8b890',shirt:'#f4f4f4',pants:'#6a5a4a',shoe:'#4a3a2a',long:0,coat:1},
  mom:{skirt:'#8a5a9a',hat:'#a05a3a',brim:'#a05a3a',hair:'#a05a3a',skin:'#f4c8a0',shirt:'#e8c84a',pants:'#8a5a9a',shoe:'#f4f4f4',long:1},
  nurse:{skirt:'#f8b0c8',hat:'#f8b0c8',brim:'#f8b0c8',hair:'#f8b0c8',skin:'#f4c8a0',shirt:'#f4f4f4',pants:'#f8b0c8',shoe:'#e8e8e8',long:1,coat:1},
  clerk:{hat:'#3a6ad8',brim:'#2a4aa8',hair:'#4a3020',skin:'#f4c8a0',shirt:'#3a6ad8',pants:'#2a2a4a',shoe:'#e0e0e0',long:0},
  kid:{hat:'#58b858',brim:'#388838',hair:'#4a3020',skin:'#f4c8a0',shirt:'#f4d84a',pants:'#5a7ac8',shoe:'#f4f4f4',long:0},
  bug:{hat:'#a8c858',brim:'#78a038',hair:'#6a4a28',skin:'#e8b890',shirt:'#78b848',pants:'#8a7a4a',shoe:'#6a5a3a',long:0},
  lass:{skirt:'#e8688a',hat:'#e8688a',brim:'#c84868',hair:'#3a2a20',skin:'#f4c8a0',shirt:'#f4a8c0',pants:'#e0e0f0',shoe:'#f4f4f4',long:1},
  old:{hat:'#9a9aa8',brim:'#9a9aa8',hair:'#c8c8d0',skin:'#e0b088',shirt:'#8a6a4a',pants:'#5a4a3a',shoe:'#4a3a2a',long:0},
  hiker:{hat:'#8a5a2a',brim:'#6a4018',hair:'#5a3a20',skin:'#e0a878',shirt:'#c85a2a',pants:'#4a4a5a',shoe:'#3a2a1a',long:0},
  rock:{hat:'#6a6a7a',brim:'#4a4a5a',hair:'#3a3a40',skin:'#d89870',shirt:'#e08a2c',pants:'#3a3a48',shoe:'#e0e0e0',long:0},
  leader:{hat:'#e04830',brim:'#a02818',hair:'#2a1a18',skin:'#d89870',shirt:'#2a2a38',pants:'#6a2a1a',shoe:'#e0a030',long:0,coat:1},
};
const CCACHE={};
const CH=22; // character sprite height; drawn 6px above the tile top so feet sit on the tile
const _hx=h=>[1,3,5].map(i=>parseInt(h.substr(i,2),16));
const dkc=(h,f)=>'#'+_hx(h).map(v=>Math.max(0,Math.round(v*f)).toString(16).padStart(2,'0')).join('');
const ltc=(h,f)=>'#'+_hx(h).map(v=>Math.min(255,Math.round(v+(255-v)*f)).toString(16).padStart(2,'0')).join('');
// head+torso rows (1..14) per facing; '.' transparent. h hat, H brim, r hair, s skin, e eye, w emblem, t shirt, T shirt shade, P belt, p pants, b shoe
const CH_UPPER={
 0:['.....hhhhhh.....','....hhhhhhhh....','...hhhhwwhhhh...','...hhhhhhhhhh...','..HHHHHHHHHHHH..','...rssssssssr...','...rsessssesr...','...rsessssesr...','....ssssssss....','.....ssssss.....','...tttttttttt...','...tttTTTTttt...','..stttttttttts..','..sPPPPPPPPPPs..'],
 1:['.....hhhhhh.....','....hhhhhhhh....','...hhhhhhhhhh...','...hhhhhhhhhh...','...hhhhhhhhhh...','...rrrrrrrrrr...','...rrrrrrrrrr...','...rrrrrrrrrr...','....rrrrrrrr....','.....ssssss.....','...tttttttttt...','...tttTTTTttt...','..stttttttttts..','..sPPPPPPPPPPs..'],
 2:['....hhhhhhh.....','...hhhhhhhhh....','..hhhhhhhhhhh...','..hhhhhhhhhhh...','.HHHHHHHHHHH....','..sssssrrrrr....','..sessrrrrrr....','.ssessrrrrrr....','..sssssrrrr.....','....sssss.......','...tttttttt.....','...ttTTTttt.....','...ttTTTttt.....','...PPsssPPP.....']
};
// legs rows 15..20 per facing & frame (0 stand, 1/2 step)
const CH_LEGS={
 0:{0:['...pppppppppp...','....ppp..ppp....','....ppp..ppp....','....ppp..ppp....','...bbbb..bbbb...','...bbbb..bbbb...'],
    1:['...pppppppppp...','....ppp..ppp....','....ppp..ppp....','...bbbb..ppp....','...bbbb..bbbb...','.........bbbb...'],
    2:['...pppppppppp...','....ppp..ppp....','....ppp..ppp....','....ppp..bbbb...','...bbbb..bbbb...','...bbbb.........']},
 2:{0:['...pppppppp.....','....pppppp......','....pppppp......','....pppppp......','...bbbbbbb......','...bbbbbbb......'],
    1:['...pppppppp.....','...ppp..ppp.....','...ppp..ppp.....','..bbbb..pppp....','..bbbb..bbbb....','................'],
    2:['...pppppppp.....','....ppp..ppp....','....ppp..ppp....','....pppp.bbbb...','...bbbb.........','...bbbb.........']}
};
CH_LEGS[1]=CH_LEGS[0];
function charSprite(pk,dir,fr){
  const key=pk+dir+fr;if(CCACHE[key])return CCACHE[key];
  const p=CPAL[pk]||CPAL.kid;
  const face=dir===3?2:dir;
  const rows=CH_UPPER[face].concat(CH_LEGS[face===2?2:0][fr]);
  const grid=Array.from({length:CH},()=>Array(16).fill(null));
  const col={h:p.hat,H:p.brim,r:p.hair,s:p.skin,e:'#20202c',w:p.emblem?'#f8f8f8':p.hat,t:p.shirt,T:dkc(p.shirt,.8),P:p.belt||dkc(p.pants,.7),p:p.pants,b:p.shoe};
  rows.forEach((r,j)=>{for(let x=0;x<16;x++){const c=r[x];if(c&&c!=='.')grid[j+1][x]=col[c];}});
  const set=(x,y,c)=>{if(x>=0&&x<16&&y>=0&&y<CH)grid[y][x]=c;};
  const bob=(fr&&face!==2)?0:0;
  if(p.long){ // long hair falls past the shoulders
    if(face===0){for(let y=6;y<=12;y++){set(3,y,p.hair);set(12,y,p.hair);}}
    else if(face===1){for(let y=9;y<=12;y++)for(let x=4;x<=11;x++)set(x,y,p.hair);for(let y=6;y<=8;y++){set(3,y,p.hair);set(12,y,p.hair);}}
    else{for(let y=7;y<=12;y++)for(let x=7;x<=10;x++)set(x,y,p.hair);}
  }
  if(p.coat){const cc='#eef0f6',cs='#c8ccd8';
    for(let y=11;y<=18;y++){const w=face===2?[3,10]:[3,12];for(let x=w[0];x<=w[1];x++)set(x,y,y===12&&x%2?cs:cc);}
    if(face===0){for(let y=11;y<=18;y++){set(7,y,cs);set(8,y,cs);}}}
  if(p.skirt){for(let y=15;y<=17;y++){const w=face===2?[3,10]:[2,13];for(let x=w[0];x<=w[1];x++)set(x,y,p.skirt);}
    for(let x=face===2?3:2;x<=(face===2?10:13);x++)set(x,17,dkc(p.skirt,.8));}
  if(p.spiky&&face!==2){set(5,0,p.hair);set(8,0,p.hair);set(10,0,p.hair);}
  if(p.spiky&&face===2){set(5,0,p.hair);set(8,0,p.hair);}
  if(p.bag&&face===1){for(let y=11;y<=14;y++)for(let x=4;x<=11;x++)set(x,y,p.bag);}
  const [c,g]=mkCanvas(16,CH);const o='#22222e';
  for(let y=0;y<CH;y++)for(let x=0;x<16;x++)if(grid[y][x]){g.fillStyle=grid[y][x];g.fillRect(x,y,1,1);}
  // 1px outline (also darker inner edge on top of hat for volume)
  for(let y=0;y<CH;y++)for(let x=0;x<16;x++){
    if(grid[y][x])continue;let n=false;
    for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const yy=y+dy,xx=x+dx;if(yy>=0&&yy<CH&&xx>=0&&xx<16&&grid[yy][xx])n=true;}
    if(n){g.fillStyle=o;g.fillRect(x,y,1,1);}
  }
  if(dir===3){const [c2,g2]=mkCanvas(16,CH);g2.translate(16,0);g2.scale(-1,1);g2.drawImage(c,0,0);CCACHE[key]=c2;return c2;}
  CCACHE[key]=c;return c;
}
// shadow under actors
const SHADOW=(()=>{const [c,g]=mkCanvas(16,16);g.fillStyle='rgba(0,0,0,.22)';g.beginPath();g.ellipse(8,14,5,2,0,0,7);g.fill();return c;})();
// large player back sprite for battle (64x64) built from small parts
function trainerBack(pk){
  const [c,g]=mkCanvas(64,64);const p=CPAL[pk];const R=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x,y,w,h);};
  const o='#22222e';
  const body=(ox)=>{
    R(ox+18,50,10,12,o);R(ox+19,50,8,11,p.pants);R(ox+32,50,10,12,o);R(ox+33,50,8,11,p.pants);R(ox+17,60,12,3,o);R(ox+18,60,10,2,p.shoe);R(ox+31,60,12,3,o);R(ox+32,60,10,2,p.shoe);
    R(ox+12,26,38,26,o);R(ox+13,27,36,24,p.shirt);R(ox+14,28,34,3,'rgba(255,255,255,.25)');R(ox+20,40,22,10,'rgba(0,0,0,.18)');
    R(ox+8,28,7,18,o);R(ox+9,29,5,16,p.shirt);R(ox+9,44,5,3,p.skin);R(ox+47,28,7,18,o);R(ox+48,29,5,16,p.shirt);R(ox+48,44,5,3,p.skin);
    R(ox+20,6,24,24,o);R(ox+21,7,22,22,p.hat);R(ox+21,7,22,4,'rgba(255,255,255,.25)');R(ox+22,24,20,6,p.hair);R(ox+24,28,16,4,p.skin);R(ox+23,31,18,2,o);
    if(p.long){R(ox+19,14,4,20,o);R(ox+20,14,2,19,p.hair);R(ox+41,14,4,20,o);R(ox+42,14,2,19,p.hair);}
  };
  body(0);return c;
}

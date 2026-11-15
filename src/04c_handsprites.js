// ---------- hand-authored creature sprites (40x40, left half mirrored) ----------
// Row syntax "indent|tok tok ...": tok = char | char*N | char* (fill to centre). '.' = transparent.
const HA={};
const FEET=['10|o 2*5 o*','9|o 2*6 1 o .*','9|o 1*7 o .*','10|o*7 .*'];
function parseRow(s){
  const [ind,rest]=s.split('|');const indent=+ind;let out=[],fill=null;
  for(const t of rest.trim().split(/\s+/)){
    const m=/^(.)(?:\*(\d*))?$/.exec(t);if(!m){console.warn('bad tok',t,s);continue;}
    if(m[2]===undefined)out.push(m[1]);else if(m[2]==='')fill=m[1];else for(let i=0;i<+m[2];i++)out.push(m[1]);
  }
  const have=indent+out.length;
  if(fill!==null)for(let i=have;i<20;i++)out.push(fill);
  const row='.'.repeat(indent)+out.join('');

  let r=row.slice(0,20).padEnd(20,'.');let L=19;while(L>=0&&r[L]==='.')L--;
  if(L>=indent&&L<19&&r[L]!=='o')r=r.slice(0,L+1)+r[L].repeat(19-L);
  return r;
}
function buildHand(def,back){
  const S=40,grid=Array.from({length:S},()=>Array(S).fill('.'));
  const put=(g,x,y,ch)=>{if(ch!=='.'&&x>=0&&y>=0&&x<S&&y<S)g[y][x]=ch;};
  const stamp=(g,list)=>{for(const o of list||[])o.rows.forEach((r,j)=>{for(let i=0;i<r.length;i++){put(g,o.x+i,o.y+j,r[i]);if(o.m)put(g,39-o.x-i,o.y+j,r[i]);}});};
  stamp(grid,def.under);
  let y=def.y0??3;
  for(const r of def.rows){
    const rr=r==='FEET'?FEET:[r];
    for(const row of rr){const p=parseRow(row);for(let x=0;x<20;x++){put(grid,x,y,p[x]);put(grid,39-x,y,p[x]);}y++;}
  }
  stamp(grid,def.over);
  const pal={e:'#1c1430',w:'#ffffff',m:'#3a1a24',...def.pal};
  const [c,g]=mkCanvas(S,S);
  const bm={e:'2',w:'2',m:'2',c:'2',d:'1'};
  for(let yy=0;yy<S;yy++)for(let x=0;x<S;x++){
    let ch=grid[yy][x];if(ch==='.')continue;if(back&&bm[ch])ch=bm[ch];
    g.fillStyle=pal[ch]||'#f0f';g.fillRect(x,yy,1,1);
  }
  return c;
}
const _spritesOld=sprites;
sprites=function(id){
  if(SPR[id])return SPR[id];
  if(!HA[id])return _spritesOld(id);
  const d=HA[id],front=buildHand(d,false),back=buildHand(d,true);
  const [ic,ig]=mkCanvas(28,28);ig.drawImage(front,0,0,28,28);
  return SPR[id]={front,back,icon:ic};
};
HA[1]={pal:{o:'#4a1d1a',1:'#b8451e',2:'#e8742c',3:'#ffa14a',h:'#ffd58a',a:'#ffe14a',b:'#f2632a',c:'#fff0d0',d:'#f0cfa0'},
rows:[
'8|o','7|o 2 o','7|o 2 c o','6|o 2*2 c*2 o','6|o 2*2 c*2 3 o','6|o 2*2 c*2 3*2 o*',
'5|o 3*','4|o 3*','3|o 3 h 3*','3|o 3*2 2*','3|o 2*','3|o 2*',
'3|o 2*8 e w 2*','3|o 2*8 e*2 2*','3|o 2*8 e*2 2*',
'3|o 2*12 c*3 m','3|o 2*11 c*','4|o 2*10 c*','5|o 1*2 2*7 c*','6|o 1*4 2*3 c*','7|o*',
'10|o 1*3 2*2 c*','10|o 2*3 c*','10|o 2*2 c*','10|o 2*2 c*','10|o 2 c*','10|o 2 c*','11|o 2 c*','11|o 2 d*','11|o 1 d*','12|o 1*2 d*','FEET'],
under:[{x:28,y:19,rows:[
'........oo.','.......oaao','......oabao','.....oabbo.','....o2bbo..','...o23bo...','..o2332o...','..o2222o...','.o22222o...','.o12222o...','.o11222o...','..o1122o...','...oooo....']}]};
// 2 Blazefang: bigger, taller fox with flame mane
HA[2]={pal:{o:'#4a1d1a',1:'#a63a1c',2:'#dd6a28',3:'#ff9a44',a:'#ffe14a',b:'#f2632a',c:'#fff0d0',d:'#f0cfa0',f:'#fff2a0'},y0:1,
rows:['9|o','8|o 3 o','8|o 3*2 o','7|o 2 3*2 c o','7|o 2*2 3 c*2 o','6|o 2*5 c*2 o','5|o 2*7 c*2 o','5|o 2*8 c*2','4|o 2*10 c*','4|o 3*2 2*8 c*','3|o 2*13 3','3|o 2*13 3*','3|o 2*8 e w 2*4','3|o 2*8 e*2 2*3','3|o 2*8 e*2 2*3','3|o 2*10 c*3 m','3|o 2*10 c*','4|o 1*2 2*5 c*5','4|o 1*3 b*2 2*3 c*5','5|o 1*2 b*3 f 2*2 c*5','5|o 1*3 b*3 2 c*5','6|o 1*4 b*3 c*5','7|o 1*5 c*5','7|o 2*3 c*6','7|o 2*3 c*6','7|o 2*2 d*7','8|o 2*2 d*6','8|o 1*2 d*6','9|o 1*2 d*5','FEET'],
under:[{x:27,y:14,rows:['.......oo..','......oaao.','.....oabbao','....oabffbo','...oabffbbo','..oabfbbbo.','.oabbbbbo..','.obbbbbo...','oo2bbbo....','o222oo.....','oooo.......']}]};
// 3 Sproutle
HA[3]={pal:{o:'#1d4226',1:'#3a8040',2:'#62bc50',3:'#9ce070',a:'#2a9a48',b:'#7ad860',c:'#f0f0a0',d:'#d8d880',r:'#e8506a'},y0:3,
rows:['14|o o','13|o b b o','12|o b a b o','12|o b*2 a o','13|o a*','15|o 2*','11|o*','9|o 3*','8|o 3*2 2*','7|o 2*','7|o 2*','7|o 2*','7|o 2*6 e w 2*','7|o 2*6 e*2 2*','7|o 2*7 e*2 2*','7|o 2*9 c m','8|o 2*9 c*','8|o 1*2 2*7','9|o 1*3 2*5','10|o 1*4 c*4','9|o 2*2 c*6','8|o 2*2 c*7','8|o 2*2 c*7','8|o 1*3 d*7','9|o 1*2 d*7','9|o 1*2 d*6','10|o*','FEET'],
under:[]};
HA[3].rows=HA[3].rows.slice(0,-1).concat(['FEET']);
// 4 Thornbloom: tall plant beast with flower bloom on back
HA[4]={pal:{o:'#1d4226',1:'#2f7038',2:'#4fae4c',3:'#8ad868',a:'#e8506a',b:'#ff8aa0',c:'#e8e8a0',d:'#c8c870',p:'#7a3a9a',q:'#a860c8'},y0:2,
rows:['15|o o','14|o 3 3 o','13|o 3*2 2 o','12|o 2*7','11|o 2*8','10|o 2*9','9|o 2*10','8|o 3 2*11','8|o 2*12','8|o 2*8 e w 2*2','8|o 2*8 e*2 2*2','8|o 2*8 e*2 2*2','8|o 2*10 c m','8|o 2*11 c','9|o 1*3 2*7 c','9|o 1*4 2*6','10|o 1*5 c*5','10|o 2*3 c*7','9|o 2*3 c*8','9|o 2*3 d*8','9|o 1*3 d*8','10|o 1*3 d*7','10|o 1*3 d*6','FEET'],
under:[{x:23,y:4,rows:['....oooo....','..oopqqpoo..','.opqqaaqqpo.','opqaabbaaqpo','opqabbbbaqpo','opqaabbaaqpo','.opqqaaqqpo.','..oopqqpoo..','....oppo....','.....op.....']}],
over:[{x:12,y:3,rows:['...ooo...','..oaaao..','.oabbbao.','oabbcbbao','.oabbbao.','..oaaao..','...ooo...']}]};
// 5 Dribbo: round blue frog-tadpole
HA[5]={pal:{o:'#143a5a',1:'#2f6cb0',2:'#4a9ce0',3:'#8ad0ff',c:'#f0f8ff',d:'#c0dcf0',a:'#2a8a9a',b:'#7ae0e0'},y0:8,
rows:['12|o 2*','10|o 2*','9|o 3*2 2*','8|o 2*','8|o 2*','8|o 2*','7|o 2*','7|o 2*6 e w 2*','7|o 2*6 e*2 2*','7|o 2*7 e*2 2*','7|o 2*10 m*','8|o 2*9 c','8|o 2*8 c*','9|o 1*2 2*5 c*','9|o 1*3 c*7','9|o 2*2 c*8','9|o 2*2 c*8','9|o 2*2 d*8','9|o 1*2 d*8','10|o 1*2 d*7','11|o*','FEET'],
over:[{x:11,y:6,rows:['ooo.....','o3wo....','o3eo....','.ooo....']},{x:15,y:2,rows:['.oo.','o2bo','o2bo','.oo.']}],under:[]};
// 6 Torrentoad: heavy blue toad with shell-like back fins
HA[6]={pal:{o:'#143a5a',1:'#2a5ca0',2:'#4284d0',3:'#7cc0f0',c:'#e8f4ff',d:'#b8d4ec',a:'#f0c040',b:'#fff0a0'},y0:5,
rows:['13|o o','12|o 3 3 o','11|o 2*2 3 2 o','10|o 2*8','9|o 2*10','8|o 3 2*11','8|o 2*12','8|o 2*8 e w 2*2','8|o 2*8 e*2 2*2','8|o 2*8 e*2 2*2','8|o 2*11 m*','8|o 1*2 2*9','7|o 2*13','7|o 2*4 c*9','6|o 2*4 c*10','6|o 1*3 c*11','6|o 1*3 c*11','6|o 2*3 d*11','6|o 2*3 d*11','7|o 1*2 d*11','7|o 1*3 d*10','8|o 1*3 d*9','FEET'],
under:[{x:26,y:12,rows:['..oooo..','.o2332o.','o233332o','o223322o','o122221o','.o1221o.','..oooo..']}],
over:[{x:9,y:4,rows:['.oo.','oabo','.oo.']}]};
// 7 Chirpa: tiny round bird
HA[7]={pal:{o:'#4a3018',1:'#b8822c',2:'#e8b84a',3:'#ffe08a',c:'#fff4d0',d:'#f0dca8',a:'#ff8a3a',b:'#d85a20',r:'#e84a4a'},y0:8,
rows:['16|o 3*','14|o 3*','13|o 2*','12|o 3 2*','11|o 2*','10|o 2*','10|o 2*5 e w 2*','10|o 2*5 e*2 2*','10|o 2*6 e*2 2*','9|o 2*8 a b*','9|o 2*8 b*','9|o 2*3 c*6','9|o 1*2 c*8','9|o 2*2 c*8','9|o 1*2 d*8','10|o 1*2 d*7','11|o 1*2 d*6','12|o*','16|o o','15|o a o','15|o a o'],
over:[{x:8,y:11,rows:['.oo.','o11o','o112o','.o22o','..oo.']}],under:[]};
HA[7].rows=['15|o 3*','13|o 3 3*','12|o 2*','11|o 2*','10|o 2*','10|o 2*5 e w 2*','10|o 2*5 e*2 2*','10|o 2*6 e*2 2*','9|o 2*8 a*','9|o 2*8 b*','9|o 2*3 c*7','9|o 1*2 c*8','9|o 2*2 c*8','9|o 1*2 d*8','10|o 1*2 d*7','11|o 1*2 d*6','12|o 1*2 d*5','13|o*','16|o o','15|o a o','15|o a o'];
// 8 Gustwing: swept raptor with spread wings
HA[8]={pal:{o:'#2a2a4a',1:'#5a6a9a',2:'#8aa0d0',3:'#c0d4f4',c:'#f4f0e0',d:'#d8d0b8',a:'#f0b030',b:'#c07818',r:'#e84a4a'},y0:3,
rows:['17|o o','16|o 3 o','15|o 3*','14|o 2*','13|o 2*','12|o 2*','12|o 2*5 e w 2*','12|o 2*5 e*2 2*','12|o 2*7 a*','11|o 2*7 a b*','11|o 2*8 b*','11|o 1*2 2*3 c*5','11|o 1*2 c*7','11|o 1*2 c*7','11|o 2*2 c*7','11|o 1*2 d*7','12|o 1*2 d*6','12|o 1*2 d*6','13|o 1*2 d*5','14|o*','15|o 1 o','16|o a o','15|o a a o'],
under:[{m:1,x:0,y:8,rows:['....oooo.....','...o3223oo...','..o322222oo..','.o3222122oo..','o32221112oo..','o3221111oo...','o221111oo....','.o2111oo.....','.o2111o......','..o111o......','..o2oo.......','...oo........']}],
over:[{x:0,y:8,rows:['']}]};
// 9 Nibbit: small buck-toothed rodent
HA[9]={pal:{o:'#3a2a20',1:'#98745a',2:'#c8a07c',3:'#e8cca4',c:'#f8ecd8',d:'#e0cfb0',p:'#f0a0a8',w:'#ffffff'},y0:3,
rows:['12|o o','11|o 2 2 o','11|o 2 p o','11|o 2 p o','11|o 2 p 2 o','12|o 2*2 3*','12|o 2*','12|o 3*','10|o 2*','9|o 2*','9|o 2*','9|o 2*6 e w 2*','9|o 2*6 e*2 2*','9|o 2*7 e*2 2*','9|o 2*10 p','10|o 2*9 w','10|o 2*8 w w','10|o 1*2 c*8','10|o 2*2 c*8','10|o 2*2 c*8','10|o 1*2 d*8','11|o 1*2 d*7','12|o*','FEET'],
under:[{x:26,y:20,rows:['..oo....','.o22o...','o2332o..','o2222o..','o1222o..','.o11o...','..oo....']}]};
// 10 Mothlet: fuzzy larva-moth with feelers
HA[10]={pal:{o:'#40305a',1:'#8a78b8',2:'#b8a8e0',3:'#e0d8f8',c:'#fffaf0',d:'#e8e0d0',a:'#f0a8d0',b:'#ffd0e8',p:'#6a58a0'},y0:5,
rows:['11|o o','10|o p o','11|o p o','12|o 2*','11|o 2*','10|o 3*','9|o 2*','9|o 2*5 e w 2*','9|o 2*5 e*2 2*','9|o 2*6 e*2 2*','9|o 2*9 m','10|o 2*9','9|o c*10','9|o 2*3 c*8','9|o 2*3 c*8','9|o 1*3 d*8','9|o 2*3 d*8','9|o 1*3 d*8','10|o 1*3 d*7','11|o 1*3 d*6','12|o*','14|o 2 o','13|o 2*3','FEET'],
under:[{m:1,x:0,y:12,rows:['....oooo.....','..oo3223o....','.o33222a2o...','o3322aaa2o...','o322aabaa1o..','o22aabbba1o..','.o2aabba11o..','..o2aaa11o...','...o111oo....','....ooo......']}]};
HA[10].rows=HA[10].rows.slice(0,20).concat(['FEET']);
// 11 Lunamoth: big moth with wings spread, crescent marks
HA[11]={pal:{o:'#2a2a58',1:'#5a58a8',2:'#8a88d8',3:'#c0c0f8',c:'#f8f4ff',d:'#e0daf0',a:'#f8e070',b:'#fff4b0',p:'#403a88'},y0:3,
rows:['15|o o','14|o p o','15|o p','16|o 2*','15|o 3*','14|o 2*','14|o 2*4 e w 2*','14|o 2*4 e*2 2*','14|o 2*5 e*2 2*','14|o 2*8 m','14|o c*5','14|o c*5','14|o c*5','14|o d*5','14|o 1*5','15|o 1*4','16|o 1 o','17|o o'],
under:[{m:1,x:0,y:3,rows:['.......ooooo....','.....oo33332o..','...oo3322aab2o.','..o3322aabbb2o.','.o33222abbbaa2o','o33222aabbba22o','o3222aabbbaa22o','o2222aaabba2221','o2221aaaaa22211','.o2211222222211','..o221122222211','...o22111222111','....o221111111.','.....oo21111oo.','.......ooooooo.']},
{m:1,x:0,y:19,rows:['..........oo....','........oo2o....','.......o222o....','......o2222o....','.....o12221o....','.....o1111o.....','......oooo......']}]};
// 12 Pebblin: rock with a face and stubby arms
HA[12]={pal:{o:'#3a3438',1:'#6a6468',2:'#9a9498',3:'#c8c4c8',c:'#d8c8a0',d:'#b8a880',k:'#807a80',m:'#38303a'},y0:7,
rows:['14|o 3*','12|o 3 3*','11|o 2*','10|o 3 2*','9|o 2*','9|o 2*','9|o 2*5 e w 2*','9|o 2*5 e*2 2*','9|o 2*6 e*2 2*','9|o 2*5 k*5','9|o 2*3 k 2*7','8|o 3 2*10','8|o 2*11','8|o 2*3 k*8','8|o 1*3 2*9','8|o 1*3 1 2*8','9|o 1*2 k 1*7','9|o 1*3 1*7','10|o 1*2 1*7','11|o*','FEET'],
over:[{x:3,y:15,rows:['.oo.','o22o','o23o','o22o','.oo.']}]};
// 13 Boulderon: massive golem with rock shoulders
HA[13]={pal:{o:'#302a30',1:'#5a5458',2:'#8a8488',3:'#bcb8bc',c:'#a8985c',d:'#887840',k:'#706a70',m:'#2a2230',y:'#f0c840'},y0:2,
rows:['14|o 3*','12|o 3*2 2*','11|o 3 2*','10|o 2*','10|o 2*','10|o 2*4 e w 2*','10|o 2*4 e*2 2*','10|o 2*5 e*2 2*','10|o 2*8 m*','9|o 3 3 2*8','7|o 3*2 2*11','6|o 3*2 2*12','5|o 3 2*14','5|o 2*5 k 2*8','4|o 2*4 y y 2*9','4|o 2*5 y*2 k 2*7','4|o 1*3 2*3 y*2 2*5','4|o 1*4 2*3 y 2*5','4|o 1*5 k 2*8','5|o 1*5 2*9','6|o 1*4 2*8','7|o 1*3 1*9','8|o 1*3 1*8','9|o 1*3 1*7','10|o 1*2 1*7','10|o*','FEET'],
under:[]};
HA[13].rows=HA[13].rows.slice(0,25).concat(['FEET']);
// 14 Zapkit: teal sprite-cat with yellow bolt tail
HA[14]={pal:{o:'#143a42',1:'#2a8a8a',2:'#48c0b8',3:'#8af0e0',a:'#ffe03a',b:'#f0a820',c:'#e8fff8',d:'#b8e8e0',k:'#ffffa0'},y0:4,
rows:['9|o','8|o 2 o','8|o 2*2 o','7|o 2*3 o','7|o 2*2 a*2 o','7|o 2*4 a o','7|o 2*7','8|o 2*','9|o 3*','8|o 2*','8|o 2*','8|o 2*6 e w 2*','8|o 2*6 e*2 2*','8|o 2*7 e*2 2*','8|o 2*9 a a','8|o 2*10 m','9|o 2*9','9|o 1*2 c*8','9|o 2*2 c*8','9|o 2*2 c*8','9|o 1*2 d*8','10|o 1*2 d*7','11|o*','FEET'],
under:[{x:27,y:10,rows:['.......oo.','......oaao','.....oabbo','....oabbo.','...oabbo..','..oaabbo..','.oaaaabbo.','oaaaaaabo.','.ooaabbo..','...oabo...','....oo....']}]};
// 15 Gloomp: purple ooze with drips
HA[15]={pal:{o:'#33204a',1:'#6a3a9a',2:'#9a5ad0',3:'#c898f0',c:'#e8d0f8',d:'#c8a8e0',a:'#d8f060',b:'#f4ffa0',g:'#7a48b0'},y0:9,
rows:['14|o 3*','12|o 3*2 2*','11|o 3 2*','10|o 2*','9|o 2*','9|o 2*','8|o 2*','8|o 2*6 e w 2*','8|o 2*6 e*2 2*','8|o 2*7 e*2 2*','8|o 2*8 m*','8|o 2*','8|o 2*','8|o 2*3 c*8','8|o 1*2 g*9','8|o 1*3 g*8','8|o 1*3 g*8','9|o 1*3 1*7','10|o 1 o 1*2 o 1*5','10|o o 1 o o 1 o*','12|o o','12|o o'],
over:[{x:6,y:15,rows:['.oo.','o3bo','o2bo','.oo.']},{x:14,y:7,rows:['.oo.','oabo','.oo.']}]};

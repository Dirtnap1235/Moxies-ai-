// ---------- maps ----------
function Grid(w,h,fill){
  const g=Array.from({length:h},()=>Array(w).fill(fill));
  const o={w,h,g,
    put(x,y,c){if(x>=0&&y>=0&&x<w&&y<h)g[y][x]=c;return o;},
    rect(x,y,ww,hh,c){for(let j=0;j<hh;j++)for(let i=0;i<ww;i++)o.put(x+i,y+j,c);return o;},
    border(c){o.rect(0,0,w,1,c).rect(0,h-1,w,1,c).rect(0,0,1,h,c).rect(w-1,0,1,h,c);return o;},
    house(x,y,ww,roof,rows,dx,emb){
      o.rect(x,y-1,ww,2,roof);
      for(let r=1;r<rows;r++)for(let i=0;i<ww;i++)o.put(x+i,y+r,(r===1&&i%2===1&&ww>3)?'H':'h');
      for(let i=0;i<ww;i++)o.put(x+i,y+rows,'h');
      o.put(x+dx,y+rows,'D');if(emb)o.put(x+dx,y+rows-1,emb);return o;},
    forest(sd,a,b){
      const nz=(v,k)=>(Math.sin(v*.9+k)+Math.sin(v*.37+k*2.1))/4+.5;
      for(let y=0;y<h;y++){o.rect(0,y,a+Math.round((b-a)*nz(y,sd)),1,'#');const rt=a+Math.round((b-a)*nz(y,sd*3.3));o.rect(w-rt,y,rt,1,'#');}
      for(let x=0;x<w;x++){const t=a+Math.round((b-a)*nz(x,sd*1.7));o.rect(x,0,1,t,'#');const bt=a+Math.round((b-a)*nz(x,sd*2.9));o.rect(x,h-bt,1,bt,'#');}
      return o;},
    blob(cx,cy,rx,ry,c,sd=1){for(let y=Math.floor(cy-ry-2);y<=cy+ry+2;y++)for(let x=Math.floor(cx-rx-2);x<=cx+rx+2;x++){
      const a=Math.atan2((y-cy)/ry,(x-cx)/rx),k=1+.28*Math.sin(a*3+sd)+.18*Math.sin(a*5+sd*2.3);
      if(((x-cx)/rx)**2+((y-cy)/ry)**2<k*k)o.put(x,y,c);}return o;},
    path(pts,c,wd=2){for(let i=0;i<pts.length-1;i++){let [x0,y0]=pts[i];const [x1,y1]=pts[i+1];const n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0));
      for(let k=0;k<=n;k++){const x=Math.round(x0+(x1-x0)*k/n),y=Math.round(y0+(y1-y0)*k/n);o.rect(x,y,wd,wd,c);}}return o;},
    putIf(x,y,c,only='.'){if(x>=0&&y>=0&&x<w&&y<h&&g[y][x]===only)g[y][x]=c;return o;},
    patch(c,sd,sc,thr,only='.'){for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(g[y][x]===only&&VN(x/sc,y/sc,sd)*.8+VN(x/(sc/2.6),y/(sc/2.6),sd+1)*.2>thr)g[y][x]=c;return o;},
    rows(){return g.map(r=>r.join(''));}};
  return o;
}
function Room(w,h,mx,floor='_'){
  const o=Grid(w,h,' ');o.rect(1,1,w-2,h-2,floor);o.rect(1,1,w-2,1,'W');if(floor==='J')o.rect(1,2,w-2,h-3,'J');o.put(mx,h-1,'X');return o;
}
const D_=['down','up','left','right'];
const MAPS={};
function addMap(id,o){MAPS[id]=Object.assign({id,warps:[],npcs:[],events:{},enc:null,indoor:false,music:'town',bg:'grass'},o);}

function buildMaps(){
// ===== DEWHOLLOW TOWN =====
{const g=Grid(26,20,'.').forest(1,2,4);
 g.rect(12,0,2,19,'=').rect(6,8,14,1,'=');
 g.house(4,5,5,'^',2,2).house(16,5,7,'v',2,3);
 g.put(11,3,'S').blob(6,13.5,5,3.8,'n',4).blob(6,13.5,3.4,2.5,'~',2).rect(16,12,5,2,'f').rect(2,9,3,1,'f').rect(21,10,2,1,'f').rect(15,16,6,1,'-');
 for(const [x,y] of [[10,15],[22,13],[9,11],[20,16],[5,17],[23,8],[24,9]])g.put(x,y,'#');
 g.put(11,13,'r').put(17,10,'r').put(10,9,'f').put(15,10,'f');
 g.patch(',',3,6,.63).patch('y',8,5,.76);
 addMap('dew',{seed:11,name:'DEWHOLLOW TOWN',music:'town',t:g.rows(),
  warps:[{x:6,y:7,to:'home',tx:4,ty:6,dir:1},{x:19,y:7,to:'lab',tx:6,ty:7,dir:1},
    {x:12,y:0,to:'route1',tx:12,ty:32,dir:1,req:()=>G.flags.rivalBeat?null:'Wait! PROF. LINDEN wanted to see me first.'},
    {x:13,y:0,to:'route1',tx:13,ty:32,dir:1,req:()=>G.flags.rivalBeat?null:'Wait! PROF. LINDEN wanted to see me first.'}],
  events:{'11,3':async()=>say('DEWHOLLOW TOWN\nWhere the dew never dries.')},
  npcs:[
   {id:'old',x:15,y:11,dir:2,pal:'old',text:['This is DEWHOLLOW. They say the dew here never dries.','North of town is ROUTE 1. Tall grass is full of wild MOXIES!']},
   {id:'kid1',x:9,y:10,dir:0,pal:'kid',wander:1,text:['I want a MOXIE of my own!','But Mom says I can\'t go into the tall grass yet.']},
   {id:'lass1',x:9,y:13,dir:2,pal:'lass',text:['The pond water is so clear.','Sometimes a DRIBBO pops up to say hello.']},
  ]});}
// ===== HOME =====
{const g=Room(10,8,4);
 g.put(2,2,'K').put(3,2,'K').put(8,2,'B').put(1,2,'P').put(3,4,'T').put(4,4,'T').rect(4,5,2,1,'R');
 addMap('home',{name:'HOME',music:'indoor',indoor:1,bg:'room',t:g.rows(),
  warps:[{x:4,y:7,to:'dew',tx:6,ty:8,dir:0}],
  npcs:[{id:'mom',x:6,y:4,dir:2,pal:'mom',talk:async()=>{
    if(!G.flags.starter){await say('MOM: Oh, you\'re up! PROF. LINDEN asked for you at the lab. It\'s the building with the blue roof.');}
    else{await say('MOM: You look tired. Rest up a bit!');await healParty();await say('MOM: There! All better. Do your best out there!');}}}],
  events:{'8,2':async()=>say('A comfy bed. Nap time is for later!'),'2,2':async()=>say('Shelves full of MOXIE field guides.'),'3,4':async()=>say('A half-finished cup of tea.')}});}
// ===== LAB =====
{const g=Room(12,9,6);
 g.rect(2,2,3,1,'K').rect(8,2,3,1,'K').put(5,3,'1').put(6,3,'2').put(7,3,'3').put(1,2,'P').put(10,6,'P').rect(5,5,3,2,'R');
 addMap('lab',{name:'LINDEN LAB',music:'indoor',indoor:1,bg:'room',t:g.rows(),
  warps:[{x:6,y:8,to:'dew',tx:19,ty:8,dir:0}],
  events:{'5,3':()=>pickStarter(1),'6,3':()=>pickStarter(3),'7,3':()=>pickStarter(5),
   '3,2':async()=>say('Research notes on MOXIE habitats.'),'9,2':async()=>say('A shelf of dusty journals.')},
  npcs:[
   {id:'prof',x:9,y:4,dir:2,pal:'prof',talk:()=>profTalk()},
   {id:'rival',x:2,y:5,dir:3,pal:'rival',talk:()=>rivalTalk(),hideIf:()=>!!G.flags.rivalBeat&&false}]});}
// ===== ROUTE 1 =====
{const g=Grid(26,34,'.').forest(2,3,6);
 g.blob(8,5,4.5,3,'*',1).blob(17,11,3.5,2.4,'*',2).blob(8,21,4,3,'"',3).blob(19,23,4,3.4,'"',4).blob(7,28,4,2.6,'"',5).blob(21,29,2.4,2.2,'"',6);
 for(let x=0;x<26;x++){const cy=16+Math.round(1.6*Math.sin((x-12.5)*.4));g.rect(x,cy-1,1,3,'~');}
 g.path([[12,33],[12,28],[13,24],[13,20],[12,18]],'=').path([[12,14],[12,11],[14,9],[18,8],[18,0]],'=').rect(12,15,2,3,'b');
 g.rect(3,14,6,1,'q').rect(17,18,3,1,'q');
 for(const [x,y] of [[10,2],[15,3],[16,6],[9,10],[8,12],[20,13],[11,26],[16,30],[9,31],[21,22],[14,13]])g.put(x,y,'#');
 for(const [x,y] of [[8,9],[16,12],[10,18],[14,19],[17,28],[11,23],[22,9]])g.put(x,y,'f');
 g.put(9,24,'r').put(15,27,'r').put(17,3,'r');
 for(let x=0;x<26;x++){const cy=16+Math.round(1.6*Math.sin((x-12.5)*.4));if(VN(x/3,1,4)>.3)g.putIf(x,cy-2,'n');if(VN(x/3,5,6)>.3)g.putIf(x,cy+2,'n');}
 g.patch(',',5,6,.6).patch('y',9,5,.72);
 addMap('route1',{seed:23,name:'ROUTE 1',music:'route',t:g.rows(),
  warps:[{x:12,y:33,to:'dew',tx:12,ty:1,dir:0},{x:13,y:33,to:'dew',tx:13,ty:1,dir:0},
   {x:18,y:0,to:'cinder',tx:14,ty:21,dir:1},{x:19,y:0,to:'cinder',tx:15,ty:21,dir:1}],
  enc:[{s:9,a:3,b:5,w:30},{s:7,a:3,b:5,w:25},{s:10,a:3,b:5,w:20},{s:15,a:4,b:6,w:10},{s:12,a:4,b:6,w:10},{s:14,a:4,b:5,w:5}],
  events:{},
  npcs:[
   {id:'pip',x:15,y:29,dir:2,pal:'bug',sight:3,tr:{cls:'BUG CATCHER',name:'PIP',team:[[10,4],[10,5]],reward:80,
     pre:'Hey! Your MOXIE looks strong. Battle me!',lose:'My bugs got squished!',post:'Bugs are tougher in numbers. I\'ll train more!'}},
   {id:'tobi',x:11,y:21,dir:3,pal:'kid',sight:3,tr:{cls:'YOUNGSTER',name:'TOBI',team:[[9,5],[14,4]],reward:90,
     pre:'Our eyes met! That means we battle!',lose:'Oh wow, you\'re really good!',post:'ZAPKIT is so fast. Not fast enough though...'}},
   {id:'wren',x:11,y:11,dir:3,pal:'lass',sight:3,tr:{cls:'LASS',name:'WREN',team:[[7,6],[3,5]],reward:100,
     pre:'I\'ve been waiting for a challenger!',lose:'Oh no, my cuties!',post:'CINDERFORD is just ahead. Good luck at the GYM!'}},
   {id:'hiker1',x:14,y:31,dir:2,pal:'hiker',text:['Heard the CINDERFORD GYM LEADER uses ROCK Moxies.','WATER and GRASS moves are the way to go!']},
  ]});}
// ===== CINDERFORD =====
{const g=Grid(30,24,'.').forest(3,2,4);
 g.rect(14,14,2,10,'=').rect(2,11,26,3,':').rect(21,7,7,4,':');
 g.house(5,8,5,'^',2,2,'C').house(12,8,5,'v',2,2,'M').house(21,3,7,'%',3,3,'G');
 g.put(26,7,'S').put(9,11,'S');
 g.blob(5.5,17.5,4.6,3.6,'n',5).blob(5.5,17.5,3,2.3,'~',3).rect(20,16,6,1,'f').rect(20,18,6,1,'f').rect(20,20,6,1,'f');
 for(const [x,y] of [[9,16],[10,20],[18,16],[27,16],[3,4],[4,5],[9,4],[17,4],[18,5],[10,6],[12,5]])g.put(x,y,'#');
 g.put(9,18,'f').put(19,19,'f').put(13,6,'f').put(14,6,'f').put(11,16,'r');
 g.patch('y',2,5,.5).patch(',',6,7,.74);
 addMap('cinder',{seed:5,name:'CINDERFORD CITY',music:'town',t:g.rows(),
  warps:[{x:7,y:10,to:'center',tx:5,ty:6,dir:1},{x:14,y:10,to:'mart',tx:4,ty:6,dir:1},{x:24,y:6,to:'gym',tx:6,ty:10,dir:1},
   {x:14,y:23,to:'route1',tx:18,ty:1,dir:0},{x:15,y:23,to:'route1',tx:19,ty:1,dir:0}],
  events:{'26,7':async()=>say('CINDERFORD GYM\nLEADER: KILN\nThe forge-fire of Valdora!'),'9,11':async()=>say('CINDERFORD CITY\nThe furnace town glows even at night.')},
  npcs:[
   {id:'cit1',x:17,y:12,dir:0,pal:'old',wander:1,text:['Kiln\'s ROCK Moxies hit hard, but WATER moves wash them out.','Stock up on POTIONS at the MART first!']},
   {id:'cit2',x:6,y:13,dir:3,pal:'lass',text:['The CENTER heals your Moxies for free!','Nurse PEONY is so kind.']},
   {id:'cit3',x:25,y:12,dir:2,pal:'rock',text:['The gym has a trainer waiting inside.','Beat him and the leader will see you!']},
  ]});}
// ===== CENTER =====
{const g=Room(12,8,5);
 g.rect(3,3,6,1,'N').put(3,3,'Q').put(1,2,'P').put(10,6,'P').rect(5,4,2,3,'R').rect(1,2,0,0,'K');
 addMap('center',{name:'MOXIE CENTER',music:'indoor',indoor:1,bg:'room',t:g.rows(),
  warps:[{x:5,y:7,to:'cinder',tx:7,ty:11,dir:0}],
  events:{'5,3':()=>nurseHeal(),'6,3':()=>nurseHeal(),'4,3':()=>nurseHeal()},
  npcs:[{id:'nurse',x:5,y:2,dir:0,pal:'nurse',talk:()=>nurseHeal()},
   {id:'vis',x:9,y:5,dir:2,pal:'kid',text:['Resting here makes my Moxies so happy.']}]});}
// ===== MART =====
{const g=Room(10,8,4);
 g.rect(2,3,3,1,'N').rect(6,2,3,1,'Y').put(1,2,'Y').put(8,5,'P');
 addMap('mart',{name:'MOXIE MART',music:'indoor',indoor:1,bg:'room',t:g.rows(),
  warps:[{x:4,y:7,to:'cinder',tx:14,ty:11,dir:0}],
  events:{'3,3':()=>shop(),'2,3':()=>shop(),'4,3':()=>shop()},
  npcs:[{id:'clerk',x:3,y:2,dir:0,pal:'clerk',talk:()=>shop()},
   {id:'cust',x:7,y:5,dir:2,pal:'bug',text:['CAPSULES are the best way to build a team!','Weaken the wild Moxie first, then throw!']}]});}
// ===== GYM =====
{const g=Room(12,12,6,'J');
 g.put(2,2,'U').put(9,2,'U').put(1,5,'U').put(10,5,'U');
 addMap('gym',{name:'CINDERFORD GYM',music:'gym',indoor:1,bg:'gym',t:g.rows(),
  warps:[{x:6,y:11,to:'cinder',tx:24,ty:7,dir:0}],
  events:{'2,2':async()=>say('A statue of a ROCK Moxie. Its crystals glow faintly.'),'9,2':async()=>say('A statue of a ROCK Moxie. Its crystals glow faintly.')},
  npcs:[
   {id:'dax',x:6,y:6,dir:0,pal:'rock',sight:4,tr:{cls:'ROCKHOUND',name:'DAX',team:[[12,9],[9,9]],reward:120,
     pre:'Nobody sees KILN without getting past me!',lose:'Crushed like gravel...',post:'KILN is up ahead. His ace is a monster.'}},
   {id:'kiln',x:6,y:3,dir:0,pal:'leader',leader:1,tr:{cls:'GYM LEADER',name:'KILN',team:[[12,10],[1,11],[13,13]],reward:500,
     pre:'I\'m KILN, forger of the ember! My Moxies are tempered in stone and flame. Show me your fire!',lose:'Hah! You burned through my forge!',
     post:'You earned the EMBER BADGE. Valdora has much more to see. Keep going!'}},
  ]});}
for(const m of Object.values(MAPS)){m.w=m.t[0].length;m.h=m.t.length;}
}
buildMaps();

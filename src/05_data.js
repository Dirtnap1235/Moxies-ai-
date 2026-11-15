// ---------- game data ----------
const TYPES=['Normal','Fire','Water','Grass','Electric','Flying','Bug','Poison','Rock'];
const TYPE_COL={Normal:'#a8a890',Fire:'#f08030',Water:'#5890f0',Grass:'#78c850',Electric:'#f8d030',Flying:'#a890f0',Bug:'#a8b820',Poison:'#a040a0',Rock:'#b8a038'};
const CHART={ // attacker -> {defender:mult}
  Fire:{Grass:2,Bug:2,Fire:.5,Water:.5,Rock:.5},
  Water:{Fire:2,Rock:2,Water:.5,Grass:.5},
  Grass:{Water:2,Rock:2,Fire:.5,Grass:.5,Poison:.5,Flying:.5,Bug:.5},
  Electric:{Water:2,Flying:2,Electric:.5,Grass:.5},
  Flying:{Grass:2,Bug:2,Electric:.5,Rock:.5},
  Bug:{Grass:2,Fire:.5,Flying:.5,Poison:.5},
  Poison:{Grass:2,Poison:.5,Rock:.5},
  Rock:{Fire:2,Flying:2,Bug:2},
  Normal:{Rock:.5},
};
const typeMult=(atk,types)=>types.reduce((m,t)=>m*((CHART[atk]||{})[t]??1),1);
const MOVES={
  tackle:{n:'TACKLE',t:'Normal',p:40,a:100,pp:35},
  scratch:{n:'SCRATCH',t:'Normal',p:40,a:100,pp:35},
  quick:{n:'QUICK DASH',t:'Normal',p:35,a:100,pp:30,pri:1},
  bite:{n:'CHOMP',t:'Normal',p:60,a:100,pp:25},
  bodyslam:{n:'HEAVY SLAM',t:'Normal',p:75,a:95,pp:15},
  ember:{n:'EMBER',t:'Fire',p:40,a:100,pp:25},
  flamewheel:{n:'FLARE SPIN',t:'Fire',p:60,a:95,pp:20},
  cinderbite:{n:'CINDER FANG',t:'Fire',p:80,a:90,pp:12},
  waterjet:{n:'WATER JET',t:'Water',p:40,a:100,pp:25},
  bubble:{n:'BUBBLE BURST',t:'Water',p:60,a:100,pp:20},
  tidal:{n:'TIDAL CRASH',t:'Water',p:85,a:90,pp:10},
  vinewhip:{n:'VINE LASH',t:'Grass',p:45,a:100,pp:25},
  leafcutter:{n:'LEAF CUTTER',t:'Grass',p:60,a:95,pp:20},
  bloomburst:{n:'BLOOM BURST',t:'Grass',p:85,a:90,pp:10},
  gust:{n:'GUST',t:'Flying',p:40,a:100,pp:35},
  wingslash:{n:'WING SLASH',t:'Flying',p:65,a:95,pp:20},
  zap:{n:'ZAP',t:'Electric',p:40,a:100,pp:30},
  voltrush:{n:'VOLT RUSH',t:'Electric',p:70,a:100,pp:15},
  sting:{n:'STING',t:'Poison',p:35,a:100,pp:35},
  toxicspit:{n:'TOXIC SPIT',t:'Poison',p:65,a:100,pp:20},
  bugbite:{n:'BUG NIP',t:'Bug',p:45,a:100,pp:30},
  dustwing:{n:'DUST WING',t:'Bug',p:65,a:100,pp:20},
  rocktoss:{n:'PEBBLE TOSS',t:'Rock',p:50,a:90,pp:15},
  boulder:{n:'BOULDER BASH',t:'Rock',p:80,a:90,pp:10},
};
// base: [hp,atk,def,spd]; learn: [level,move]; evo:[level,toId]
const SPECIES={
 1:{n:'FLICKIT',t:['Fire'],b:[44,52,43,65],y:62,cr:45,ev:[16,2],ls:[[1,'scratch'],[1,'ember'],[8,'bite'],[13,'flamewheel']]},
 2:{n:'BLAZEFANG',t:['Fire'],b:[64,74,58,86],y:142,cr:45,ev:[32,16],ls:[[1,'scratch'],[1,'ember'],[8,'bite'],[13,'flamewheel'],[17,'cinderbite'],[25,'bodyslam']]},
 16:{n:'PYROVANE',t:['Fire','Flying'],b:[84,98,80,96],y:240,cr:45,ls:[[1,'scratch'],[1,'ember'],[8,'bite'],[13,'flamewheel'],[17,'cinderbite'],[25,'bodyslam'],[32,'wingslash'],[40,'cinderbite']]},
 3:{n:'SPROUTLE',t:['Grass'],b:[48,49,52,45],y:64,cr:45,ev:[16,4],ls:[[1,'tackle'],[1,'vinewhip'],[8,'sting'],[13,'leafcutter']]},
 4:{n:'THORNBLOOM',t:['Grass','Poison'],b:[68,68,70,60],y:145,cr:45,ls:[[1,'tackle'],[1,'vinewhip'],[8,'sting'],[13,'leafcutter'],[17,'bloomburst'],[25,'bodyslam']]},
 5:{n:'DRIBBO',t:['Water'],b:[50,48,64,43],y:63,cr:45,ev:[16,6],ls:[[1,'tackle'],[1,'waterjet'],[8,'bite'],[13,'bubble']]},
 6:{n:'TORRENTOAD',t:['Water'],b:[72,66,80,58],y:146,cr:45,ls:[[1,'tackle'],[1,'waterjet'],[8,'bite'],[13,'bubble'],[17,'tidal'],[25,'bodyslam']]},
 7:{n:'CHIRPA',t:['Normal','Flying'],b:[40,45,40,56],y:55,cr:255,ev:[18,8],ls:[[1,'tackle'],[1,'gust'],[7,'quick'],[12,'wingslash']]},
 8:{n:'GUSTWING',t:['Normal','Flying'],b:[68,80,66,88],y:140,cr:90,ls:[[1,'tackle'],[1,'gust'],[7,'quick'],[12,'wingslash'],[20,'bodyslam']]},
 9:{n:'NIBBIT',t:['Normal'],b:[30,56,35,72],y:51,cr:255,ls:[[1,'tackle'],[4,'quick'],[9,'bite'],[14,'bodyslam']]},
 10:{n:'MOTHLET',t:['Bug'],b:[45,35,50,40],y:56,cr:255,ev:[15,11],ls:[[1,'tackle'],[1,'bugbite'],[9,'gust'],[12,'dustwing']]},
 11:{n:'LUNAMOTH',t:['Bug','Flying'],b:[70,50,70,80],y:130,cr:120,ls:[[1,'tackle'],[1,'bugbite'],[9,'gust'],[12,'dustwing'],[18,'wingslash']]},
 12:{n:'PEBBLIN',t:['Rock'],b:[40,80,100,20],y:60,cr:180,ev:[20,13],ls:[[1,'tackle'],[1,'rocktoss'],[10,'bite'],[14,'bodyslam']]},
 13:{n:'BOULDERON',t:['Rock'],b:[80,110,120,35],y:137,cr:90,ls:[[1,'tackle'],[1,'rocktoss'],[10,'bite'],[14,'bodyslam'],[20,'boulder']]},
 14:{n:'ZAPKIT',t:['Electric'],b:[35,55,40,90],y:112,cr:120,ls:[[1,'tackle'],[1,'zap'],[8,'quick'],[14,'voltrush']]},
 15:{n:'GLOOMP',t:['Poison'],b:[70,58,52,35],y:70,cr:190,ls:[[1,'tackle'],[1,'sting'],[9,'bite'],[13,'toxicspit']]},
};
const ITEMS={
  potion:{n:'POTION',price:100,heal:20,desc:'Restores 20 HP.'},
  superpotion:{n:'SUPER POTION',price:300,heal:50,desc:'Restores 50 HP.'},
  capsule:{n:'CAPSULE',price:100,ball:1,desc:'Catches wild Moxies.'},
  rarecandy:{n:'RARE CANDY',price:0,rare:1,debug:1,desc:'DEBUG: raises a Moxie 1 level.'},
  ultracandy:{n:'ULTRA RARE CANDY',price:0,ultra:1,debug:1,desc:'DEBUG: maxes a Moxie to LV. 100.'},
  greatcapsule:{n:'GREAT CAPSULE',price:300,ball:1.5,desc:'A better capsule.'},
};
// ---------- creature instances ----------
const statOf=(b,l)=>Math.floor(2*b*l/100)+5;
const hpOf=(b,l)=>Math.floor(2*b*l/100)+l+10;
const expFor=l=>l*l*l;
function calcStats(m){const s=SPECIES[m.sp];m.maxhp=hpOf(s.b[0],m.lvl);m.atk=statOf(s.b[1],m.lvl);m.def=statOf(s.b[2],m.lvl);m.spd=statOf(s.b[3],m.lvl);}
function newMon(sp,lvl){
  const s=SPECIES[sp];
  const known=s.ls.filter(x=>x[0]<=lvl).map(x=>x[1]).filter((v,i,a)=>a.indexOf(v)===i).slice(-4);
  const m={sp,lvl,exp:expFor(lvl),moves:known.map(id=>({id,pp:MOVES[id].pp})),hp:1};
  calcStats(m);m.hp=m.maxhp;return m;
}
const mname=m=>SPECIES[m.sp].n;

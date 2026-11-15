// ---------- story, title, boot ----------
const COUNTER={1:5,3:1,5:3};
const STARTER_INFO={1:'FLICKIT, the FIRE Moxie',3:'SPROUTLE, the GRASS Moxie',5:'DRIBBO, the WATER Moxie'};
async function pickStarter(sp){
  if(G.flags.starter){await say('The orb is empty. Your partner is already by your side.');return;}
  await say(`An orb glows warmly... It holds ${STARTER_INFO[sp]}.`,{keep:true,noWait:true});
  if(!(await yesno({x:170,y:70}))){UI.msg=null;return;}
  UI.msg=null;sfx('win');
  G.party.push(newMon(sp,5));G.flags.starter=sp;
  await say(`${G.name} received ${SPECIES[sp].n}!`);
  await say('PROF. LINDEN: Wonderful choice! Treat it well.');
  await rivalChallenge();
}
async function rivalChallenge(){
  const riv=WLD.actors.find(a=>a.id==='rival'),p=WLD.player;
  const rs=COUNTER[G.flags.starter];
  if(riv){riv.dir=3;await say('NOVA: Hey! I wanted that one! Fine, I\'ll take this one instead.');
    await say('NOVA: Let\'s see who\'s stronger. Battle me, right now!');
    const tr={cls:'RIVAL',name:'NOVA',team:[[rs,5]],reward:150,pre:'I won\'t lose!',lose:'Tch... You got lucky!',post:''};
    const res=await battle({trainer:tr});
    if(res==='lose'){await healParty();await fade(0,12);await say('NOVA: Ha! Too easy... \nPROF. LINDEN: Let me heal your Moxie.');await healParty();}
    else{await say('NOVA: Hmph. Next time I\'ll win!');}
    music('indoor');
    G.flags.rivalBeat=1;
    await say('PROF. LINDEN: Take these CAPSULES! Throw them at wild Moxies to catch them.',{});
    G.items.capsule=(G.items.capsule||0)+5;G.items.potion=(G.items.potion||0)+2;sfx('win');
    await say(`${G.name} received 5 CAPSULES and 2 POTIONS!`);
    await say('PROF. LINDEN: Head north through ROUTE 1 to CINDERFORD CITY. Challenge the GYM there!');
  }
}
async function profTalk(){
  if(!G.flags.starter){await say('PROF. LINDEN: Ah, there you are! Moxies are wild creatures that share our world.');await say('Choose one of the three on the table as your first partner!');}
  else await say('PROF. LINDEN: Head north through ROUTE 1 to CINDERFORD. Catch Moxies along the way, and heal at the CENTER!');
}
async function rivalTalk(){
  if(!G.flags.starter)await say('NOVA: Pfft, you\'re slow. The PROF said you get first pick, so go on already!');
  else await say('NOVA: I\'m going to be the champion of Valdora. Mark my words!');
}
// ---------- scenes ----------
let SCENE=null,logoImg=null;
function makeLogo(){
  const [c,g]=mkCanvas(44,12),keep=ctx;ctx=g;
  for(const [dx,dy] of [[-1,0],[1,0],[0,-1],[0,1],[1,1],[-1,1],[1,-1],[-1,-1]])txt('MOXIE',2+dx,2+dy,'#1c2058',null);
  txt('MOXIE',2,2,'#f8d848',null);ctx=keep;
  g.globalCompositeOperation='source-atop';g.fillStyle='#f07030';g.fillRect(0,7,44,6);g.fillStyle='#ffe888';g.fillRect(0,0,44,4);
  return c;
}
function drawTitle(){
  const sky=['#5aa0e8','#6eb0ee','#84c0f2','#9ccef6','#b4dcf8','#cce8f8','#e0f2f6'];
  sky.forEach((c,i)=>fr(0,i*14,W,14,c));
  for(const [x,y,w] of [[20,18,38],[120,36,50],[190,14,30]]){const xx=((x+T*.15)%(W+60))-30;fr(Math.round(xx),y,w,5,'#fff');fr(Math.round(xx)+6,y-4,w-14,4,'#fff');}
  pell(40,118,80,28,'#4aa046');pell(190,124,90,30,'#5cb858');fr(0,118,W,42,'#78c850');
  for(let y=122;y<H;y+=5)for(let x=((y/5)&1)*8;x<W;x+=16)fr(x,y,6,2,'#88d860');
  if(!logoImg)logoImg=makeLogo();
  ctx.drawImage(logoImg,10,10+Math.round(Math.sin(T/30)*1.5),220,60);
  txtC('EMBER VERSION',76,'#d83828','#fff');
  [1,3,5].forEach((id,i)=>{const s=sprites(id).front;ctx.drawImage(s,34+i*62,100+Math.round(Math.sin(T/14+i*2)*2));});
}
let titleOpts=null;
async function titleScreen(){
  SCENE=drawTitle;music('town');
  await fade(0,20);
  for(;;){
    UI.extra.push(()=>{if((T>>5)&1)txtC('PRESS START',148,'#fff','#303048');});
    const ex=UI.extra[0];await waitHit('start','a');UI.extra.length=0;
    const save=loadSave();
    const opts=save?['CONTINUE','NEW GAME']:['NEW GAME'];
    const c=await choose(opts,{x:70,y:100,cw:84,cancel:false});
    if(save&&c===0){G=save;return 'continue';}
    if(save&&c===1){await say('Start over? Your saved game will be replaced.',{keep:true,noWait:true});if(!(await yesno({x:170,y:70}))){UI.msg=null;continue;}UI.msg=null;}
    return 'new';
  }
}
async function introScene(){
  SCENE=()=>{fr(0,0,W,H,'#b8d8f0');fr(0,96,W,16,'#78c850');pell(120,100,50,6,'#58a840');const s=charSprite('prof',0,0);ctx.drawImage(s,88,16,64,88);};
  music('indoor');await fade(0,16);
  await say('Hello there! Welcome to the world of MOXIES!');
  await say('I\'m PROF. LINDEN of the DEWHOLLOW lab. Moxies are curious creatures that live all over VALDORA.');
  await say('Now, tell me about yourself. Are you a boy or a girl?',{keep:true,noWait:true});
  const g=await choose(['BOY','GIRL'],{x:150,y:60,cancel:false});UI.msg=null;
  const gender=g===0?'boy':'girl';
  await say('And what\'s your name?',{keep:true,noWait:true});
  const names=['KAI','MAYA','SORA','REN','NIA','TAO'];
  const n=await choose(names,{x:150,y:20,cancel:false,rows:6});UI.msg=null;
  G=newGameState(names[n],gender);
  await say(`${G.name}! Right, that suits you.`);
  await say('Your very own MOXIE adventure is about to begin! Come see me at my lab in town!');
  await fade(1,16);
}
async function startPlaying(first){
  SCENE=null;WLD.active=false;
  loadMap(G.map,G.x,G.y,G.dir,true);
  await fade(1,1);await wait(10);WLD.active=true;await fade(0,20);
  if(!first){WLD.banner=WLD.map.name;WLD.bannerT=110;}
  else{await say(`${G.name}'s room. PROF. LINDEN wants to see you at the lab!`);}
}
async function boot(){
  try{await Promise.race([document.fonts.load(FONT),new Promise(r=>setTimeout(r,2500))]);FONT_OK=[...document.fonts].some(f=>f.family.includes('Press Start')&&f.status==='loaded');}catch(e){}
  renderFn=()=>{if(BT.active)drawBattle();else if(WLD.active)drawWorld();else if(SCENE)SCENE();else fr(0,0,W,H,'#000');};
  UI.fade=1;
  requestAnimationFrame(frame);
  worldLoop();npcLoop();
  const r=await titleScreen();
  if(r==='new'){await introScene();await startPlaying(true);}
  else await startPlaying(false);
  autoSave(true);
}
boot();

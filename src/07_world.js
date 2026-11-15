// ---------- overworld ----------
let G=null;
const DX=[0,0,-1,1],DY=[1,-1,0,0],OPP=[1,0,3,2];
const WLD={map:null,mid:'',actors:[],player:null,active:false,busy:false,banner:null,bannerT:0};
function mkActor(o){return Object.assign({x:0,y:0,dir:0,ox:0,oy:0,moving:0,pal:'kid',step:0,prog:0,emote:0},o);}
function newGameState(name,gender){
  return {name,gender,money:500,items:{potion:3},party:[],flags:{},badges:0,steps:0,map:'home',x:4,y:6,dir:1,play:0,v:2,settings:{debug:false,autosave:true}};
}
const tileAt=(x,y)=>{const m=WLD.map;return(x<0||y<0||x>=m.w||y>=m.h)?' ':m.t[y][x];};
const actorAt=(x,y,self)=>WLD.actors.find(a=>a!==self&&a.x===x&&a.y===y);
const blocked=(x,y,self)=>isSolid(tileAt(x,y))||!!actorAt(x,y,self);
function loadMap(id,x,y,dir,quiet){
  const m=MAPS[id];WLD.map=m;WLD.mid=id;G.map=id;
  WLD.actors=[];
  for(const n of m.npcs){if(n.hideIf&&n.hideIf())continue;WLD.actors.push(mkActor({...n,hx:n.x,hy:n.y}));}
  const p=WLD.player=mkActor({x,y,dir,pal:G.gender==='girl'?'girl':'boy',isPlayer:1});
  WLD.actors.push(p);
  music(m.music);
  if(!quiet&&!m.indoor){WLD.banner=m.name;WLD.bannerT=110;}
}
async function walk(a,dir,spd=1){
  a.dir=dir;
  if(blocked(a.x+DX[dir],a.y+DY[dir],a))return false;
  a.x+=DX[dir];a.y+=DY[dir];a.ox=-DX[dir]*16;a.oy=-DY[dir]*16;a.moving=1;a.prog=0;
  while(a.ox||a.oy){a.ox+=DX[dir]*spd;a.oy+=DY[dir]*spd;a.prog+=spd;await tick();}
  a.moving=0;a.step^=1;return true;
}
function drawActor(a,cx,cy){
  const px=a.x*16+a.ox-cx,py=a.y*16+a.oy-cy;
  if(px<-16||py<-20||px>W||py>H)return;
  ctx.drawImage(SHADOW,px,py);
  const f_=a.moving?((Math.floor(a.prog/4)%2===0)?(a.step?1:2):0):0;
  ctx.drawImage(charSprite(a.pal,a.dir,f_),px,py-6);
  {const _t=tileAt(a.x,a.y);if(_t==='"'||_t==='*')ctx.drawImage(TI[_t][0],0,8,16,8,px,py+8,16,8);}
  if(a.emote){fr(px+4,py-14,8,10,'#303048');fr(px+5,py-13,6,8,'#fff');fr(px+7,py-12,2,4,'#d03030');fr(px+7,py-7,2,1,'#d03030');}
}
function drawWorld(){
  const m=WLD.map,p=WLD.player;fr(0,0,W,H,'#101018');
  const mw=m.w*16,mh=m.h*16;
  let cx=p.x*16+p.ox+8-W/2,cy=p.y*16+p.oy+8-H/2;
  cx=mw<=W?-(W-mw)/2:clamp(cx,0,mw-W);cy=mh<=H?-(H-mh)/2:clamp(cy,0,mh-H);
  cx=Math.round(cx);cy=Math.round(cy);
  const wf=(T>>5)&1,list=[];
  for(let ty=Math.max(0,Math.floor(cy/16)-1);ty<=Math.min(m.h-1,Math.floor((cy+H)/16)+1);ty++)
    for(let tx=Math.max(0,Math.floor(cx/16));tx<=Math.min(m.w-1,Math.floor((cx+W)/16));tx++){
      ctx.drawImage(tileImg(m,tx,ty,wf),tx*16-cx,ty*16-cy);
      if(m.t[ty][tx]==='#')list.push({y:ty*16+16,tx,ty});
    }
  for(const a of WLD.actors)list.push({y:a.y*16+a.oy+16+(a.isPlayer?.5:0),a});
  list.sort((u,v)=>u.y-v.y);
  for(const it of list){
    if(it.a)drawActor(it.a,cx,cy);
    else ctx.drawImage(TREES[(it.tx*7+it.ty*13)%2],it.tx*16-cx,it.ty*16-8-cy);
  }
  if(WLD.bannerT>0){WLD.bannerT--;const y=WLD.bannerT>100?-(WLD.bannerT-100)*2:WLD.bannerT<10?-(10-WLD.bannerT)*2:0;
    box(4,2+y,WLD.banner.length*8+16,18);txt(WLD.banner,12,7+y);}
}
const heldDir=()=>held.down?0:held.up?1:held.left?2:held.right?3:-1;
async function worldLoop(){
  let turnWait=0,bump=0,chain=false;
  for(;;){
    if(!WLD.active||WLD.busy){await tick();chain=false;continue;}
    if(FH.select){toggleMute();if(!muted)music(WLD.map.music);}
    if(FH.start){WLD.busy=1;await startMenu();WLD.busy=0;await tick();continue;}
    if(FH.a){WLD.busy=1;await interact();WLD.busy=0;await tick();continue;}
    const d=heldDir(),p=WLD.player;
    if(d<0){turnWait=0;bump=0;chain=false;await tick();continue;}
    if(d!==p.dir&&!chain){p.dir=d;turnWait=6;}
    if(turnWait>0){turnWait--;await tick();continue;}
    const ok=await walk(p,d,held.b?2:1);
    if(!ok){if(bump--<=0){sfx('bump');bump=22;}chain=false;await tick();continue;}
    chain=true;WLD.busy=1;await afterStep();WLD.busy=0;
  }
}
async function npcLoop(){
  for(;;){
    await wait(40);
    if(!WLD.active||WLD.busy)continue;
    for(const a of WLD.actors){
      if(!a.wander||a.moving||a.isPlayer||rnd(3))continue;
      const d=rnd(4),nx=a.x+DX[d],ny=a.y+DY[d];
      if(Math.abs(nx-a.hx)>2||Math.abs(ny-a.hy)>2){a.dir=d;continue;}
      walk(a,d,1);
    }
  }
}
async function afterStep(){
  const p=WLD.player,m=WLD.map;
  const w=m.warps.find(w=>w.x===p.x&&w.y===p.y);
  if(w){await doWarp(w);autoSave(true);return;}
  G.steps++;
  if(m.enc&&(tileAt(p.x,p.y)==='"'||tileAt(p.x,p.y)==='*')&&Math.random()<.1){await wildEncounter();autoSave(true);return;}
  await checkTrainers();autoSave();
}
async function doWarp(w){
  const p=WLD.player;
  if(w.req){const msg=w.req();if(msg){await say(msg);await walk(p,OPP[p.dir],1);return;}}
  sfx('door');await fade(1,12);
  loadMap(w.to,w.tx,w.ty,w.dir);
  await wait(6);await fade(0,12);
}
async function checkTrainers(){
  const p=WLD.player;
  for(const a of WLD.actors){
    if(!a.tr||!a.sight||G.flags['t_'+a.id])continue;
    const dx=p.x-a.x,dy=p.y-a.y,d=a.dir;let dist=0;
    if(d===0&&dx===0&&dy>0)dist=dy;else if(d===1&&dx===0&&dy<0)dist=-dy;else if(d===2&&dy===0&&dx<0)dist=-dx;else if(d===3&&dy===0&&dx>0)dist=dx;
    if(!dist||dist>a.sight)continue;
    let clear=true;for(let i=1;i<dist;i++){const x=a.x+DX[d]*i,y=a.y+DY[d]*i;if(isSolid(tileAt(x,y))||actorAt(x,y,a))clear=false;}
    if(!clear)continue;
    music('battle');sfx('encounter');a.emote=1;await wait(45);a.emote=0;
    for(let i=1;i<dist;i++)await walk(a,d,1);
    p.dir=OPP[a.dir];await wait(10);
    await trainerBattle(a);return;
  }
}
async function trainerBattle(a){
  const tr=a.tr,p=WLD.player;a.dir=OPP[p.dir];
  const tag=`${tr.cls} ${tr.name}:`;
  await say(`${tag}\n${tr.pre}`);
  const res=await battle({trainer:tr});
  if(res==='win'){
    G.flags['t_'+a.id]=1;
    await say(`${tag}\n${tr.lose}`);
    if(a.id==='kiln'){G.flags.badge1=1;G.badges=1;sfx('win');await say(`${G.name} received the EMBER BADGE!`);await say(tr.post);await say('~ To be continued in Valdora... ~\nYou can keep exploring and training!');}
  }else if(res==='lose')await whiteout();
  else music(WLD.map.music);
}
async function interact(){
  const p=WLD.player,tx=p.x+DX[p.dir],ty=p.y+DY[p.dir];
  const ev=WLD.map.events[tx+','+ty];
  if(ev){await ev();return;}
  const n=actorAt(tx,ty,p);
  if(!n)return;
  n.dir=OPP[p.dir];
  if(n.talk)await n.talk();
  else if(n.tr){if(G.flags['t_'+n.id])await say(`${n.tr.name}:\n${n.tr.post}`);else await trainerBattle(n);}
  else if(n.text)for(const t of n.text)await say(t);
}
async function healParty(){for(const m of G.party){m.hp=m.maxhp;m.moves.forEach(mv=>mv.pp=MOVES[mv.id].pp);}}
async function nurseHeal(){
  await say('Welcome to the MOXIE CENTER!\nShall I heal your Moxies?',{keep:1});
  if(await yesno({x:170,y:70})){
    UI.msg=null;await say('Okay, I\'ll take your Moxies for a moment.');
    sfx('heal');await fade(.6,10,'#fff');await wait(50);await fade(0,10);await healParty();
    await say('Thank you for waiting! Your Moxies are fighting fit!');
  }else{UI.msg=null;await say('We hope to see you again!');}
}
async function whiteout(){
  UI.msg=null;await say(`${G.name} is out of usable Moxies!`);await say(`${G.name} blacked out!`);
  await fade(1,20);G.money=Math.floor(G.money/2);await healParty();
  loadMap('home',4,6,1,true);music('indoor');await wait(20);await fade(0,20);
  await say('MOM: Oh dear! You came home all battered. I patched your Moxies up.');
}
async function wildEncounter(){
  const e=WLD.map.enc;let tot=e.reduce((s,x)=>s+x.w,0),r=rnd(tot),pick_=e[0];
  for(const x of e){if(r<x.w){pick_=x;break;}r-=x.w;}
  const lvl=pick_.a+rnd(pick_.b-pick_.a+1);
  sfx('encounter');music('battle');
  const res=await battle({wild:newMon(pick_.s,lvl)});
  if(res==='lose')await whiteout();else if(res!=='stay')music(WLD.map.music);
}

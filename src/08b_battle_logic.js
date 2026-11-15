// ---------- battle: logic ----------
const msg=(t,o={})=>say(t,{auto:38,keep:true,...o});
const expFrac=m=>clamp((m.exp-expFor(m.lvl))/(expFor(m.lvl+1)-expFor(m.lvl)),0,1);
const fname=s=>s==='f'?(BT.wild?'Wild ':'Foe ')+mname(BT.foe):mname(BT.pm());
async function animHP(side){
  const m=side==='f'?BT.foe:BT.pm(),k=side==='f'?'hpF':'hpP';
  while(Math.abs(BT[k]-m.hp)>.01){const st=Math.max(.5,m.maxhp/70);BT[k]=BT[k]>m.hp?Math.max(m.hp,BT[k]-st):Math.min(m.hp,BT[k]+st);await tick();}
  BT[k]=m.hp;
}
async function tweenExp(t){t=isFinite(t)?clamp(t,0,1):0;for(let g=0;g<90&&Math.abs(BT.expD-t)>.005;g++){const d=t-BT.expD;BT.expD+=Math.sign(d)*Math.min(.025,Math.abs(d));await tick();}BT.expD=t;}
function fxBurst(side,col){
  const cx=side==='f'?176:62,cy=side==='f'?40:88;
  for(let i=0;i<22;i++){const a=Math.random()*6.28,v=.6+Math.random()*2.2;BT.fx.push({x:cx,y:cy,vx:Math.cos(a)*v,vy:Math.sin(a)*v,t:0,life:16+rnd(10),s:1+rnd(3),c:col});}
}
async function lunge(side){
  const k=side==='p'?'pOx':'fOx',d=side==='p'?1:-1;
  for(let i=1;i<=6;i++){BT[k]=i*2*d;await tick();}for(let i=6;i>=0;i--){BT[k]=i*2*d;await tick();}BT[k]=0;
}
async function blink(side){const k=side==='p'?'pBlink':'fBlink';for(let i=0;i<4;i++){BT[k]=true;await wait(3);BT[k]=false;await wait(3);}}
async function useMove(side,mv){
  const A=side==='p'?BT.pm():BT.foe,D=side==='p'?BT.foe:BT.pm(),def=MOVES[mv.id],ds=side==='p'?'f':'p';
  if(side==='p'&&!mv.struggle)mv.pp--;
  await msg(`${fname(side)} used\n${def.n}!`,{auto:22});
  if(Math.random()*100>=def.a){await msg(`${fname(side)}'s attack\nmissed!`,{auto:26});return;}
  await lunge(side);
  const eff=typeMult(def.t,SPECIES[D.sp].t),stab=SPECIES[A.sp].t.includes(def.t)?1.5:1,crit=Math.random()<1/16?1.5:1;
  let dmg=Math.floor(((2*A.lvl/5+2)*def.p*A.atk/D.def)/50+2);
  dmg=Math.max(1,Math.floor(dmg*stab*eff*crit*(.85+Math.random()*.15)));
  fxBurst(ds,TYPE_COL[def.t]);await wait(12);
  sfx(eff>1?'super':eff<1?'weak':'hit');await blink(ds);
  D.hp=Math.max(0,D.hp-dmg);await animHP(ds);
  if(crit>1)await msg('A critical hit!',{auto:22});
  if(eff>1)await msg('It\'s super effective!',{auto:26});else if(eff<1)await msg('It\'s not very effective...',{auto:26});
}
function foeMove(){
  const f=BT.foe,pt=SPECIES[BT.pm().sp].t,ws=f.moves.map(m=>{const d=MOVES[m.id];return d.p*typeMult(d.t,pt)*(SPECIES[f.sp].t.includes(d.t)?1.3:1)+5;});
  let r=Math.random()*ws.reduce((a,b)=>a+b,0);for(let i=0;i<ws.length;i++){if(r<ws[i])return f.moves[i];r-=ws[i];}return f.moves[0];
}
async function sink(side){const k=side==='p'?'pSink':'fSink';sfx('faint');for(let i=0;i<=20;i++){BT[k]=i/20;await tick();}BT[side==='p'?'pShow':'fShow']=false;BT[k]=0;}
async function learnMoves(m){
  for(const [lv,id] of SPECIES[m.sp].ls){
    if(lv!==m.lvl||m.moves.some(x=>x.id===id))continue;
    if(m.moves.length<4){m.moves.push({id,pp:MOVES[id].pp});sfx('select');await msg(`${mname(m)} learned\n${MOVES[id].n}!`,{auto:40});}
    else{
      await msg(`${mname(m)} wants to learn\n${MOVES[id].n}.`,{auto:30});
      const prevMsg=UI.msg;UI.msg=null;await say(`Forget a move to make room?`,{keep:true,noWait:true});
      const c=await choose([...m.moves.map(x=>MOVES[x.id].n),'DON\'T LEARN'],{x:100,y:20,cancel:false});
      if(c<m.moves.length){const old=MOVES[m.moves[c].id].n;m.moves[c]={id,pp:MOVES[id].pp};await msg(`1, 2, and... poof!\n${mname(m)} forgot ${old}!`,{auto:50});await msg(`And learned ${MOVES[id].n}!`,{auto:40});}
      else await msg(`${mname(m)} did not learn\n${MOVES[id].n}.`,{auto:40});
    }
  }
}
async function tryEvolve(m){
  const s=SPECIES[m.sp];if(!s.ev||m.lvl<s.ev[0])return false;
  const from=m.sp,to=s.ev[1],inB=!!(BT&&BT.active);
  UI.msg=null;await msg(`What? ${mname(m)} is evolving!`,{auto:40});
  const st={id:from,sil:false};
  const draw=()=>{fr(0,0,W,H,'#000');const sp=sprites(st.id).front;ctx.drawImage(st.sil?silhouette(sp,'#fff'):sp,80,36,80,80);};
  UI.extra.push(draw);
  try{
    for(let i=0;i<18;i++){st.id=i%2?from:to;st.sil=true;sfx('cursor');await wait(5);st.sil=false;await wait(5);}
    const old=m.maxhp,oname=s.n;m.sp=to;calcStats(m);m.hp+=m.maxhp-old;st.id=to;
    if(inB&&BT.pm()===m)BT.hpP=m.hp;
    sfx('level');await wait(30);
    await msg(`${oname} evolved into\n${SPECIES[to].n}!`,{auto:60});
  }finally{UI.extra.splice(UI.extra.indexOf(draw),1);}
  UI.msg=null;
  await learnMoves(m);return true;
}
async function levelUpOnce(m){
  // used by RARE CANDY (debug): +1 level, learn moves, evolve
  if(m.lvl>=100)return false;
  const o=m.maxhp;m.lvl++;m.exp=expFor(m.lvl);calcStats(m);m.hp+=m.maxhp-o;sfx('level');
  await say(`${mname(m)} grew to\nLV. ${m.lvl}!`);
  await learnMoves(m);UI.msg=null;await tryEvolve(m);return true;
}
async function levelTo100(m){
  if(m.lvl>=100)return false;
  m.lvl=100;m.exp=expFor(100);const o=m.maxhp;calcStats(m);m.hp=m.maxhp;sfx('level');
  await say(`${mname(m)} shot up to\nLV. 100!`);
  // keep the four strongest moves it could know by now
  const known=[];for(const [lv,id] of SPECIES[m.sp].ls)if(lv<=100&&!known.includes(id))known.push(id);
  const keep=known.slice(-4);m.moves=keep.map(id=>({id,pp:MOVES[id].pp}));
  for(let g=0;g<4;g++){const s=SPECIES[m.sp];if(!s.ev||m.lvl<s.ev[0])break;UI.msg=null;await tryEvolve(m);
    const k2=[];for(const [lv,id] of SPECIES[m.sp].ls)if(!k2.includes(id))k2.push(id);m.moves=k2.slice(-4).map(id=>({id,pp:MOVES[id].pp}));}
  calcStats(m);m.hp=m.maxhp;UI.msg=null;return true;
}
async function gainExp(m,amt){
  await msg(`${mname(m)} gained\n${amt} EXP. Points!`,{auto:34});
  m.exp+=amt;
  while(m.lvl<100&&m.exp>=expFor(m.lvl+1)){
    await tweenExp(1);m.lvl++;const o=m.maxhp;calcStats(m);m.hp+=m.maxhp-o;BT.hpP=m.hp;BT.expD=0;sfx('level');
    await msg(`${mname(m)} grew to\nLV. ${m.lvl}!`,{auto:40});
    await learnMoves(m);await tryEvolve(m);
  }
  await tweenExp(expFrac(m));
}
async function sendOut(first){
  const pm=BT.pm();BT.hpP=pm.hp;BT.expD=expFrac(pm);
  if(first){await msg(`Go! ${mname(pm)}!`,{auto:20});for(let x=BT.pTrainerX;x>-80;x-=5){BT.pTrainerX=x;await tick();}BT.pTrainer=false;}
  else await msg(`Go! ${mname(pm)}!`,{auto:20});
  sfx('ball');BT.pShow=true;for(let i=1;i<=10;i++){BT.pScale=i/10;await tick();}BT.pScale=1;BT.infoP=true;
}
async function showFoe(){
  BT.foe=BT.foes[BT.fi];BT.hpF=BT.foe.hp;BT.fShow=true;BT.fSink=0;BT.fScale=1;
  for(let x=70;x>=0;x-=5){BT.fOx=x;await tick();}BT.fOx=0;BT.infoF=true;
}
async function foeFainted(){
  await sink('f');BT.infoF=false;
  await msg(`${fname('f')} fainted!`,{auto:34});
  const f=BT.foe,pm=BT.pm(),amt=Math.floor(SPECIES[f.sp].y*f.lvl/7*(BT.tr?1.5:1));
  if(pm.hp>0)await gainExp(pm,Math.max(1,amt));
  if(BT.fi+1<BT.foes.length){
    BT.fi++;await msg(`${BT.tr.name} is about to send out\n${mname(BT.foes[BT.fi])}!`,{auto:34});
    await showFoe();return 'next';
  }
  BT.result='win';return 'end';
}
async function playerFainted(){
  await sink('p');BT.infoP=false;await msg(`${mname(BT.pm())} fainted!`,{auto:34});
  if(!G.party.some(m=>m.hp>0)){BT.result='lose';return 'end';}
  UI.msg=null;
  for(;;){const i=await partyPick('Use which MOXIE?',false);if(i>=0&&G.party[i].hp>0){BT.pi=i;break;}await msg('There\'s no energy left!',{auto:30});}
  await sendOut(false);return 'next';
}
async function switchTo(idx){
  const old=BT.pm();await msg(`${mname(old)}, come back!`,{auto:20});
  for(let i=9;i>=0;i--){BT.pScale=i/10;await tick();}BT.pShow=false;BT.infoP=false;
  BT.pi=idx;BT.pScale=0;await sendOut(false);
}
async function throwCapsule(mul,name){
  const f=BT.foe;await msg(`${G.name} used a\n${name}!`,{auto:20});sfx('ball');
  for(let i=0;i<=22;i++){const t=i/22;BT.ball={x:50+126*t,y:96-60*t-Math.sin(t*Math.PI)*34,r:t*12};await tick();}
  BT.fSil='#ffffff';await wait(4);for(let s=1;s>0;s-=.1){BT.fScale=Math.max(s,.01);await tick();}BT.fShow=false;BT.infoF=false;
  for(let i=0;i<=14;i++){const t=i/14;BT.ball={x:176,y:36+24*t*t,r:0};await tick();}
  for(const dy of [-6,0,-2,0]){for(let i=0;i<6;i++){BT.ball.y=60+dy*(i<3?i/3:(6-i)/3);await tick();}}
  const a=Math.max(1,Math.floor(((3*f.maxhp-2*f.hp)*SPECIES[f.sp].cr*mul)/(3*f.maxhp)));
  let shakes=0;
  if(a>=255)shakes=4;else{const b=Math.floor(1048560/Math.sqrt(Math.sqrt(16711680/a)));for(let i=0;i<4;i++){if(rnd(65536)>=b)break;shakes++;}}
  for(let k=0;k<Math.min(shakes,3);k++){await wait(24);sfx('shake');for(let j=0;j<14;j++){BT.ball.r=Math.sin(j/14*6.28)*.6;await tick();}BT.ball.r=0;}
  if(shakes>=4){
    await wait(20);sfx('catch');fxBurst('f','#ffe860');BT.ball.y=60;await wait(30);
    BT.ball=null;BT.result='caught';
    await msg(`Gotcha!\n${mname(f)} was caught!`,{auto:50});
    if(G.party.length<6)G.party.push(f);else{(G.box=G.box||[]).push(f);await msg(`${mname(f)} was sent\nto the BOX.`,{auto:50});}
    return true;
  }
  sfx('hit');BT.ball=null;BT.fSil=null;BT.fShow=true;BT.infoF=true;for(let s=.1;s<=1;s+=.15){BT.fScale=Math.min(1,s);await tick();}BT.fScale=1;
  await msg(['Oh no! It broke free!','Aww! It appeared to be caught!','Aargh! Almost had it!','Shoot! It was so close!'][shakes],{auto:40});
  return false;
}
async function bagInBattle(){
  const ids=Object.keys(G.items).filter(k=>G.items[k]>0&&(ITEMS[k].heal||ITEMS[k].ball));
  if(!ids.length){UI.msg=null;await msg('You have no usable items.',{auto:30});return null;}
  UI.msg=null;
  const c=await choose(ids.map(k=>[ITEMS[k].n,'x'+G.items[k]]),{x:90,y:50,rows:5});
  if(c<0)return null;const id=ids[c],it=ITEMS[id];
  if(it.ball){
    if(!BT.wild){UI.msg=null;await msg('You can\'t catch another trainer\'s Moxie!',{auto:40});return null;}
    G.items[id]--;return {type:'ball',id};
  }
  const pm=BT.pm();
  if(pm.hp>=pm.maxhp){await msg('It won\'t have any effect.',{auto:30});return null;}
  G.items[id]--;const h=Math.min(it.heal,pm.maxhp-pm.hp);pm.hp+=h;sfx('heal');
  await msg(`${G.name} used a ${it.n}.`,{auto:20});await animHP('p');await msg(`${mname(pm)} recovered\n${h} HP!`,{auto:34});
  return {type:'used'};
}
function moveInfoDraw(){
  const m=UI.menus[UI.menus.length-1];if(!m||!BT.moveList)return;
  const mv=BT.moveList[m.i];if(!mv)return;const d=MOVES[mv.id];
  box(124,112,116,48);txt(d.t.toUpperCase(),132,119,TYPE_COL[d.t],'#00000033');txt(`PP ${mv.pp}/${d.pp}`,132,131);txt(`POWER ${d.p}`,132,143,'#707080',null);
}
async function chooseAction(){
  const pm=BT.pm();
  for(;;){
    UI.msg=null;await say(`What will\n${mname(pm)} do?`,{noWait:true,keep:true,fast:true,box:{x:0,y:112,w:120,h:48}});
    const c=await choose(['FIGHT','BAG','MOXIE','RUN'],{cols:2,x:120,y:112,h:48,cw:56,cancel:false,idx:BT.lastCmd||0});BT.lastCmd=c;
    if(c===0){
      const usable=pm.moves.some(m=>m.pp>0);
      if(!usable)return {type:'move',mv:{id:'tackle',struggle:1}};
      UI.msg=null;BT.moveList=pm.moves;UI.extra.push(moveInfoDraw);
      const n=pm.moves.length,i=await choose(pm.moves.map(m=>MOVES[m.id].n),{x:0,y:160-(n*13+9),cancel:true,cw:106,dis:pm.moves.map(m=>m.pp<=0)});
      UI.extra.splice(UI.extra.indexOf(moveInfoDraw),1);BT.moveList=null;
      if(i<0)continue;if(pm.moves[i].pp<=0){await msg('No PP left for this move!',{auto:30});continue;}
      return {type:'move',mv:pm.moves[i]};
    }
    if(c===1){const r=await bagInBattle();if(r)return r;continue;}
    if(c===2){UI.msg=null;const i=await partyPick('Switch to which?',true);
      if(i<0)continue;if(i===BT.pi){await msg(`${mname(pm)} is already\nin battle!`,{auto:30});continue;}
      if(G.party[i].hp<=0){await msg('There\'s no energy left\nto battle!',{auto:30});continue;}
      return {type:'switch',idx:i};}
    if(c===3){
      if(!BT.wild){await msg('No! There\'s no running\nfrom a trainer battle!',{auto:40});continue;}
      return {type:'run'};
    }
  }
}
async function runTurn(act){
  const fmv=foeMove();let seq=['f'];
  if(act.type==='switch'){await switchTo(act.idx);}
  else if(act.type==='ball'){if(await throwCapsule(ITEMS[act.id].ball,ITEMS[act.id].n))return 'end';}
  else if(act.type==='run'){
    BT.runs=(BT.runs||0)+1;const p=clamp(BT.pm().spd*.7/Math.max(1,BT.foe.spd)+.15*BT.runs,.2,1);
    if(Math.random()<p){sfx('door');await msg('Got away safely!',{auto:30});BT.result='run';return 'end';}
    await msg('Can\'t escape!',{auto:30});
  }
  else if(act.type==='move'){
    const pp=MOVES[act.mv.id].pri||0,fp=MOVES[fmv.id].pri||0,ps=BT.pm().spd,fs=BT.foe.spd;
    const pf=pp>fp||(pp===fp&&(ps>fs||(ps===fs&&Math.random()<.5)));seq=pf?['p','f']:['f','p'];
  }
  for(const s of seq){
    if(s==='p'){
      if(BT.pm().hp<=0)continue;await useMove('p',act.mv);
      if(BT.foe.hp<=0){const r=await foeFainted();if(r==='end')return 'end';break;}
    }else{
      if(BT.foe.hp<=0||BT.pm().hp<=0)continue;await useMove('f',fmv);
      if(BT.pm().hp<=0){const r=await playerFainted();if(r==='end')return 'end';break;}
    }
  }
  return 'go';
}
async function battle(o){
  const wild=!!o.wild,tr=o.trainer||null;
  const foes=wild?[o.wild]:tr.team.map(([s,l])=>newMon(s,l));
  const first=G.party.findIndex(m=>m.hp>0);
  BT={active:false,wild,tr,foes,fi:0,foe:foes[0],pi:first,pm(){return G.party[BT.pi];},
    bg:WLD.map.bg==='grass'?'grass':WLD.map.bg==='gym'?'gym':'room',
    fShow:false,pShow:false,fOx:0,fOy:0,pOx:0,pOy:0,fScale:1,pScale:1,fSink:0,pSink:0,fBlink:false,pBlink:false,fSil:null,pSil:null,
    fx:[],ball:null,infoF:false,infoP:false,hpF:foes[0].hp,hpP:0,expD:0,pTrainer:true,pTrainerX:30,tb:trainerBack(G.gender==='girl'?'girl':'boy'),evo:null,result:null};
  music('battle');await flashScr('#fff',2,3);await fade(1,10);BT.active=true;await wait(8);await fade(0,10);
  if(wild){await showFoe();await msg(`Wild ${mname(BT.foe)}\nappeared!`,{auto:40});}
  else{await msg(`${tr.cls} ${tr.name}\nwould like to battle!`,{auto:50});await msg(`${tr.name} sent out\n${mname(BT.foe)}!`,{auto:30});await showFoe();}
  await sendOut(true);
  for(;;){
    const act=await chooseAction();UI.msg=null;
    const r=await runTurn(act);if(r==='end')break;
  }
  if(BT.result==='win'&&tr){sfx('win');G.money+=tr.reward;await msg(`${G.name} defeated\n${tr.cls} ${tr.name}!`,{auto:50});await msg(`${G.name} got $${tr.reward}\nfor winning!`,{auto:50});}
  const res=BT.result||'lose';
  UI.msg=null;await fade(1,12);BT.active=false;UI.msg=null;await wait(6);
  if(res!=='lose')await fade(0,12);
  return res;
}

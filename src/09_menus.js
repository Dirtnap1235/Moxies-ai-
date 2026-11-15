// ---------- menus: party, summary, bag, shop, save ----------
function typeChip(t,x,y){fr(x,y,38,9,'#303048');fr(x+1,y+1,36,7,TYPE_COL[t]);txt(t.slice(0,5).toUpperCase(),x+3,y+1,'#fff','#00000066');}
function drawParty(sel,title){
  fr(0,0,W,H,'#4c88c8');for(let y=0;y<H;y+=8)for(let x=((y>>3)&1)*8;x<W;x+=16)fr(x,y,8,8,'#5694d4');
  for(let i=0;i<6;i++){
    const m=G.party[i],y=4+i*22;
    if(!m){rr(6,y,228,20,'#34608c');rr(7,y+1,226,18,'#406c98');continue;}
    const dead=m.hp<=0;
    rr(6,y,228,20,'#303048');rr(7,y+1,226,18,i===sel?'#f8e890':dead?'#d8d0d0':'#f0f4fc');
    ctx.save();ctx.beginPath();ctx.rect(8,y+1,24,18);ctx.clip();ctx.drawImage(sprites(m.sp).icon,6,y-5);ctx.restore();
    txt(mname(m),36,y+3);txt('Lv'+m.lvl,36+mname(m).length*8+8,y+3,'#d85a5a',null);
    const f=m.hp/m.maxhp;txt('HP',36,y+12,'#d85a5a',null);bar(54,y+13,90,f,hpColor(f));
    txtR(`${m.hp}/${m.maxhp}`,228,y+12);
    if(i===sel)arrow(2,y+6);
  }
  box(0,134,240,26);txt(title,10,143);
}
async function partyPick(title,cancel=true,start=0){
  let i=start;UI.extra.push(()=>drawParty(i,title));const ex=UI.extra[UI.extra.length-1];
  try{for(;;){await tick();
    if(FH.up&&i>0){i--;sfx('cursor');}if(FH.down&&i<G.party.length-1){i++;sfx('cursor');}
    if(FH.a){sfx('select');return i;}if(FH.b&&cancel){sfx('cursor');return -1;}}}
  finally{UI.extra.splice(UI.extra.indexOf(ex),1);}
}
async function summary(i){
  let idx=i;
  const draw=()=>{
    const m=G.party[idx],s=SPECIES[m.sp];
    fr(0,0,W,H,'#e8e0c0');fr(0,0,W,16,'#c85848');txt('MOXIE SUMMARY',8,4,'#fff','#00000055');
    rr(6,22,80,80,'#303048');rr(7,23,78,78,'#a8d8f0');pell(46,94,30,6,'#78c850');ctx.drawImage(sprites(m.sp).front,22,40);
    txt(s.n,92,22);txt('Lv'+m.lvl,92+s.n.length*8+8,22,'#d85a5a',null);
    s.t.forEach((t,k)=>typeChip(t,92+k*42,35));
    const rows=[['HP',`${m.hp}/${m.maxhp}`],['ATTACK',m.atk],['DEFENSE',m.def],['SPEED',m.spd]];
    rows.forEach((r,k)=>{txt(r[0],92,50+k*11,'#585868',null);txtR(String(r[1]),232,50+k*11);});
    const nx=expFor(m.lvl+1)-m.exp;txt('NEXT LV',92,96,'#585868',null);txtR(String(nx),232,96);
    box(0,108,240,52);
    m.moves.forEach((mv,k)=>{const d=MOVES[mv.id],x=8+(k%2)*116,y=114+Math.floor(k/2)*22;
      txt(d.n,x,y);fr(x,y+10,4,5,TYPE_COL[d.t]);txt(`PP ${mv.pp}/${d.pp}`,x+8,y+10,'#585868',null);});
  };
  UI.extra.push(draw);
  try{for(;;){await tick();
    if(FH.up&&idx>0){idx--;sfx('cursor');}if(FH.down&&idx<G.party.length-1){idx++;sfx('cursor');}
    if(FH.a||FH.b){sfx('cursor');return;}}}
  finally{UI.extra.splice(UI.extra.indexOf(draw),1);}
}
async function partyMenu(){
  let i=0;
  for(;;){
    i=await partyPick('Choose a MOXIE.',true,i);if(i<0)return;
    const c=await choose(['SUMMARY','SWITCH','CANCEL'],{x:150,y:80});
    if(c===0)await summary(i);
    else if(c===1){const j=await partyPick('Move to where?',true,i);if(j>=0&&j!==i){[G.party[i],G.party[j]]=[G.party[j],G.party[i]];}}
  }
}
async function bagMenu(){
  for(;;){
    const ids=Object.keys(G.items).filter(k=>G.items[k]>0&&(!ITEMS[k].debug||(G.settings&&G.settings.debug)));
    if(!ids.length){await say('Your bag is empty.');return;}
    const desc=()=>{const m=UI.menus[UI.menus.length-1];if(!m)return;box(0,112,240,48);txt(ITEMS[ids[m.i]]?wrapText(ITEMS[ids[m.i]].desc,25)[0]:'',10,128);};
    UI.extra.push(desc);
    const c=await choose(ids.map(k=>[ITEMS[k].n,'x'+G.items[k]]),{y:6,rows:6});
    UI.extra.splice(UI.extra.indexOf(desc),1);
    if(c<0)return;const id=ids[c],it=ITEMS[id];
    if(it.heal){
      const i=await partyPick(`Use ${it.n} on which?`,true);if(i<0)continue;
      const m=G.party[i];
      if(m.hp<=0||m.hp>=m.maxhp){await say('It won\'t have any effect.');continue;}
      const h=Math.min(it.heal,m.maxhp-m.hp);m.hp+=h;G.items[id]--;sfx('heal');await say(`${mname(m)} recovered ${h} HP.`);
    }else if(it.ultra){
      const i=await partyPick(`Use ${it.n} on which?`,true);if(i<0)continue;
      if(await levelTo100(G.party[i])){G.items[id]--;UI.msg=null;}else await say('It won\'t have any effect.');
    }else if(it.rare){
      const i=await partyPick(`Use ${it.n} on which?`,true);if(i<0)continue;
      if(await levelUpOnce(G.party[i])){G.items[id]--;UI.msg=null;}else await say('It won\'t have any effect.');
    }else await say('This can only be used in a battle.');
  }
}
async function shop(){
  const money=()=>{box(150,4,86,20);txt('$'+G.money,158,10);};
  await say('Welcome to the MOXIE MART!\nHow may I help you?',{keep:true,noWait:true});
  UI.extra.push(money);
  try{
    for(;;){
      const c=await choose(['BUY','SELL','QUIT'],{x:4,y:4,cw:56});
      if(c===0){
        const stock=['potion','superpotion','capsule','greatcapsule'];
        const i=await choose(stock.map(k=>[ITEMS[k].n,'$'+ITEMS[k].price]),{x:20,y:30,cw:150});
        if(i<0)continue;const id=stock[i],it=ITEMS[id];let q=1;
        UI.msg=null;
        const qd=()=>{box(40,90,150,22);txt(`${it.n} x${q}`,48,96);txtR('$'+it.price*q,182,96);};
        UI.extra.push(qd);let ok=false;
        for(;;){await tick();if(FH.up&&q<99)q++;if(FH.down&&q>1)q--;if(FH.right&&q<95)q+=5;if(FH.left&&q>5)q-=5;if(FH.a){ok=true;break;}if(FH.b)break;}
        UI.extra.splice(UI.extra.indexOf(qd),1);
        if(!ok)continue;
        if(G.money<it.price*q){await say('You don\'t have enough money.',{keep:true});continue;}
        G.money-=it.price*q;G.items[id]=(G.items[id]||0)+q;sfx('buy');
        await say(`Here you go! Thank you!`,{keep:true});
      }else if(c===1){
        const ids=Object.keys(G.items).filter(k=>G.items[k]>0&&(!ITEMS[k].debug||(G.settings&&G.settings.debug)));
        if(!ids.length){await say('You have nothing to sell.',{keep:true});continue;}
        const i=await choose(ids.map(k=>[ITEMS[k].n,'x'+G.items[k]]),{x:20,y:30,rows:5});
        if(i<0)continue;const id=ids[i],p=Math.floor(ITEMS[id].price/2);
        G.items[id]--;G.money+=p;sfx('buy');await say(`I'll take that for $${p}.`,{keep:true});
      }else break;
    }
  }finally{UI.extra.splice(UI.extra.indexOf(money),1);}
  UI.msg=null;await say('Please come again!');
}
// ---------- save / load ----------
const SAVE_KEY='moxie_ember_save_v1',SAVE_BAK='moxie_ember_save_bak';
const SAVE_VER=2;
function normalizeSave(s){
  // upgrades older saves so new game versions never wipe progress
  const d=newGameState(s.name||'KAI',s.gender||'boy');
  const g=Object.assign({},d,s);
  g.items=Object.assign({},s.items||{});g.flags=Object.assign({},s.flags||{});
  g.settings=Object.assign({debug:false,autosave:true},s.settings||{});
  g.party=(s.party||[]).filter(m=>m&&SPECIES[m.sp]).map(m=>{
    const lvl=clamp(m.lvl|0||1,1,100),n=newMon(m.sp,lvl);
    const mv=(m.moves||[]).filter(x=>x&&MOVES[x.id]).map(x=>({id:x.id,pp:clamp(x.pp??MOVES[x.id].pp,0,MOVES[x.id].pp)}));
    const o=Object.assign(n,m,{lvl,moves:mv.length?mv.slice(0,4):n.moves});
    calcStats(o);o.hp=clamp(m.hp??o.maxhp,0,o.maxhp);if(!(o.exp>=expFor(lvl)))o.exp=expFor(lvl);return o;});
  if(!MAPS[g.map]){g.map='home';g.x=4;g.y=6;g.dir=1;}
  g.v=SAVE_VER;return g;
}
function saveGame(){
  try{
    if(!G||!WLD.player)return false;
    const p=WLD.player;G.map=WLD.mid;G.x=p.x;G.y=p.y;G.dir=p.dir;G.v=SAVE_VER;
    const j=JSON.stringify(G);
    try{const old=localStorage.getItem(SAVE_KEY);if(old&&old!==j)localStorage.setItem(SAVE_BAK,old);}catch(e){}
    localStorage.setItem(SAVE_KEY,j);return true;
  }catch(e){return false;}
}
let _lastAuto=0;
function autoSave(force){
  if(!G||!WLD.active||BT.active||!(G.settings?G.settings.autosave:true))return;
  const now=Date.now();if(!force&&now-_lastAuto<1500)return;_lastAuto=now;saveGame();
}
addEventListener('pagehide',()=>{if(G&&WLD.active&&!BT.active)saveGame();});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&G&&WLD.active&&!BT.active)saveGame();});
function loadSave(){
  for(const k of [SAVE_KEY,SAVE_BAK]){
    try{const s=localStorage.getItem(k);if(s){const o=JSON.parse(s);if(o&&o.party)return normalizeSave(o);}}catch(e){}
  }
  return null;
}
async function settingsMenu(){
  const st=G.settings=Object.assign({debug:false,autosave:true},G.settings||{});
  let idx=0;
  for(;;){
    const opts=['BAG','SAVE GAME','AUTOSAVE: '+(st.autosave?'ON':'OFF'),'SOUND: '+(muted?'OFF':'ON'),'DEBUG MODE: '+(st.debug?'ON':'OFF')];
    if(st.debug)opts.push('DEBUG TOOLS');
    opts.push('ERASE SAVE','BACK');
    const c=await choose(opts,{x:20,y:6,idx,cw:200,rows:Math.min(opts.length,7),cancel:true});
    if(c<0||opts[c]==='BACK')return;idx=c;
    const o=opts[c];
    if(o==='BAG')await bagMenu();
    else if(o==='SAVE GAME'){const ok=saveGame();sfx(ok?'win':'bump');await say(ok?`${G.name} saved the game!`:'Saving isn\'t available here.');}
    else if(o.startsWith('AUTOSAVE')){st.autosave=!st.autosave;saveGame();}
    else if(o.startsWith('SOUND')){toggleMute();if(!muted)music(WLD.map.music);}
    else if(o.startsWith('DEBUG MODE')){
      st.debug=!st.debug;
      if(st.debug){if(!G.items.rarecandy)G.items.rarecandy=99;if(!G.items.ultracandy)G.items.ultracandy=10;await say('Debug mode ON.\nRARE CANDY x99 and ULTRA RARE CANDY x10 added to your BAG!');}
      else{await say('Debug mode OFF.');}
      saveGame();
    }
    else if(o==='DEBUG TOOLS')await debugMenu();
    else if(o==='ERASE SAVE'){
      await say('Erase your saved game? This cannot be undone.',{keep:true,noWait:true});
      if(await yesno({x:170,y:70})){UI.msg=null;try{localStorage.removeItem(SAVE_KEY);localStorage.removeItem(SAVE_BAK);}catch(e){}
        G.settings.autosave=false;await say('Save erased. Reload the page to start over.');}else UI.msg=null;
    }
  }
}
async function debugMenu(){
  let idx=0;
  for(;;){
    const opts=['RARE CANDY +10','ULTRA CANDY +5','HEAL PARTY','+$1000','ADD CAPSULES x10','WARP: DEWHOLLOW','WARP: ROUTE 1','WARP: CINDERFORD','BACK'];
    const c=await choose(opts,{x:20,y:6,idx,cw:200,rows:7});
    if(c<0||c===8)return;idx=c;
    if(c===0){G.items.rarecandy=(G.items.rarecandy||0)+10;sfx('buy');}
    else if(c===1){G.items.ultracandy=(G.items.ultracandy||0)+5;sfx('buy');}
    else if(c===2){await healParty();sfx('heal');await say('Party healed.');}
    else if(c===3){G.money+=1000;sfx('buy');}
    else if(c===4){G.items.capsule=(G.items.capsule||0)+10;sfx('buy');}
    else{const w=[['dew',12,3],['route1',12,31],['cinder',14,21]][c-5];
      WLD.busy=1;await fade(1,10);loadMap(w[0],w[1],w[2],1);await wait(4);await fade(0,10);saveGame();return 'warped';}
  }
}
async function startMenu(){
  sfx('select');
  const info=()=>{box(4,4,100,52);txt(G.name,12,11);txt('BADGES '+G.badges,12,24,'#585868',null);txt('$'+G.money,12,37,'#585868',null);};
  UI.extra.push(info);
  try{
    let idx=0;
    for(;;){
      const opts=['MOXIE','BAG','SAVE','SETTINGS','CLOSE'];
      const c=await choose(opts,{x:164,y:4,idx,cw:60});idx=Math.max(0,c);
      if(c<0||c===4)return;
      UI.extra.splice(UI.extra.indexOf(info),1);
      if(c===0)await partyMenu();
      else if(c===1)await bagMenu();
      else if(c===2){await say('Save your progress?',{keep:true,noWait:true});
        if(await yesno({x:164,y:80})){UI.msg=null;const ok=saveGame();sfx(ok?'win':'bump');await say(ok?`${G.name} saved the game!`:'Saving isn\'t available here.');}else UI.msg=null;}
      else if(c===3){await settingsMenu();}
      UI.extra.push(info);
    }
  }finally{const k=UI.extra.indexOf(info);if(k>=0)UI.extra.splice(k,1);}
}

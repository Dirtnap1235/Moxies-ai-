// ---------- battle: rendering ----------
let BT={active:false};
function pell(cx,cy,rx,ry,col){ctx.fillStyle=col;for(let y=-ry;y<=ry;y++){const w=Math.round(rx*Math.sqrt(1-(y*y)/(ry*ry+.01)));ctx.fillRect(cx-w,cy+y,w*2,1);}}
function platform(cx,cy,rx,ry,top,side,hi){pell(cx,cy+3,rx,ry,side);pell(cx,cy,rx,ry,top);pell(cx,cy-1,Math.round(rx*.72),Math.round(ry*.6),hi);}
function drawBG(){
  const bg=BT.bg;
  if(bg==='grass'){
    const sky=['#86c8f0','#98d2f4','#aadcf6','#bce6f8','#d0f0f6','#e0f6ee'];
    sky.forEach((c,i)=>fr(0,i*9,W,9,c));
    for(const [x,r] of [[10,10],[36,13],[70,9],[100,14],[140,10],[176,13],[210,11],[236,9]]){pell(x,56,r,r-3,'#4aa046');pell(x,57,r-2,r-5,'#5cb858');}
    fr(0,54,W,58,'#74c64e');
    for(let y=58;y<112;y+=4)for(let x=((y>>2)&1)*8;x<W;x+=16)fr(x,y,8,2,'#82d25a');
  }else if(bg==='gym'){
    fr(0,0,W,112,'#a8a098');for(let y=0;y<56;y+=8)for(let x=((y>>3)&1)*12;x<W;x+=24)fr(x,y,12,8,'#b4aca4');
    fr(0,56,W,56,'#8c8478');for(let y=56;y<112;y+=8)for(let x=((y>>3)&1)*16;x<W;x+=32)fr(x,y,16,8,'#968e82');
    fr(0,54,W,3,'#6c6458');
  }else{
    fr(0,0,W,56,'#e8dcc0');fr(0,56,W,56,'#c89c60');for(let y=60;y<112;y+=10)fr(0,y,W,1,'#b08848');fr(0,54,W,3,'#8a6a40');
  }
}
function drawBall(x,y,rot=0){
  const r=[[0,0],[1,0],[-1,0],[0,1],[0,-1]];ctx.save();ctx.translate(x,y);ctx.rotate(rot);
  ctx.fillStyle='#262634';ctx.fillRect(-5,-5,10,10);ctx.fillStyle='#e04848';ctx.fillRect(-4,-4,8,4);ctx.fillStyle='#f4f4f4';ctx.fillRect(-4,1,8,3);
  ctx.fillStyle='#262634';ctx.fillRect(-4,-1,8,2);ctx.fillStyle='#fff';ctx.fillRect(-1,-1,2,2);ctx.fillStyle='#f8a0a0';ctx.fillRect(-3,-3,2,1);ctx.restore();
}
function drawInfo(side){
  const b=BT,m=side==='f'?b.foe:b.pm(),hd=side==='f'?b.hpF:b.hpP;
  if(!m)return;
  const x=side==='f'?5:122,y=side==='f'?9:74,w=side==='f'?108:114,h=side==='f'?32:36;
  rr(x,y,w,h,'#303048');rr(x+1,y+1,w-2,h-2,'#f8f0d8');rr(x+2,y+2,w-4,h-4,'#fffaf0');
  txt(mname(m),x+8,y+6);if(side==='f')txtR('L'+m.lvl,x+w-6,y+h-13);else txt('Lv'+m.lvl,x+8,y+h-11);
  txt('HP',x+8,y+h-(side==='f'?13:19),'#d85a5a',null);
  const f=hd/m.maxhp;bar(x+26,y+h-(side==='f'?12:18),side==='f'?w-70:w-40,f,hpColor(f));
  if(side==='p'){txtR(`${Math.ceil(hd)}/${m.maxhp}`,x+w-8,y+h-11);
    fr(x+8,y+h-4,w-16,2,'#383848');fr(x+9,y+h-4,Math.round((w-18)*clamp(b.expD,0,1)),1,'#58a8f0');}
}
function drawBattle(){
  const b=BT;drawBG();
  b.fx=b.fx.filter(p=>{p.x+=p.vx;p.y+=p.vy;p.t++;return p.t<p.life;});
  platform(176,66,46,8,'#7cd058','#4a9a38','#98e472');platform(62,110,56,9,'#7cd058','#4a9a38','#98e472');
  // foe
  if(b.foe&&b.fShow){
    const s=sprites(b.foe.sp).front;let img=b.fSil?silhouette(s,b.fSil):s;
    const sc=b.fScale,w=FS*sc,h=FS*sc,x=176-w/2+b.fOx,y=66-h+4+b.fOy+(b.fSink?b.fSink*44:0);
    if(!b.fBlink){ctx.save();ctx.beginPath();ctx.rect(0,0,W,66+(b.fSink?0:30));ctx.clip();ctx.drawImage(img,Math.round(x),Math.round(y),Math.round(w),Math.round(h));ctx.restore();}
  }
  // player side
  if(b.pTrainer!==false&&b.pTrainerX>-80){ctx.drawImage(b.tb,Math.round(b.pTrainerX),48);}
  const pm=b.pm();
  if(pm&&b.pShow){
    const s=sprites(pm.sp).back,img=b.pSil?silhouette(s,b.pSil):s,sc=b.pScale,w=BS*sc,h=BS*sc;
    const x=62-w/2+b.pOx,y=112-h+b.pOy+(b.pSink?b.pSink*50:0);
    if(!b.pBlink){ctx.save();ctx.beginPath();ctx.rect(0,0,W,112);ctx.clip();ctx.drawImage(img,Math.round(x),Math.round(y),Math.round(w),Math.round(h));ctx.restore();}
  }
  for(const p of b.fx){ctx.globalAlpha=clamp(1-p.t/p.life,0,1);fr(Math.round(p.x),Math.round(p.y),p.s,p.s,p.c);}
  ctx.globalAlpha=1;
  if(b.ball)drawBall(b.ball.x,b.ball.y,b.ball.r||0);
  if(b.infoF)drawInfo('f');if(b.infoP)drawInfo('p');
  if(!UI.msg&&!b.noBox)box(TB.x,TB.y,TB.w,TB.h);
  
}

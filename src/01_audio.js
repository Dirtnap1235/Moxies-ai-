// ---------- chiptune audio ----------
let ac=null,master=null,muted=false,curSong=null,songStep=0,nextT=0,schedTimer=0;
function initAudio(){
  if(ac){if(ac.state==='suspended')ac.resume();return;}
  try{const AC=window.AudioContext||window.webkitAudioContext;ac=new AC();master=ac.createGain();master.gain.value=muted?0:.16;master.connect(ac.destination);
    schedTimer=setInterval(sched,40);}catch(e){ac=null;}
}
const NN={C:0,D:2,E:4,F:5,G:7,A:9,B:11};
function freq(n){const m=/^([A-G])(#|b)?(\d)$/.exec(n);if(!m)return 0;const s=12*(+m[3]+1)+NN[m[1]]+(m[2]==='#'?1:m[2]==='b'?-1:0);return 440*Math.pow(2,(s-69)/12);}
function tone(f,t,d,type='square',v=.5,slide=0){
  if(!ac||!f)return;const o=ac.createOscillator(),g=ac.createGain();
  o.type=type;o.frequency.setValueAtTime(f,t);if(slide)o.frequency.exponentialRampToValueAtTime(slide,t+d);
  g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(v,t+.008);g.gain.exponentialRampToValueAtTime(.0001,t+d);
  o.connect(g);g.connect(master);o.start(t);o.stop(t+d+.02);
}
function noise(t,d,v=.4){
  if(!ac)return;const n=ac.sampleRate*d,b=ac.createBuffer(1,n,ac.sampleRate),a=b.getChannelData(0);
  for(let i=0;i<n;i++)a[i]=(Math.random()*2-1)*(1-i/n);
  const s=ac.createBufferSource(),g=ac.createGain();s.buffer=b;g.gain.value=v;s.connect(g);g.connect(master);s.start(t);
}
function arp(notes,step=.07,type='square',v=.4){if(!ac)return;let t=ac.currentTime;for(const n of notes){tone(freq(n),t,step*1.6,type,v);t+=step;}}
const SFX={
  cursor:()=>tone(1100,ac.currentTime,.04,'square',.25),
  select:()=>{tone(880,ac.currentTime,.06,'square',.3);},
  bump:()=>tone(120,ac.currentTime,.07,'square',.35,70),
  door:()=>{const t=ac.currentTime;tone(300,t,.12,'square',.3,600);tone(600,t+.1,.1,'square',.25,300);},
  hit:()=>{noise(ac.currentTime,.12,.5);tone(200,ac.currentTime,.1,'square',.4,60);},
  super:()=>{noise(ac.currentTime,.2,.6);tone(300,ac.currentTime,.18,'square',.5,50);tone(150,ac.currentTime,.2,'sawtooth',.3,40);},
  weak:()=>{tone(160,ac.currentTime,.1,'square',.25,100);},
  faint:()=>tone(520,ac.currentTime,.7,'sawtooth',.35,50),
  level:()=>arp(['C5','E5','G5','C6','E6'],.08),
  heal:()=>arp(['C5','E5','G5','C6','G5','C6'],.11,'square',.35),
  catch:()=>arp(['E5','G5','C6','E6','G6'],.09),
  ball:()=>tone(400,ac.currentTime,.1,'square',.3,800),
  shake:()=>{tone(200,ac.currentTime,.08,'square',.3,150);},
  win:()=>arp(['G4','C5','E5','G5','E5','G5','C6'],.12),
  buy:()=>arp(['E5','A5'],.06),
  encounter:()=>{const t=ac.currentTime;for(let i=0;i<6;i++)tone(300+i*80,t+i*.05,.06,'square',.3);},
};
function sfx(n){if(!ac||muted)return;try{SFX[n]&&SFX[n]();}catch(e){}}
const SONGS={
 town:{bpm:124,mel:'E5 - G5 - C6 - B5 G5 | A5 - F5 - A5 - G5 - | E5 - G5 - C6 - D6 E6 | D6 - B5 - G5 - - - | F5 - A5 - C6 - B5 A5 | G5 - E5 - G5 - E5 - | D5 - F5 - A5 - G5 F5 | E5 - - - - - - -',
        bas:'C3 - G3 - C3 - G3 - | F3 - C4 - F3 - C4 - | C3 - G3 - C3 - G3 - | G3 - D4 - G3 - D4 - | F3 - C4 - F3 - C4 - | C3 - G3 - C3 - G3 - | D3 - A3 - D3 - A3 - | G3 - D4 - C3 - - -'},
 route:{bpm:136,mel:'A4 - C5 - E5 - D5 C5 | B4 - D5 - G5 - F5 E5 | A4 - C5 - E5 - A5 G5 | F5 - E5 - D5 - - - | C5 - E5 - G5 - F5 E5 | D5 - F5 - A5 - G5 F5 | E5 - G5 - C6 - B5 A5 | G5 - - - A5 - - -',
        bas:'A2 - E3 - A2 - E3 - | G2 - D3 - G2 - D3 - | A2 - E3 - A2 - E3 - | D3 - A3 - D3 - A3 - | C3 - G3 - C3 - G3 - | D3 - A3 - D3 - A3 - | C3 - G3 - A2 - E3 - | G2 - D3 - A2 - - -'},
 battle:{bpm:166,mel:'E5 E5 - E5 G5 - E5 - | D5 D5 - D5 F5 - D5 - | C5 C5 - C5 E5 - C5 - | B4 - D5 - F#5 - A5 - | E5 E5 - E5 G5 - B5 - | A5 - G5 - F5 - E5 - | D5 - E5 - F5 - G5 - | E5 - - - B4 - - -',
        bas:'E2 E3 E2 E3 E2 E3 E2 E3 | D2 D3 D2 D3 D2 D3 D2 D3 | C2 C3 C2 C3 C2 C3 C2 C3 | B1 B2 B1 B2 B1 B2 B1 B2 | E2 E3 E2 E3 E2 E3 E2 E3 | A1 A2 A1 A2 A1 A2 A1 A2 | D2 D3 D2 D3 D2 D3 D2 D3 | E2 E3 E2 E3 B1 B2 B1 B2'},
 indoor:{bpm:96,mel:'C5 - E5 - G5 - E5 - | F5 - A5 - C6 - A5 - | G5 - E5 - C5 - E5 - | D5 - - - - - - -',
        bas:'C3 - - - G3 - - - | F3 - - - C4 - - - | C3 - - - G3 - - - | G3 - - - - - - -'},
 gym:{bpm:150,mel:'D5 - D5 F5 A5 - F5 - | G5 - G5 A5 C6 - A5 - | F5 - F5 A5 D6 - C6 - | A5 - G5 - F5 - D5 - ',
      bas:'D2 D3 D2 D3 D2 D3 D2 D3 | G2 G3 G2 G3 G2 G3 G2 G3 | F2 F3 F2 F3 F2 F3 F2 F3 | A2 A3 A2 A3 D2 D3 D2 D3'},
};
for(const s of Object.values(SONGS)){s.m=s.mel.split(/[\s|]+/).filter(Boolean);s.b=s.bas.split(/[\s|]+/).filter(Boolean);}
let wantSong=null;
function music(name){wantSong=name;if(curSong===SONGS[name])return;curSong=SONGS[name]||null;songStep=0;if(ac)nextT=ac.currentTime+.05;}
function sched(){
  if(!ac||!curSong||muted)return;
  const dur=60/curSong.bpm/2;
  if(nextT<ac.currentTime-.2)nextT=ac.currentTime+.05;
  while(nextT<ac.currentTime+.18){
    const m=curSong.m[songStep%curSong.m.length],b=curSong.b[songStep%curSong.b.length];
    if(m!=='-')tone(freq(m),nextT,dur*1.7,'square',.22);
    if(b!=='-')tone(freq(b),nextT,dur*1.9,'triangle',.5);
    nextT+=dur;songStep++;
  }
}
function toggleMute(){muted=!muted;if(master)master.gain.value=muted?0:.16;}

(()=>{
const $=id=>document.getElementById(id),machine=$('machine'),lever=$('lever'),draw=$('draw');
let bag=[],current=-1,busy=false,muted=false,audio,voices=[],dragStart=null,dragged=false,lastDrag=0;
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const reelStrip=document.querySelector('.reel-motion > div');
const reelWords=lexicon.slice(0,18).map(x=>'„'+x.phrase+'“');
reelStrip.replaceChildren(...[...reelWords,...reelWords].map(word=>{const line=document.createElement('span');line.textContent=word;return line}));

const stage=$('fritz-stage');
let videoGeneration=0;
function showVideo(kind){
 const generation=++videoGeneration;
 if(reduced)kind='idle';
 const incoming=stage.querySelector('[data-kind="'+kind+'"]');
 const reveal=()=>{if(generation!==videoGeneration)return;stage.dataset.state=kind;for(const layer of stage.querySelectorAll('.fritz-layer'))layer.classList.toggle('is-visible',layer===incoming);setTimeout(()=>{if(generation!==videoGeneration)return;for(const v of stage.querySelectorAll('.fritz-layer:not(.is-visible) video'))v.pause()},480)};
 if(kind==='idle'){reveal();return}
 const videos=[...incoming.querySelectorAll('video')].map(previous=>{const fresh=previous.cloneNode(true);fresh.muted=true;previous.pause();previous.replaceWith(fresh);return fresh});
 // Media is optional decoration: seeking/playback must never block the game.
 try{
  for(const v of videos)v.muted=true;
  Promise.all(videos.map(v=>Promise.resolve(v.play()))).then(reveal).catch(()=>{if(generation===videoGeneration)showVideo('idle')});
 }catch(error){if(generation===videoGeneration)showVideo('idle')}
}
stage.addEventListener('ended',event=>{if(event.target.id==='fritz-result'&&stage.dataset.state==='result')showVideo('idle')},true);
function tone(freq,start,duration,type='sine',volume=.035){if(muted||!audio)return;const o=audio.createOscillator(),g=audio.createGain();o.type=type;o.frequency.setValueAtTime(freq,start);g.gain.setValueAtTime(0,start);g.gain.linearRampToValueAtTime(volume,start+.008);g.gain.exponentialRampToValueAtTime(.0001,start+duration);o.connect(g);g.connect(audio.destination);o.start(start);o.stop(start+duration+.01);voices.push(o);o.onended=()=>{voices=voices.filter(v=>v!==o);o.disconnect();g.disconnect()}}
function stopSound(){for(const o of voices){try{o.stop()}catch(e){}}voices=[]}
function startSound(duration){if(muted)return;try{audio=audio||new(window.AudioContext||window.webkitAudioContext)();audio.resume();const t=audio.currentTime;tone(100,t,.12,'triangle',.09);for(let d=.09;d<duration-.14;d+=.075+d*.055)tone(220+Math.random()*170,t+d,.035,'square',.018);[659,830,988].forEach((f,i)=>tone(f,t+duration+i*.08,.3,'sine',.055))}catch(e){$('sound').textContent='TON NICHT VERFÜGBAR';$('sound').setAttribute('aria-label','Ton ist in diesem Browser nicht verfügbar')}}
function refill(){bag=lexicon.map((_,i)=>i);for(let i=bag.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[bag[i],bag[j]]=[bag[j],bag[i]]}if(bag.length>1&&bag.at(-1)===current)[bag[0],bag[bag.length-1]]=[bag.at(-1),bag[0]]}
function spin(){
 if(busy)return;
 if(!bag.length)refill();
 current=bag.pop();
 const x=lexicon[current],duration=reduced?220:2000;
 busy=true;draw.disabled=true;lever.setAttribute('aria-disabled','true');
 machine.classList.remove('landed','spinning');
 void machine.offsetWidth;
 machine.classList.add('spinning');
 $('pair').setAttribute('aria-busy','true');$('status').textContent='DIE FLOSKEL DREHT SICH …';
 lever.style.setProperty('--pull','105px');
 // Schedule completion BEFORE starting optional audio or video.
 setTimeout(()=>{
  try{
   $('quote').textContent='„'+x.phrase+'“';$('translation').textContent=x.translation;
   $('speaker').textContent=x.speaker;$('position').textContent=(lexicon.length-bag.length)+' / '+lexicon.length;
   $('context').textContent=x.context;$('source').href=x.source;
   $('status').textContent='KLARTEXT. BITTE SEHR.';
  }finally{
   machine.classList.remove('spinning');machine.classList.add('landed');
   $('pair').setAttribute('aria-busy','false');draw.disabled=false;lever.removeAttribute('aria-disabled');busy=false;
  }
  showVideo('result');
 },duration);
 setTimeout(()=>lever.style.setProperty('--pull','0px'),300);
 showVideo('spin');startSound(duration/1000);
}
lever.addEventListener('pointerdown',e=>{if(busy||e.button!==0)return;dragStart=e.clientY;dragged=false;lever.setPointerCapture(e.pointerId)});
lever.addEventListener('pointermove',e=>{if(dragStart===null)return;const distance=Math.max(0,Math.min(105,e.clientY-dragStart));if(distance>8)dragged=true;lever.style.setProperty('--pull',distance+'px')});
lever.addEventListener('pointerup',()=>{if(dragStart===null)return;dragStart=null;lever.style.setProperty('--pull','0px');if(dragged){lastDrag=performance.now();spin()}});
lever.addEventListener('pointercancel',()=>{dragStart=null;lever.style.setProperty('--pull','0px')});
lever.addEventListener('click',e=>{if(e.detail!==0&&performance.now()-lastDrag<400)return;spin()});draw.addEventListener('click',spin);
const initial=lexicon[0];$('quote').textContent='„'+initial.phrase+'“';$('translation').textContent=initial.translation;$('speaker').textContent=initial.speaker;$('context').textContent=initial.context;$('source').href=initial.source;
$('sound').addEventListener('click',()=>{muted=!muted;$('sound').textContent=muted?'♪ TON AUS':'♪ TON AN';$('sound').setAttribute('aria-pressed',String(!muted));$('sound').setAttribute('aria-label',muted?'Ton einschalten':'Ton ausschalten');if(muted)stopSound()});
})();

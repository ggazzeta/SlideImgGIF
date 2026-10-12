import {performance} from 'node:perf_hooks';

export const FRAME_FPS=10, BACKLOG_BYTES=1024*1024;
export function frameAt(media,elapsed){
  const delays=media.delays.map(delay=>delay>0?delay:100),cycle=delays.reduce((a,b)=>a+b,0);
  if(media.loop>0 && elapsed>=cycle*media.loop)return {index:media.frames.length-1,done:true};
  let time=Math.max(0,elapsed)%cycle;
  for(let index=0;index<delays.length;index++){if(time<delays[index])return {index,done:false};time-=delays[index];}
  return {index:delays.length-1,done:false};
}

// One shared deadline pump for every active context. Each media object is decoded only once.
export class AnimationPlayer {
  constructor({client,timerApi=globalThis,now=()=>performance.now()}={}){this.client=client;this.timerApi=timerApi;this.now=now;this.contexts=new Map();this.timer=null;this.deadline=0;this.stats={sent:0,dropped:0};}
  display(context,media,backend='native',force=false){
    const previous=this.contexts.get(context);
    if(!force&&previous?.signature===media.signature&&previous.backend===backend)return;
    this.remove(context,false);
    const state={media,signature:media.signature,backend,start:this.now(),lastFrame:-1,done:false};
    if(media.kind==='gif'&&backend==='native')this.client.setGifDataIcon(context,media.gifdata,'');
    else if(media.kind==='gif'&&backend==='frames'){
      this.contexts.set(context,state);this.pump();this.schedule();return;
    }else this.client.setBaseDataIcon(context,media.dataUri,'');
    this.contexts.set(context,state);
  }
  pump(){
    for(const [context,state] of this.contexts){
      if(state.backend!=='frames'||state.media.kind!=='gif'||state.done)continue;
      const {index,done}=frameAt(state.media,this.now()-state.start);
      if(index===state.lastFrame){state.done=done;continue;}
      const data=state.media.frames[index],bytes=Buffer.byteLength(data)+1024;
      if(this.client.canSendFrame && !this.client.canSendFrame(bytes,BACKLOG_BYTES)){this.stats.dropped++;continue;}
      try{this.client.setBaseDataIcon(context,data,'');state.lastFrame=index;state.done=done;this.stats.sent++;}catch{this.stats.dropped++;}
    }
  }
  schedule(){
    if(this.timer||![...this.contexts.values()].some(s=>s.backend==='frames'&&s.media.kind==='gif'&&!s.done))return;
    const time=this.now(),period=1000/FRAME_FPS;
    this.deadline=this.deadline>time?this.deadline:time+period;
    this.timer=this.timerApi.setTimeout(()=>{this.timer=null;this.pump();this.deadline+=period;this.schedule();},Math.max(1,this.deadline-time));
  }
  remove(context,replace=true){
    const state=this.contexts.get(context);this.contexts.delete(context);
    if(replace&&state?.media.kind==='gif')try{this.client.setBaseDataIcon(context,state.media.dataUri,'');}catch{}
    if(![...this.contexts.values()].some(s=>s.backend==='frames'&&s.media.kind==='gif'&&!s.done)){if(this.timer)this.timerApi.clearTimeout(this.timer);this.timer=null;this.deadline=0;}
  }
  close(){for(const context of this.contexts.keys())this.remove(context);}
}

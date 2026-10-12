import sharp from 'sharp';

export async function syntheticGif() {
  const width=458,height=196;
  const frames=[[255,0,0],[0,255,0],[0,0,255]].map(color=>{
    const buffer=Buffer.alloc(width*height*3);
    for(let i=0;i<buffer.length;i+=3){buffer[i]=color[0];buffer[i+1]=color[1];buffer[i+2]=color[2];}
    return buffer;
  });
  return sharp(Buffer.concat(frames),{raw:{width,height:height*3,channels:3,pageHeight:height}}).gif({delay:[200,400,600],loop:0}).toBuffer();
}

// Explicit test mode inside the existing fork runtime avoids a second main socket
// and prevents the slideshow from racing with the capability test.
export class CapabilityProbe {
  constructor({client,context,gif,poster,timerApi=globalThis}){
    const target=client.decodeContext(context);
    if(target.uuid!=='com.ggazzeta.ulanzi.imageslidegif.slideshow')throw new Error('Probe must target the fork slideshow action');
    this.client=client;this.context=context;this.gif=`data:image/gif;base64,${gif.toString('base64')}`;this.poster=poster;this.timerApi=timerApi;this.timer=null;
  }
  bind(){
    this.client.onAdd(event=>{if(event.context===this.context)this.start();});
    const active=event=>{if(event.context===this.context){if(event.active)this.start();else this.close();}};
    this.client.onSetActive(active);this.client.onSetactive?.(active);
    this.client.onClear(contexts=>{if(contexts.includes(this.context))this.close();});this.client.onClose(()=>this.close());
  }
  start(){this.close();try{this.client.setGifDataIcon(this.context,this.gif,'');}catch{return;}this.timer=this.timerApi.setTimeout(()=>{this.timer=null;try{this.client.setBaseDataIcon(this.context,this.poster,'');}catch{}},10000);}
  close(){if(this.timer)this.timerApi.clearTimeout(this.timer);this.timer=null;try{this.client.setBaseDataIcon(this.context,this.poster,'');}catch{}}
}

export async function createCapabilityProbe({client,context,timerApi}){
  const gif=await syntheticGif(),png=await sharp(gif).png().toBuffer();
  return new CapabilityProbe({client,context,gif,poster:`data:image/png;base64,${png.toString('base64')}`,timerApi});
}

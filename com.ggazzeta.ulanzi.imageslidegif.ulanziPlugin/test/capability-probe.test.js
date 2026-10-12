import test from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import {createCapabilityProbe,syntheticGif} from '../plugin/capability-probe.js';

test('isolated capability probe covers normal/large contexts, known native timing and exact PNG replacement without slideshow races',async()=>{
  const gif=await syntheticGif(),meta=await sharp(gif,{animated:true}).metadata();assert.deepEqual(meta.delay,[200,400,600]);assert.equal(meta.loop,0);assert.equal(meta.width,458);assert.equal(meta.pageHeight,196);
  for(const key of ['0_0','3_2']){
    const context=`com.ggazzeta.ulanzi.imageslidegif.slideshow___${key}___synthetic`,handlers={},sends=[],timers=new Map();let id=0;
    const client={decodeContext:c=>{const [uuid,key,actionid]=c.split('___');return {uuid,key,actionid};},onAdd:fn=>handlers.add=fn,onSetActive:fn=>handlers.active=fn,onSetactive:fn=>handlers.lower=fn,onClear:fn=>handlers.clear=fn,onClose:fn=>handlers.close=fn,setGifDataIcon:(context,data)=>sends.push({context,data,type:3}),setBaseDataIcon:(context,data)=>sends.push({context,data,type:1})};
    const probe=await createCapabilityProbe({client,context,timerApi:{setTimeout(fn,ms){assert.equal(ms,10000);timers.set(++id,fn);return id;},clearTimeout:id=>timers.delete(id)}});probe.bind();
    handlers.add({context:'other'});assert.equal(sends.length,0);handlers.add({context});assert.equal(sends.at(-1).type,3);assert.match(sends.at(-1).data,/^data:image\/gif;base64,/);assert.equal(timers.size,1);
    const fn=[...timers.values()][0];timers.clear();fn();assert.equal(sends.at(-1).type,1);const poster=await sharp(Buffer.from(sends.at(-1).data.split(',')[1],'base64')).metadata();assert.equal(poster.width,458);assert.equal(poster.height,196);
    handlers.lower({context,active:true});assert.equal(timers.size,1);handlers.clear([context]);assert.equal(timers.size,0);assert.equal(sends.at(-1).type,1);handlers.close();
  }
});

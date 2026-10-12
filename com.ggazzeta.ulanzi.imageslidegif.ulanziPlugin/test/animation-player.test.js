import assert from 'node:assert/strict';
import test from 'node:test';
import {AnimationPlayer,frameAt} from '../plugin/animation-player.js';
import {UlanziProtocolClient} from '../plugin/protocol-client.js';
const media={kind:'gif',signature:'hash',gifdata:'R0lG',dataUri:'poster',frames:['red','green','blue'],delays:[200,400,600],loop:0};

test('GIF state packet matches legacy fields with preserved outer/item target contexts; path rejects absolute escape',()=>{
  const frames=[];class Socket{}Socket.OPEN=1;
  const client=new UlanziProtocolClient({WebSocketImpl:Socket});client.websocket={readyState:1,bufferedAmount:0,send:x=>frames.push(JSON.parse(x))};
  const context='com.ggazzeta.ulanzi.imageslidegif.slideshow___3_2___exact-id';
  client.setGifDataIcon(context,'R0lG','');
  const identifiers={uuid:'com.ggazzeta.ulanzi.imageslidegif.slideshow',key:'3_2',actionid:'exact-id'};
  assert.deepEqual(frames[0],{cmd:'state',...identifiers,param:{statelist:[{...identifiers,type:3,gifdata:'R0lG',textData:'',showtext:false}]}});
  client.setGifPathIcon(context,'./slides/test.gif','Hi');assert.deepEqual(frames[1].param.statelist[0],{...identifiers,type:4,gifpath:'./slides/test.gif',textData:'Hi',showtext:true});
  assert.throws(()=>client.setGifPathIcon(context,'C:/external.gif'));assert.throws(()=>client.setGifPathIcon(context,'../outside.gif'));
});

function runtime(){let time=0,blocked=false;const sends=[],timers=new Map();let id=0;
  const timerApi={setTimeout(fn,ms){timers.set(++id,{fn,ms});return id;},clearTimeout(id){timers.delete(id);}};
  const client={setBaseDataIcon:(context,data)=>sends.push({context,data}),setGifDataIcon:(context,data)=>sends.push({context,data}),canSendFrame:()=>!blocked};
  const player=new AnimationPlayer({client,timerApi,now:()=>time});
  return {player,sends,timers,setTime:t=>time=t,block:b=>blocked=b,fire(){const [id,{fn}]=timers.entries().next().value;timers.delete(id);fn();}};
}
test('native sends once across unchanged rescans/clock ticks, replaces with static and stops on deactivation',()=>{
  const r=runtime();r.player.display('a',media);r.player.display('a',{...media});assert.equal(r.sends.length,1);assert.equal(r.timers.size,0);
  r.player.display('a',{signature:'static',dataUri:'png'});assert.equal(r.sends.at(-1).data,'png');r.player.pump();assert.equal(r.sends.length,2);
  r.player.display('a',media);r.player.remove('a');assert.equal(r.sends.at(-1).data,'poster');assert.equal(r.player.contexts.size,0);
});
test('one scheduler shares media across contexts, obeys delays and skips lag/backpressure without a queue',()=>{
  const r=runtime();r.player.display('a',media,'frames');r.player.display('b',media,'frames');assert.equal(r.timers.size,1);assert.equal(r.player.contexts.get('a').media,r.player.contexts.get('b').media);
  r.setTime(150);r.fire();assert.equal(r.sends.length,2);
  r.setTime(200);r.fire();assert.deepEqual(r.sends.slice(-2).map(x=>x.data),['green','green']);
  r.block(true);r.setTime(700);r.fire();assert.equal(r.sends.length,4);assert.equal(r.player.stats.dropped,2);
  r.block(false);r.setTime(1800);r.fire();assert.deepEqual(r.sends.slice(-2).map(x=>x.data),['blue','blue']);assert.equal(r.timers.size,1);
  r.player.display('a',{signature:'clock',dataUri:'clock'});r.player.remove('b');assert.equal(r.timers.size,0);const count=r.sends.length;r.player.pump();assert.equal(r.sends.length,count);
});
test('finite loops hold final frame; zero delays have explicit 100 ms frame-backend policy',()=>{
  assert.deepEqual(frameAt({...media,loop:1},1200),{index:2,done:true});
  assert.equal(frameAt({...media,delays:[0,0,0]},150).index,1);
  const r=runtime();r.player.display('a',{...media,loop:1},'frames');r.setTime(1300);r.fire();assert.equal(r.sends.at(-1).data,'blue');assert.equal(r.timers.size,0);
});

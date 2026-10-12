import test from 'node:test';
import assert from 'node:assert/strict';
import {ProfileRuntime} from '../plugin/profile-runtime.js';
import {profileKey} from '../plugin/profile-scope.js';
import {ACTION_UUID,normalizeSettings} from '../plugin/slideshow.js';
import {AnimationPlayer} from '../plugin/animation-player.js';
import {SharedWeatherRequests,SharedSystemSamples,SharedGalleryBudget,SharedFolderWatchers} from '../plugin/profile-resources.js';

function fixture({resolver,backups,confirm=true}={}){
  const handlers={},packets=[],writes=[],timers=new Map();let now=0,id=0,intervals=0,watchCount=0;
  const timerApi={setInterval(fn,ms){intervals++;timers.set(++id,{fn,ms,interval:true});return id;},clearInterval:id=>timers.delete(id),setTimeout(fn,ms){timers.set(++id,{fn,ms});return id;},clearTimeout:id=>timers.delete(id)};
  let saved=normalizeSettings({folderPath:'C:/legacy',gifBackend:'frames'});
  const client={onAdd:fn=>handlers.add=fn,onSetActive:fn=>handlers.active=fn,onSetactive:fn=>handlers.lower=fn,onClear:fn=>handlers.clear=fn,onSendToPlugin:fn=>handlers.inspector=fn,onDidReceiveGlobalSettings:fn=>handlers.global=fn,onClose:fn=>handlers.close=fn,onError:fn=>handlers.error=fn,
    decodeContext:context=>{const [uuid,key,actionid]=context.split('___');return {uuid,key,actionid};},setBaseDataIcon:(context,data)=>packets.push({context,data,type:1}),setGifDataIcon:(context,data)=>packets.push({context,data,type:3}),canSendFrame:()=>true,sendToPropertyInspector:(payload,context)=>packets.push({context,payload,type:'inspector'}),
    getGlobalSettings(){if(confirm||!writes.length)queueMicrotask(()=>handlers.global({settings:structuredClone(saved)}));return true;},setGlobalSettings(value){saved=structuredClone(value);writes.push(value);return true;}};
  const context=name=>`${ACTION_UUID}___3_2___${name}`,scopeResolver=resolver||{resolve:async ctx=>({key:profileKey(ctx.endsWith('a2')?'a':ctx.split('___')[2]),label:ctx.endsWith('a2')?'a':ctx.split('___')[2],warning:''})};
  const configuration={defaults:normalizeSettings({}),fallbackSlides:[{name:'sample',signature:'sample',dataUri:'sample'}]},fsApi={lstatSync:async()=>({isDirectory:()=>true,isFile:()=>true,isSymbolicLink:()=>false,size:10,mtimeMs:1}),readdirSync:async()=>[{name:'clip.gif',isFile:()=>true,isSymbolicLink:()=>false}]};
  const runtime=new ProfileRuntime({client,configuration,timerApi,now:()=>now,scopeResolver,backups:backups||{write:async()=>{}},serviceOptions:{fsApi,imageLoader:async file=>({name:'clip.gif',kind:'gif',signature:file,dataUri:'poster',gifdata:'gif',frames:[file+'-0',file+'-1'],delays:[200,400],loop:0,preparedBytes:100})},animationPlayer:new AnimationPlayer({client,timerApi,now:()=>now}),watchFactory:()=>{watchCount++;return {on(){},close(){}};},logger(){}});runtime.bind();
  return {runtime,context,client,packets,writes,timers,scope:key=>runtime.profiles.get(profileKey(key)).service,advance:t=>now=t,get intervals(){return intervals;},get watchers(){return watchCount;},get saved(){return saved;}};
}
test('all preferences and folders save independently across profiles while pages share their profile; one gallery/frame scheduler and folder watcher remain',async()=>{
  const f=fixture();await f.runtime.activate({uuid:ACTION_UUID,context:f.context('a')});await f.runtime.activate({uuid:ACTION_UUID,context:f.context('b')});await f.runtime.activate({uuid:ACTION_UUID,context:f.context('a2')});
  assert.equal(f.runtime.profiles.size,2);assert.equal(f.intervals,1);assert.equal(f.watchers,1);assert.equal(f.runtime.animation.contexts.size,3);
  const settingsA={...f.scope('a').settings,folderPath:'C:/A',intervalSeconds:25,loop:false,sort:'date',dateFormat:'dmy',showDateTime:true,dateTimeEverySlides:3,dateTimeDurationSeconds:7,weatherApiKey:'A-secret',weatherLocation:'A-town',weatherUnits:'f',systemEverySlides:8,systemDurationSeconds:11};
  await f.runtime.fromInspector({uuid:ACTION_UUID,context:f.context('a'),payload:{type:'updateSettings',settings:settingsA}});
  assert.equal(f.scope('a').settings.folderPath,'C:/A');assert.equal(f.scope('b').settings.folderPath,'C:/legacy');assert.equal(f.scope('b').settings.intervalSeconds,10);assert.equal(f.scope('b').settings.weatherApiKey,'');assert.equal(f.saved.folderPath,'C:/legacy');
  await f.runtime.fromInspector({uuid:ACTION_UUID,context:f.context('b'),payload:{type:'updateSettings',settings:{...f.scope('b').settings,folderPath:'C:/B',gifBackend:'poster'}}});assert.equal(f.scope('a').settings.gifBackend,'frames');assert.equal(f.scope('b').settings.gifBackend,'poster');
  const before=f.runtime.animation.contexts.get(f.context('a')).start;await f.runtime.receiveSettings({settings:structuredClone(f.saved)});assert.equal(f.runtime.animation.contexts.get(f.context('a')).start,before);
  const inspector=f.packets.filter(p=>p.type==='inspector'&&p.context===f.context('a')).at(-1).payload;assert.equal(inspector.profile.independent,true);assert.equal(inspector.settings.folderPath,'C:/A');assert.equal(inspector.profileSettings,undefined);
  f.runtime.deactivate(f.context('b'));assert.ok(f.runtime.animation.contexts.has(f.context('a')));assert.equal(f.scope('b').slides[0].signature,'sample');
  f.runtime.close();assert.equal(f.timers.size,0);assert.equal(f.runtime.animation.contexts.size,0);
});
test('backup failure refuses settings write and preserves other profiles; late profile resolution cannot reactivate removed contexts',async()=>{
  const f=fixture();await f.runtime.activate({uuid:ACTION_UUID,context:f.context('a')});const before=f.writes.length;f.runtime.backups={write:async()=>{throw new Error('Backup unavailable; settings were not saved.');}};
  await f.runtime.fromInspector({uuid:ACTION_UUID,context:f.context('a'),payload:{type:'updateSettings',settings:{...f.scope('a').settings,folderPath:'C:/wrong'}}});assert.equal(f.writes.length,before);assert.equal(f.scope('a').settings.folderPath,'C:/legacy');assert.equal(f.runtime.store.get(profileKey('a')).folderPath,'C:/legacy');f.runtime.close();
  let release;const pending=new Promise(resolve=>release=resolve),late=fixture({resolver:{resolve:()=>pending}}),context=late.context('late'),activation=late.runtime.activate({uuid:ACTION_UUID,context});late.runtime.clear([context]);release({key:profileKey('late'),label:'Late',warning:''});await activation;assert.equal(late.runtime.profiles.size,0);assert.equal(late.runtime.animation.contexts.size,0);late.runtime.close();
});
test('stale global echoes do not overwrite newer profile settings; malformed registry fails closed',async()=>{
  const f=fixture();await f.runtime.receiveSettings({uuid:'com.example.other.plugin',settings:{folderPath:'C:/not-ours'}});assert.equal(f.runtime.store,null);await f.runtime.activate({uuid:ACTION_UUID,context:f.context('a')});const stale=structuredClone(f.saved);
  await f.runtime.fromInspector({uuid:ACTION_UUID,context:f.context('a'),payload:{type:'updateSettings',settings:{...f.scope('a').settings,folderPath:'C:/new'}}});await f.runtime.receiveSettings({settings:stale});assert.equal(f.runtime.store.get(profileKey('a')).folderPath,'C:/new');
  const before=f.writes.length;await f.runtime.receiveSettings({settings:{profileSettingsSchema:'unsupported'}});assert.equal(f.writes.length,before);assert.equal(f.scope('a').settings.folderPath,'C:/new');await f.runtime.fromInspector({uuid:ACTION_UUID,context:f.context('a'),payload:{type:'updateSettings',settings:{...f.scope('a').settings,folderPath:'C:/unsafe-overwrite'}}});assert.equal(f.writes.length,before);f.runtime.close();
});

test('initialization can retry after backup failure and scope is rechecked when an inactive display becomes bound to a profile',async()=>{
  let failed=true;const f=fixture({backups:{write:async()=>{if(failed)throw new Error('Backup failed');}}});const context=f.context('a');
  await assert.rejects(f.runtime.activate({uuid:ACTION_UUID,context}));assert.equal(f.runtime.profiles.size,0);failed=false;await f.runtime.activate({uuid:ACTION_UUID,context});assert.equal(f.scope('a').activeContexts.size,1);
  f.runtime.deactivate(context);f.runtime.resolver={resolve:async()=>({key:profileKey('new-profile'),label:'New',warning:''})};await f.runtime.activate({uuid:ACTION_UUID,context});assert.equal(f.scope('new-profile').activeContexts.size,1);assert.equal(f.scope('a').activeContexts.size,0);f.runtime.close();
});

test('profile settings round-trip after reconnect without replaying an unrelated profile or leaking listeners/timers',async()=>{
  const f=fixture();const a=f.context('a'),b=f.context('b');await f.runtime.activate({uuid:ACTION_UUID,context:a});await f.runtime.activate({uuid:ACTION_UUID,context:b});
  await f.runtime.fromInspector({uuid:ACTION_UUID,context:a,payload:{type:'updateSettings',settings:{...f.scope('a').settings,folderPath:'C:/saved-A'}}});
  f.runtime.close();assert.equal(f.timers.size,0);await f.runtime.activate({uuid:ACTION_UUID,context:a});assert.equal(f.scope('a').settings.folderPath,'C:/saved-A');assert.equal(f.runtime.profiles.size,1);assert.equal(f.runtime.animation.contexts.size,1);f.runtime.close();assert.equal(f.timers.size,0);
});

test('concurrent profile saves do not lose another profile and information mode releases only its own media/frames',async()=>{
  const f=fixture(),a=f.context('a'),b=f.context('b');await f.runtime.activate({uuid:ACTION_UUID,context:a});await f.runtime.activate({uuid:ACTION_UUID,context:b});
  await Promise.all([
    f.runtime.fromInspector({uuid:ACTION_UUID,context:a,payload:{type:'updateSettings',settings:{...f.scope('a').settings,folderPath:'C:/A',showImages:false,showDateTime:true,dateTimeDurationSeconds:9}}}),
    f.runtime.fromInspector({uuid:ACTION_UUID,context:b,payload:{type:'updateSettings',settings:{...f.scope('b').settings,folderPath:'C:/B',intervalSeconds:12}}})
  ]);
  assert.equal(f.runtime.store.get(profileKey('a')).folderPath,'C:/A');assert.equal(f.runtime.store.get(profileKey('b')).folderPath,'C:/B');assert.equal(f.scope('a').settings.showImages,false);assert.equal(f.scope('b').settings.showImages,true);
  assert.equal(f.scope('a').slides[0].signature,'sample');assert.equal(f.runtime.budget.leases.has(profileKey('a')),false);assert.equal(f.runtime.animation.contexts.get(b).media.kind,'gif');assert.match(f.runtime.animation.contexts.get(a).media.signature,/date-time/);assert.equal(f.intervals,1);f.runtime.close();
});
test('shared profile resources coalesce weather and system work, bound combined gallery memory and close shared watchers once',async()=>{
  let calls=0,now=0,samples=0;const weather=new SharedWeatherRequests({now:()=>now,fetchImpl:async()=>{calls++;return {ok:true,status:200,text:async()=>'{"weather":true}'};}});
  const [a,b]=await Promise.all([weather.request('https://example.invalid/weather?key=private'),weather.request('https://example.invalid/weather?key=private')]);assert.equal(calls,1);assert.equal(await a.text(),await b.text());await weather.request('https://example.invalid/weather?key=private');assert.equal(calls,1);now=31*60*1000;await weather.request('https://example.invalid/weather?key=private');assert.equal(calls,2);
  const system=new SharedSystemSamples({now:()=>now,monitor:{sample:async()=>{samples++;return {cpu:1};}}});await Promise.all([system.sample(),system.sample()]);assert.equal(samples,1);
  const budget=new SharedGalleryBudget(10),one={signature:'one',dataUri:'a',preparedBytes:6},two={signature:'two',dataUri:'b',preparedBytes:6};assert.equal(budget.select('A',[one]).accepted.length,1);assert.equal(budget.select('B',[two]).rejected.length,1);assert.equal(budget.select('B',[one]).accepted.length,1);budget.release('A');budget.release('B');assert.equal(budget.select('B',[two]).accepted.length,1);
  let created=0,closed=0;const watchers=new SharedFolderWatchers(()=>{created++;return {on(){},close(){closed++;}};});const w1=watchers.watch('same',{},()=>{}),w2=watchers.watch('same',{},()=>{});assert.equal(created,1);w1.close();assert.equal(closed,0);w2.close();assert.equal(closed,1);
});

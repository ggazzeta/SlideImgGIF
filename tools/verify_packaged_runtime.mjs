import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {writeFile,mkdtemp,mkdir,rm} from 'node:fs/promises';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';

const stage=resolve('.build-package/stage/com.ggazzeta.ulanzi.imageslidegif.ulanziPlugin');
const load=name=>import(pathToFileURL(resolve(stage,'plugin',name)).href);
const {syntheticGif}=await load('capability-probe.js');
const {mediaPreparer}=await load('media-preparer.js');
const {UlanziProtocolClient}=await load('protocol-client.js');
const {SlideshowService,loadConfiguration,ACTION_UUID}=await load('slideshow.js');
const {ProfileRuntime}=await load('profile-runtime.js');
const {profileKey}=await load('profile-scope.js');
const gif=await syntheticGif(),media={...await mediaPreparer.prepare(gif,createHash('sha256').update(gif).digest('hex')),signature:'packaged-synthetic',name:'synthetic.gif'};
assert.equal(media.frames.length,3);assert.deepEqual(media.delays,[200,400,600]);assert.equal(media.loop,0);
const packets=[];class Socket {static OPEN=1;}
const client=new UlanziProtocolClient({WebSocketImpl:Socket});client.websocket={readyState:1,bufferedAmount:0,send:packet=>packets.push(JSON.parse(packet))};
const service=new SlideshowService({client,configuration:await loadConfiguration(stage),logger(){}});
service.slides=[media];const context=`${ACTION_UUID}___3_2___packaged-instance`;service.add({uuid:ACTION_UUID,context});service.renderAll();
await service.applySettings({...service.settings},true);
assert.equal(packets.filter(p=>p.cmd==='state'&&p.param.statelist[0].type===3).length,1);service.close();
assert.equal(packets.filter(p=>p.cmd==='state').at(-1).param.statelist[0].type,1);
const temporary=await mkdtemp(join(tmpdir(),'packaged-profile-'));
try{
  const aFolder=join(temporary,'A'),bFolder=join(temporary,'B');await mkdir(aFolder);await mkdir(bFolder);await writeFile(join(aFolder,'synthetic.gif'),gif);await writeFile(join(bFolder,'synthetic.gif'),gif);
  let globalSettings={folderPath:aFolder,intervalSeconds:10,loop:true,sort:'name',gifBackend:'frames'};
  const profileClient=new UlanziProtocolClient({WebSocketImpl:Socket});profileClient.uuid='com.ggazzeta.ulanzi.imageslidegif';profileClient.websocket={readyState:1,bufferedAmount:0,send:packet=>{const p=JSON.parse(packet);if(p.cmd==='setGlobalSettings')globalSettings=structuredClone(p.settings);if(p.cmd==='getGlobalSettings')queueMicrotask(()=>profileClient.receive(JSON.stringify({cmd:'didReceiveGlobalSettings',uuid:p.uuid,key:p.key,actionid:p.actionid,settings:globalSettings})));}};
  const runtime=new ProfileRuntime({client:profileClient,configuration:await loadConfiguration(stage),scopeResolver:{resolve:async context=>({key:profileKey(context.split('___')[2]),label:'Synthetic profile',warning:''})},backups:{write:async()=>{}},logger(){}});runtime.bind();
  try{const a=`${ACTION_UUID}___3_2___A`,b=`${ACTION_UUID}___3_2___B`;await runtime.activate({uuid:ACTION_UUID,context:a});await runtime.activate({uuid:ACTION_UUID,context:b});const first=runtime.profiles.get(profileKey('A')).service,second=runtime.profiles.get(profileKey('B')).service;await runtime.fromInspector({uuid:ACTION_UUID,context:b,payload:{type:'updateSettings',settings:{...second.settings,folderPath:bFolder,intervalSeconds:25}}});assert.equal(first.settings.folderPath,aFolder);assert.equal(first.settings.intervalSeconds,10);assert.equal(second.settings.folderPath,bFolder);assert.equal(second.settings.intervalSeconds,25);assert.equal(runtime.clock.callbacks.size,2);assert.equal(runtime.animation.contexts.size,2);}finally{runtime.close();}
}finally{await rm(temporary,{recursive:true,force:true,maxRetries:5,retryDelay:100});}
const report={date:'2026-10-12',node:process.version,platform:process.platform,arch:process.arch,source:'integrity/architecture-verified release stage',bundledSharpWorkerDecode:'passed',bundledProtocolNativeOnce:'passed',bundledStaticReplacement:'passed',bundledProfileIsolationAndSDKReadback:'passed with two synthetic profiles and fake socket',installedStudio:false,physicalAnimation:'0.9.0 PNG frames user-confirmed; 0.10.0 profile migration not physically tested'};
await writeFile('docs/PACKAGE_VERIFICATION.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));

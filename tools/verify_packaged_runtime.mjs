import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';

const stage=resolve('.build-package/stage/com.ggazzeta.ulanzi.imageslidegif.ulanziPlugin');
const load=name=>import(pathToFileURL(resolve(stage,'plugin',name)).href);
const {syntheticGif}=await load('capability-probe.js');
const {mediaPreparer}=await load('media-preparer.js');
const {UlanziProtocolClient}=await load('protocol-client.js');
const {SlideshowService,loadConfiguration,ACTION_UUID}=await load('slideshow.js');
const gif=await syntheticGif(),media={...await mediaPreparer.prepare(gif,createHash('sha256').update(gif).digest('hex')),signature:'packaged-synthetic',name:'synthetic.gif'};
assert.equal(media.frames.length,3);assert.deepEqual(media.delays,[200,400,600]);assert.equal(media.loop,0);
const packets=[];class Socket {static OPEN=1;}
const client=new UlanziProtocolClient({WebSocketImpl:Socket});client.websocket={readyState:1,bufferedAmount:0,send:packet=>packets.push(JSON.parse(packet))};
const service=new SlideshowService({client,configuration:await loadConfiguration(stage),logger(){}});
service.slides=[media];const context=`${ACTION_UUID}___3_2___packaged-instance`;service.add({uuid:ACTION_UUID,context});service.renderAll();
assert.equal(packets.filter(p=>p.cmd==='state'&&p.param.statelist[0].type===3).length,1);service.close();
assert.equal(packets.filter(p=>p.cmd==='state').at(-1).param.statelist[0].type,1);
const report={date:'2026-10-12',node:process.version,platform:process.platform,arch:process.arch,source:'integrity/architecture-verified release stage',bundledSharpWorkerDecode:'passed',bundledProtocolNativeOnce:'passed',bundledStaticReplacement:'passed',installedStudio:false,physicalAnimation:'unverified'};
await writeFile('docs/PACKAGE_VERIFICATION.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));

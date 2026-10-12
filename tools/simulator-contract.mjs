// Uses the unmodified pinned official simulator's packet router, without starting its server/browser.
import {EventEmitter} from 'node:events';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
import {syntheticGif} from '../com.ggazzeta.ulanzi.imageslidegif.ulanziPlugin/tools/gif-probe.js';
import {UlanziProtocolClient} from '../com.ggazzeta.ulanzi.imageslidegif.ulanziPlugin/plugin/protocol-client.js';

const root=resolve(process.argv[2]||'../research/UlanziDeckPlugin-SDK/UlanziDeckSimulator');
await mkdir(resolve(root,'plugins'),{recursive:true});
process.argv[1]=resolve(root,'app.js');
const {default:Clients}=await import(pathToFileURL(resolve(root,'server/clients.js')).href);
const official=new Clients({rootPath:root,language:'en',runMain:'no',loadAction:'no'});
const forwarded=[],acks=[];
official.deckClient={send(cmd,data){if(cmd==='state')forwarded.push(data);},log(){}};
const socket=new EventEmitter();socket.readyState=1;socket.send=message=>acks.push(JSON.parse(message));
official.addClient(socket);socket.emit('message',Buffer.from(JSON.stringify({code:0,cmd:'connected',uuid:'com.ggazzeta.ulanzi.imageslidegif'})));
class Socket {static OPEN=1;}
const client=new UlanziProtocolClient({WebSocketImpl:Socket});client.websocket={readyState:1,send:packet=>socket.emit('message',Buffer.from(packet))};
const gif=await syntheticGif();
for(const key of ['0_0','3_2']){
  const context=`com.ggazzeta.ulanzi.imageslidegif.slideshow___${key}___synthetic-instance`;
  client.setGifDataIcon(context,`data:image/gif;base64,${gif.toString('base64')}`);
  client.setBaseDataIcon(context,'data:image/png;base64,cG9zdGVy');
}
assert.equal(forwarded.length,4);assert.deepEqual(forwarded.map(x=>x.param.statelist[0].type),[3,1,3,1]);
assert.deepEqual(forwarded.map(x=>x.key),['0_0','0_0','3_2','3_2']);assert.equal(acks.filter(x=>x.cmd==='state'&&x.code===0).length,4);
const browserSource=await readFile(resolve(root,'static/assets/index.js'),'utf8');
const renderSource=browserSource.slice(browserSource.indexOf('function setStateIcon('),browserSource.indexOf('function safeOpenWindow('));
const image={src:''};const dom={document:{querySelector:()=>({getElementsByTagName:()=>[image]})},activeKeys:{'0_0':{},'3_2':{}}};vm.createContext(dom);vm.runInContext(renderSource,dom);
for(const packet of forwarded){dom.setStateIcon(packet.param.statelist[0]);assert.match(image.src,/^data:image\/(gif|png);base64,/);}
const report={date:'2026-10-12',sdkRevision:'550ab80c69285ecf259bd494a7fff767c14f0c0f',mode:'official simulator Clients router and unmodified setStateIcon function with fake sockets/DOM; no browser/server/Studio/device',controlKey:'0_0',largeKey:'3_2',packetsForwarded:4,packetTypes:[3,1,3,1],acks:4,gifConvention:'data:image/gif;base64; SDK passthrough; simulator assigns gifdata directly to img.src',browserAnimation:'not tested',studioAnimation:'not tested',physicalAnimation:'not tested'};
await writeFile(new URL('../docs/SIMULATOR_EVIDENCE.json',import.meta.url),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));

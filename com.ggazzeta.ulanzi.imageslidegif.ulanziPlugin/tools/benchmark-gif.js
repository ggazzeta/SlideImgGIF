import sharp from 'sharp';
import {performance,monitorEventLoopDelay} from 'node:perf_hooks';
import {writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {mediaPreparer} from '../plugin/media-preparer.js';
import {AnimationPlayer} from '../plugin/animation-player.js';

const width=916,height=392,count=20,raw=Buffer.alloc(width*height*count*3);
for(let frame=0;frame<count;frame++)for(let i=0;i<width*height;i++){const offset=(frame*width*height+i)*3;raw[offset]=(i%width+frame*11)%256;raw[offset+1]=(Math.floor(i/width)+frame*23)%256;raw[offset+2]=(frame*31)%256;}
const input=await sharp(raw,{raw:{width,height:height*count,channels:3,pageHeight:height}}).gif({delay:Array(count).fill(100),loop:0}).toBuffer();
const delay=monitorEventLoopDelay({resolution:10});delay.enable();const cpu=process.cpuUsage(),start=performance.now();let peakRss=process.memoryUsage().rss;
const sample=setInterval(()=>{peakRss=Math.max(peakRss,process.memoryUsage().rss)},10);
const media={...await mediaPreparer.prepare(input,createHash('sha256').update(input).digest('hex')),signature:'benchmark'};
const preparationMs=performance.now()-start;
const stamps=[],client={setBaseDataIcon:(context,data)=>stamps.push({time:performance.now(),bytes:Buffer.byteLength(data),context}),canSendFrame:()=>true};
const player=new AnimationPlayer({client});player.display('a',media,'frames');player.display('b',media,'frames');
await new Promise(resolve=>setTimeout(resolve,5000));player.close();mediaPreparer.cancel();clearInterval(sample);delay.disable();
const contextStamps=stamps.filter(s=>s.context==='a'&&s.bytes>0).slice(0,-1),cadence=contextStamps.slice(1).map((s,i)=>s.time-contextStamps[i].time);
const elapsed=performance.now()-start,used=process.cpuUsage(cpu);
const result={node:process.version,platform:process.platform,arch:process.arch,fixture:{width,height,frames:count,inputBytes:input.length},preparationMs,preparedBytes:media.preparedBytes,elapsedMs:elapsed,cpuMs:(used.user+used.system)/1000,peakRssMiB:peakRss/1024**2,eventLoopP99Ms:delay.percentile(99)/1e6,frameBackend:{fpsCap:10,contexts:2,frames:player.stats.sent,drops:player.stats.dropped,averageCadenceMs:cadence.reduce((a,b)=>a+b,0)/cadence.length,socket:'in-memory accepting fake; no Studio/device responsiveness measurement'}};
await writeFile('../docs/PERFORMANCE_MEASUREMENTS.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));

// Local synthetic benchmark only. Never connects to Studio or reads user media.
import {readFile,writeFile,mkdir,mkdtemp,rm} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
const plugin=resolve('com.ggazzeta.ulanzi.imageslidegif.ulanziPlugin');
const sharp=createRequire(join(plugin,'package.json'))('sharp');
const privateRoot=resolve('.local-profile-preparation/cache-benchmark');
if(process.argv[2]==='--child'){
  const [mode,inputPath,baselinePath]=process.argv.slice(3),input=await readFile(inputPath);
  const start=performance.now(),cpu=process.cpuUsage();let peakRSS=process.memoryUsage().rss;
  const sample=setInterval(()=>{peakRSS=Math.max(peakRSS,process.memoryUsage().rss);},5);
  let result;
  try{
    if(mode==='baseline'){
      const {prepareGif}=await import(pathToFileURL(resolve(baselinePath)));try{const media=await prepareGif(input);result={accepted:true,preparedBytes:media.preparedBytes,playbackFrames:media.frames.length,nativeGifEncoded:true};}catch(error){result={accepted:false,reason:error.message};}
    }else{
      const {PreparedMediaStore}=await import(pathToFileURL(join(plugin,'plugin/prepared-media-store.js')));
      const {MediaPreparer}=await import(pathToFileURL(join(plugin,'plugin/media-preparer.js')));
      const cacheRoot=await mkdtemp(join(privateRoot,'new-cache-')),store=new PreparedMediaStore({root:cacheRoot}),preparer=new MediaPreparer({store}),key=createHash('sha256').update(input).digest('hex');
      try{const media=await preparer.prepare(input,key);const coldMs=performance.now()-start;const readsBefore=store.stats.frameReads;
        for(const _cycle of [0,1,2])for(let index=0;index<media.frames.length;index++)await media.getFrame(index);
        const readCount=store.stats.frameReads;const hotStart=performance.now();await preparer.prepare(input,key);const hotPrepareMs=performance.now()-hotStart;
        for(let index=0;index<media.frames.length;index++)await media.getFrame(index);
        result={accepted:true,preparedBytes:media.preparedBytes,sourceFrames:media.sourceFrames,playbackFrames:media.frames.length,nativeGifEncoded:false,coldPreparationMs:coldMs,hotPreparationMs:hotPrepareMs,decodeJobs:preparer.stats.prepares,diskFrameReads:readCount-readsBefore,additionalHotFrameReads:store.stats.frameReads-readCount,binaryCacheBytes:store.binary.bytes,uriCacheBytes:store.uris.bytes};
      }finally{await preparer.shutdown();await rm(cacheRoot,{recursive:true,force:true,maxRetries:5,retryDelay:100});}
    }
    peakRSS=Math.max(peakRSS,process.memoryUsage().rss);const used=process.cpuUsage(cpu);console.log(JSON.stringify({mode,node:process.version,elapsedMs:performance.now()-start,cpuMs:(used.user+used.system)/1000,peakRSSBytes:peakRSS,compressedInputBytes:input.length,...result}));
  }finally{clearInterval(sample);}
}else{
  const baselinePath=process.argv[2];if(!baselinePath)throw new Error('Pass a local untouched 0.10.1 gif-media.js snapshot path');
  await mkdir(privateRoot,{recursive:true});const large=process.argv.includes('--large'),width=large?1024:640,height=large?768:360,pages=80,raw=Buffer.alloc(width*height*pages*3);
  for(let page=0;page<pages;page++)for(let pixel=0;pixel<width*height;pixel++){const at=(page*width*height+pixel)*3;raw[at]=(page*29)%256;raw[at+1]=(page*47)%256;raw[at+2]=(page*71)%256;}
  const input=await sharp(raw,{raw:{width,height:height*pages,channels:3,pageHeight:height}}).gif({loop:0,delay:Array(pages).fill(30),keepDuplicateFrames:true,effort:1,dither:0}).toBuffer();
  const inputPath=join(privateRoot,'synthetic-80-frames.gif');await writeFile(inputPath,input);
  const results=[];
  for(const mode of ['baseline','new']){const child=spawnSync(process.execPath,[resolve('tools/benchmark_png_cache.mjs'),'--child',mode,inputPath,resolve(baselinePath)],{encoding:'utf8',timeout:90000});if(child.status!==0)throw new Error(`Synthetic ${mode} benchmark failed: ${child.stderr}`);results.push(JSON.parse(child.stdout.trim().split('\n').at(-1)));}
  const report={date:'2026-10-13',fixture:`original synthetic solid-color ${width}x${height} GIF, 80 frames, 30 ms source delays`,sourceDecodedPixels:width*height*pages,method:'separate Node processes; process RSS sampled every 5 ms; CPU is process CPU; measurements include cache frame reads for new path',studioConnected:false,physicalDeviceMeasured:false,results};
  await writeFile(large?'docs/CACHE_LIMIT_VALIDATION.json':'docs/CACHE_PERFORMANCE_MEASUREMENTS.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
}

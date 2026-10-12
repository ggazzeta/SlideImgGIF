import test from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import {mkdtemp,writeFile,rm,stat,utimes} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fixtureGif} from './gif-fixtures.js';
import {inspectGif,prepareGif,GIF_LIMITS} from '../plugin/gif-media.js';
import {loadSlide} from '../plugin/images.js';
import {enumerateFolder} from '../plugin/slideshow.js';
import {mediaPreparer,MediaPreparer} from '../plugin/media-preparer.js';
import {EventEmitter} from 'node:events';

test('GIF validation rejects extension-content mismatch, truncation, excess dimensions/frames/pixels/bytes',()=>{
  const gif=fixtureGif();assert.equal(inspectGif(gif).frames,2);
  assert.throws(()=>inspectGif(Buffer.from('not a gif')),/not GIF|limit/);
  assert.throws(()=>inspectGif(gif.subarray(0,-1)),/Truncated/);
  const giant=Buffer.from(gif);giant.writeUInt16LE(2049,6);assert.throws(()=>inspectGif(giant),/dimensions/);
  for(const limits of [{frames:1},{decodedPixels:5},{outputPixels:1},{inputBytes:1}])assert.throws(()=>inspectGif(gif,{...GIF_LIMITS,...limits}));
});

test('single-frame and animated GIF preserve delays, explicit loops, absent-loop one play, nonsquare frame sizing',async()=>{
  for(const loop of [null,0,2]){
    const input=fixtureGif({loop,frames:[{pixels:[1,1,1],delay:0},{pixels:[2,2,2],delay:7},{pixels:[2,2,2],delay:17}]});
    const result=await prepareGif(input),encoded=Buffer.from(result.gifdata.split(',')[1],'base64'),meta=await sharp(encoded,{animated:true}).metadata();
    assert.equal(meta.width,458);assert.equal(meta.pageHeight,196);assert.equal(meta.pages,3);
    assert.deepEqual(result.delays,[0,70,170]);assert.deepEqual(meta.delay,[0,70,170]);assert.equal(meta.loop,result.loop);assert.equal(result.loop,loop===null?1:loop===0?0:3);
    const {data,info}=await sharp(encoded,{animated:true}).ensureAlpha().raw().toBuffer({resolveWithObject:true});
    assert.deepEqual([...data.subarray(0,4)],[255,0,0,255]);
    assert.deepEqual([...data.subarray(458*196*4,458*196*4+4)],[0,255,0,255]);assert.equal(info.height,196*3);
  }
  const single=await prepareGif(fixtureGif({loop:null,frames:[{pixels:[3,3,3],delay:10}]}));assert.equal(single.frames.length,1);assert.equal(single.loop,1);
});

test('partial-frame transparency and disposal 2/3 compose to known expected RGBA pixels and temporal output',async()=>{
  for(const disposal of [2,3]){
    const gif=fixtureGif({frames:[{pixels:[1,1,1],delay:20},{x:1,width:1,pixels:[2],delay:30,disposal},{x:2,width:1,pixels:[3],delay:40}]});
    const {data}=await sharp(gif,{animated:true}).ensureAlpha().raw().toBuffer({resolveWithObject:true});
    const red=[255,0,0,255],green=[0,255,0,255],blue=[0,0,255,255],clear=[0,0,0,0];
    const expected=[...red,...red,...red,...red,...green,...red,...red,...(disposal===3?red:clear),...blue];
    assert.deepEqual([...data],expected);
    const prepared=await prepareGif(gif);
    for(let i=0;i<3;i++){
      const expectedFrame=await sharp(Buffer.from(expected.slice(i*12,(i+1)*12)),{raw:{width:3,height:1,channels:4}}).resize(458,196,{fit:'cover',position:'centre'}).png().toBuffer();
      const actual=await sharp(Buffer.from(prepared.frames[i].split(',')[1],'base64')).raw().toBuffer();
      assert.deepEqual(actual,await sharp(expectedFrame).raw().toBuffer());
    }
    const original=await sharp(Buffer.from(prepared.gifdata.split(',')[1],'base64'),{animated:true}).metadata();assert.deepEqual(original.delay,[200,300,400]);
  }
});

test('native re-encoded animation matches known composited pixels over its exact temporal sequence',async()=>{
  const input=fixtureGif({width:458,height:196,loop:1,frames:[{pixels:Array(458*196).fill(1),delay:20},{x:219,y:88,width:20,height:20,pixels:Array(400).fill(2),delay:30,disposal:3},{x:400,y:88,width:20,height:20,pixels:Array(400).fill(3),delay:40}]});
  const media=await prepareGif(input),encoded=Buffer.from(media.gifdata.split(',')[1],'base64');
  const meta=await sharp(encoded,{animated:true}).metadata();assert.equal(meta.loop,2);assert.deepEqual(meta.delay,[200,300,400]);
  const decoded=await sharp(encoded,{animated:true}).ensureAlpha().raw().toBuffer();
  const pixel=(frame,x,y)=>[...decoded.subarray(((frame*196+y)*458+x)*4,((frame*196+y)*458+x)*4+4)];
  assert.deepEqual(pixel(0,228,98),[255,0,0,255]);assert.deepEqual(pixel(1,228,98),[0,255,0,255]);assert.deepEqual(pixel(2,228,98),[255,0,0,255]);assert.deepEqual(pixel(2,409,98),[0,0,255,255]);
  await assert.rejects(prepareGif(input,{...GIF_LIMITS,outputBytes:1}),/Prepared GIF/);
});

test('uppercase GIF participates in deterministic mixed discovery, full-content dedup, same-stat explicit refresh',async()=>{
  const dir=await mkdtemp(join(tmpdir(),'gif-gallery-'));
  try{
    const a=fixtureGif(),b=fixtureGif({frames:[{pixels:[1,1,1],delay:20},{pixels:[3,3,3],delay:40}]});
    await writeFile(join(dir,'b.GIF'),a);await writeFile(join(dir,'copy.gif'),a);await writeFile(join(dir,'c.gif'),b);
    await writeFile(join(dir,'bad.gif'),'not GIF');await writeFile(join(dir,'a.png'),await sharp({create:{width:458,height:196,channels:3,background:'#123456'}}).png().toBuffer());
    const cache=new Map();const result=await enumerateFolder(dir,'name',undefined,cache);
    assert.deepEqual(result.slides.map(s=>s.name),['a.png','b.GIF','c.gif']);assert.equal(result.rejected,1);assert.notEqual(result.slides[1].signature,result.slides[2].signature);
    const before=await stat(join(dir,'b.GIF'));assert.equal(a.length,b.length);await writeFile(join(dir,'b.GIF'),b);await utimes(join(dir,'b.GIF'),before.atime,before.mtime);
    cache.clear();const refreshed=await enumerateFolder(dir,'name',undefined,cache);assert.equal(refreshed.slides.find(s=>s.name==='b.GIF').signature,result.slides[2].signature);
    await assert.rejects(loadSlide(join(dir,'bad.gif')));
  }finally{mediaPreparer.cancel();await rm(dir,{recursive:true,force:true,maxRetries:5,retryDelay:100});}
});

test('worker queue shares jobs, enforces timeout and concurrency, cancellation rejects late completion',async()=>{
  const workers=[];class FakeWorker extends EventEmitter{constructor(){super();workers.push(this);}postMessage(){}terminate(){this.terminated=true;return Promise.resolve();}}
  const preparer=new MediaPreparer({WorkerImpl:FakeWorker,limits:{...GIF_LIMITS,timeoutMs:20,queuedJobs:1}});
  const first=preparer.prepare(Buffer.from('a'),'a');assert.equal(first,preparer.prepare(Buffer.from('a'),'a'));
  const second=preparer.prepare(Buffer.from('b'),'b');await assert.rejects(preparer.prepare(Buffer.from('c'),'c'),/queue full/);assert.equal(workers.length,1);
  const firstCheck=assert.rejects(first,/15 seconds/),secondCheck=assert.rejects(second,/cancelled/);await firstCheck;assert.equal(workers.length,2);preparer.cancel();await secondCheck;
  workers[0].emit('message',{media:{preparedBytes:1}});assert.equal(preparer.cache.size,0);assert.ok(workers.every(w=>w.terminated));
});

import {Worker} from 'node:worker_threads';
import {GIF_LIMITS} from './gif-media.js';

// One internal worker at a time, bounded waiting queue, content-addressed LRU.
export class MediaPreparer {
  constructor({limits=GIF_LIMITS,WorkerImpl=Worker}={}){this.limits=limits;this.WorkerImpl=WorkerImpl;this.queue=[];this.active=null;this.pending=new Map();this.cache=new Map();this.bytes=0;}
  prepare(buffer,signature){
    if(this.cache.has(signature)){const value=this.cache.get(signature);this.cache.delete(signature);this.cache.set(signature,value);return Promise.resolve(value);}
    if(this.pending.has(signature))return this.pending.get(signature);
    if(this.queue.length>=this.limits.queuedJobs)return Promise.reject(new Error('GIF preparation queue full; refresh after current media completes'));
    const promise=new Promise((resolve,reject)=>{this.queue.push({buffer,signature,resolve,reject});});
    this.pending.set(signature,promise);this.pump();return promise;
  }
  pump(){
    if(this.active||!this.queue.length)return;
    const job=this.queue.shift();let worker;
    try{worker=new this.WorkerImpl(new URL('./media-worker.js',import.meta.url));}
    catch(error){this.pending.delete(job.signature);job.reject(error);this.pump();return;}
    const active={job,worker,timer:null,done:false};this.active=active;
    const finish=(error,media)=>{
      if(active.done)return;active.done=true;clearTimeout(active.timer);const terminated=worker.terminate();this.pending.delete(job.signature);
      if(error)job.reject(error);else{
        while(this.bytes+media.preparedBytes>this.limits.cacheBytes&&this.cache.size){const [key,value]=this.cache.entries().next().value;this.bytes-=value.preparedBytes;this.cache.delete(key);}
        if(media.preparedBytes<=this.limits.cacheBytes){this.cache.set(job.signature,media);this.bytes+=media.preparedBytes;}
        job.resolve(media);
      }
      Promise.resolve(terminated).catch(()=>{}).finally(()=>{if(this.active===active)this.active=null;this.pump();});
    };
    active.finish=finish;
    active.timer=setTimeout(()=>finish(new Error('GIF preparation exceeded 15 seconds')),this.limits.timeoutMs);
    worker.once('error',error=>finish(error));worker.once('exit',code=>{if(!active.done)finish(new Error(`GIF worker exited (${code})`));});
    worker.once('message',result=>finish(result.error?new Error(result.error):null,result.media));
    worker.postMessage({buffer:job.buffer});
  }
  cancel(){
    for(const job of this.queue.splice(0)){this.pending.delete(job.signature);job.reject(new Error('GIF preparation cancelled'));}
    this.active?.finish(new Error('GIF preparation cancelled'));this.cache.clear();this.bytes=0;
  }
}
export const mediaPreparer=new MediaPreparer();

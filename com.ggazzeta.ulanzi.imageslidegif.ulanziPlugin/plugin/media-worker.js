import {parentPort} from 'node:worker_threads';
import {prepareGif} from './gif-media.js';
import sharp from 'sharp';
sharp.concurrency(1);
sharp.cache({memory:16,files:0,items:16});
parentPort.on('message',async ({buffer})=>{
  try {parentPort.postMessage({media:await prepareGif(buffer)});}
  catch(error){parentPort.postMessage({error:error.message});}
});

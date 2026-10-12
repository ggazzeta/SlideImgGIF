// Read-only file preflight. Never connects to Studio or changes a source file.
import {lstat,readdir} from 'node:fs/promises';
import {basename,join,resolve,extname} from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {readMedia} from '../plugin/images.js';
import {inspectGif,GIF_LIMITS} from '../plugin/gif-media.js';
import {mediaPreparer} from '../plugin/media-preparer.js';
import {eligibleName} from '../plugin/slideshow.js';

export async function checkGifFile(file){
  const result={name:basename(file)};
  try{
    if(extname(file).toLowerCase()!=='.gif'||!eligibleName(result.name))throw new Error('Choose a visible, non-temporary .gif file');
    const {buffer,info}=await readMedia(file);result.compressedBytes=info.size;
    const meta=inspectGif(buffer);Object.assign(result,{width:meta.width,height:meta.height,frames:meta.frames,decodedPixels:meta.width*meta.height*meta.frames});
    const signature=createHash('sha256').update(buffer).digest('hex');
    const prepared=await mediaPreparer.prepare(buffer,signature);
    return {...result,accepted:true,preparedBytes:prepared.preparedBytes,signature};
  }catch(error){return {...result,accepted:false,reason:error.code?`Cannot read file (${error.code}); check access or filename.`:error.message};}
}

async function main(){
  const args=process.argv.slice(2),json=args.includes('--json'),input=args.find(arg=>arg!=='--json');
  if(!input)throw new Error('Usage: node tools/check-gifs.js "path to GIF or folder" [--json]');
  const target=resolve(input),info=await lstat(target);if(info.isSymbolicLink())throw new Error('Refusing a linked path');
  const files=info.isDirectory()?(await readdir(target,{withFileTypes:true})).filter(e=>e.isFile()&&!e.isSymbolicLink()&&eligibleName(e.name)&&extname(e.name).toLowerCase()==='.gif').map(e=>join(target,e.name)).sort():[target];
  const results=[],unique=new Map();
  for(const file of files){const result=await checkGifFile(file);if(result.accepted)unique.set(result.signature,result.preparedBytes);const {signature,...publicResult}=result;results.push(publicResult);if(!json)console.log(result.accepted?`PASS ${result.name}: ${result.width}×${result.height}, ${result.frames} frames, ${(result.preparedBytes/1024**2).toFixed(2)} MiB prepared`:`REJECT ${result.name}: ${result.reason}`);}
  const totalPreparedBytes=[...unique.values()].reduce((a,b)=>a+b,0),galleryLimitBytes=32*1024*1024;
  if(json)console.log(JSON.stringify({results,totalPreparedBytes,galleryLimitBytes,galleryFits:totalPreparedBytes<=galleryLimitBytes},null,2));
  else{console.log(`Unique accepted GIFs: ${unique.size}; ${(totalPreparedBytes/1024**2).toFixed(2)} MiB prepared (32 MiB gallery budget).`);if(totalPreparedBytes>galleryLimitBytes)console.log('The combined GIF gallery exceeds its budget; use a smaller selection. Static media also uses this budget.');}
  if(results.some(result=>!result.accepted)||totalPreparedBytes>galleryLimitBytes)process.exitCode=1;
}

if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){try{await main();}catch(error){console.error(error.code?`Cannot inspect input (${error.code}); check the path and access permissions.`:error.message);process.exitCode=1;}finally{mediaPreparer.cancel();}}

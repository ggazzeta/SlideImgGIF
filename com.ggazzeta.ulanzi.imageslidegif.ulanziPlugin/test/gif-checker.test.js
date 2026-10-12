import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,writeFile,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {checkGifFile} from '../tools/check-gifs.js';
import {fixtureGif} from './gif-fixtures.js';
import {mediaPreparer} from '../plugin/media-preparer.js';

test('download preflight uses actual bounded preparation, detects content mismatch and leaves source files unchanged',async()=>{
  const dir=await mkdtemp(join(tmpdir(),'gif-preflight-'));
  try{
    const gif=fixtureGif(),file=join(dir,'download.GIF');await writeFile(file,gif);
    const good=await checkGifFile(file);assert.equal(good.accepted,true);assert.equal(good.width,3);assert.equal(good.height,1);assert.equal(good.frames,2);assert.equal(good.decodedPixels,6);assert.ok(good.preparedBytes>0);assert.deepEqual(await readFile(file),gif);
    const bad=join(dir,'mismatch.gif');await writeFile(bad,'this is not GIF content');const rejected=await checkGifFile(bad);assert.equal(rejected.accepted,false);assert.match(rejected.reason,/not GIF content/);
    const excluded=await checkGifFile(join(dir,'.hidden.gif'));assert.equal(excluded.accepted,false);assert.match(excluded.reason,/visible/);
    const missing=await checkGifFile(join(dir,'missing.gif'));assert.equal(missing.accepted,false);assert.match(missing.reason,/ENOENT/);assert.equal(missing.reason.includes(dir),false);
  }finally{mediaPreparer.cancel();await rm(dir,{recursive:true,force:true,maxRetries:5,retryDelay:100});}
});

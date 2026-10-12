import test from 'node:test';
import assert from 'node:assert/strict';
import {enumerateFolder} from '../plugin/slideshow.js';

test('repeated folder scans preserve each original rejection reason and valid static media without reloading failures',async()=>{
  const files=['working.png','large.gif','broken.gif'];let loads=0;
  const fsApi={lstatSync:async()=>({isDirectory:()=>true,isFile:()=>true,isSymbolicLink:()=>false,size:10,mtimeMs:1}),readdirSync:async()=>files.map(name=>({name,isFile:()=>true,isSymbolicLink:()=>false}))};
  const loader=async file=>{loads++;if(file.endsWith('large.gif'))throw new Error('GIF frame count or decoded pixel budget exceeded');if(file.endsWith('broken.gif'))throw new Error('Truncated GIF');return {name:'working.png',signature:'static',dataUri:'data:image/png;base64,cG5n'};};
  const cache=new Map(),first=await enumerateFolder('C:/synthetic','name',fsApi,cache,loader),second=await enumerateFolder('C:/synthetic','name',fsApi,cache,loader);
  assert.equal(loads,3);assert.equal(first.rejected,2);assert.equal(second.rejected,2);assert.equal(second.slides[0].signature,'static');
  assert.deepEqual(second.errors,first.errors);assert.deepEqual(second.errors,['broken.gif: Truncated GIF','large.gif: GIF frame count or decoded pixel budget exceeded']);
  cache.clear();await enumerateFolder('C:/synthetic','name',fsApi,cache,loader);assert.equal(loads,6);
});

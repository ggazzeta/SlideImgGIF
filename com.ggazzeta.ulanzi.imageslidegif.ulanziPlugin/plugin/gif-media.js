import sharp from 'sharp';

export const GIF_LIMITS = Object.freeze({inputBytes:8*1024*1024,dimension:2048,frames:200,decodedPixels:20_000_000,outputPixels:20_000_000,outputBytes:16*1024*1024,cacheBytes:32*1024*1024,queuedJobs:8,timeoutMs:15000});
const WIDTH=458, HEIGHT=196;

// Validate structural bounds before any native decoder sees the frame stack.
// LZW decoding and disposal/partial-frame compositing are deliberately delegated to libvips.
export function inspectGif(input, limits=GIF_LIMITS) {
  const b=Buffer.from(input);
  if (!b.length || b.length>limits.inputBytes) throw new Error('GIF exceeds 8 MiB compressed limit');
  if (b.length<14 || !['GIF87a','GIF89a'].includes(b.toString('ascii',0,6))) throw new Error('File is not GIF content');
  const width=b.readUInt16LE(6),height=b.readUInt16LE(8);
  if (!width||!height||width>limits.dimension||height>limits.dimension) throw new Error('GIF dimensions exceed 2048 per side');
  let pos=13,frames=0,loop=1,delays=[],delay=0;
  function requireBytes(n) {if(pos+n>b.length)throw new Error('Truncated GIF');}
  function blocks() { const parts=[];while(true){requireBytes(1);const size=b[pos++];if(!size)break;requireBytes(size);parts.push(b.subarray(pos,pos+size));pos+=size;}return Buffer.concat(parts); }
  if(b[10]&128){const bytes=3*(2**((b[10]&7)+1));requireBytes(bytes);pos+=bytes;}
  while(pos<b.length){
    const marker=b[pos++];
    if(marker===0x3b){
      if(!frames || pos!==b.length)throw new Error('Invalid GIF trailer');
      return {width,height,frames,loop,delays};
    }
    if(marker===0x21){
      requireBytes(1);const label=b[pos++];
      const payload=blocks();
      if(label===0xf9){if(payload.length!==4)throw new Error('Invalid GIF frame control');delay=payload.readUInt16LE(1)*10;}
      if(label===0xff && /^(NETSCAPE2\.0|ANIMEXTS1\.0)/.test(payload.toString('ascii',0,11)) && payload.length>=14 && payload[11]===1){const repeats=payload.readUInt16LE(12);loop=repeats===0?0:repeats+1;}
      continue;
    }
    if(marker!==0x2c)throw new Error('Invalid GIF block');
    requireBytes(9);
    const x=b.readUInt16LE(pos),y=b.readUInt16LE(pos+2),w=b.readUInt16LE(pos+4),h=b.readUInt16LE(pos+6),packed=b[pos+8];pos+=9;
    if(!w||!h||x+w>width||y+h>height)throw new Error('GIF partial frame exceeds canvas');
    frames++;if(frames>limits.frames || frames*width*height>limits.decodedPixels || frames*WIDTH*HEIGHT>limits.outputPixels)throw new Error('GIF frame count or decoded pixel budget exceeded');
    delays.push(delay);delay=0;
    if(packed&128){const bytes=3*(2**((packed&7)+1));requireBytes(bytes);pos+=bytes;}
    requireBytes(1);const codeSize=b[pos++];if(codeSize<2||codeSize>8)throw new Error('Invalid GIF LZW code size');blocks();
  }
  throw new Error('Truncated GIF: missing trailer');
}

export async function prepareGif(input,limits=GIF_LIMITS) {
  const buffer=Buffer.from(input),source=inspectGif(buffer,limits);
  if(source.loop>65535||source.delays.some(delay=>delay>65535))throw new Error('GIF timing exceeds the pinned encoder range; reduce loop count or long frame delays');
  const image=sharp(buffer,{animated:true,limitInputPixels:limits.decodedPixels,failOn:'warning'}).timeout({seconds:10});
  const meta=await image.metadata();
  if(meta.format!=='gif' || (meta.pages||1)!==source.frames || meta.width!==source.width || (meta.pageHeight||meta.height)!==source.height)throw new Error('GIF decoded metadata mismatch');
  const {data,info}=await image.ensureAlpha().raw().toBuffer({resolveWithObject:true});
  if(info.width!==source.width || info.height!==source.height*source.frames || info.channels!==4)throw new Error('GIF decoded strip mismatch');
  const size=source.width*source.height*4,normalized=[],frames=[];
  let preparedBytes=0;
  for(let i=0;i<source.frames;i++){
    const frame=await sharp(data.subarray(i*size,(i+1)*size),{raw:{width:source.width,height:source.height,channels:4}}).timeout({seconds:10}).resize(WIDTH,HEIGHT,{fit:'cover',position:'centre'}).raw().toBuffer();
    normalized.push(frame);
    const png=await sharp(frame,{raw:{width:WIDTH,height:HEIGHT,channels:4}}).timeout({seconds:10}).png().toBuffer();
    const uri=`data:image/png;base64,${png.toString('base64')}`;
    frames.push(uri);preparedBytes+=Buffer.byteLength(uri);
    if(preparedBytes>limits.outputBytes)throw new Error('Prepared GIF exceeds 16 MiB');
  }
  // Preserve source frame delays and explicit finite iteration count, including absent loop extension.
  const gif=await sharp(Buffer.concat(normalized),{raw:{width:WIDTH,height:HEIGHT*source.frames,channels:4,pageHeight:HEIGHT}}).timeout({seconds:10})
    .gif({delay:source.delays,loop:source.loop,keepDuplicateFrames:true,interFrameMaxError:0,interPaletteMaxError:0}).toBuffer();
  const gifdata=`data:image/gif;base64,${gif.toString('base64')}`;preparedBytes+=Buffer.byteLength(gifdata);
  if(preparedBytes>limits.outputBytes)throw new Error('Prepared GIF exceeds 16 MiB');
  return {kind:'gif',gifdata,dataUri:frames[0],frames,delays:source.delays,loop:source.loop,preparedBytes,width:WIDTH,height:HEIGHT,resized:source.width!==WIDTH||source.height!==HEIGHT};
}

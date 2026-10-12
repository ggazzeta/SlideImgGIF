// Deliberately never launched by the plugin. Sending to Studio requires an approved manual operation.
import sharp from 'sharp';
import { writeFile, mkdir } from 'node:fs/promises';
import { UlanziProtocolClient } from '../plugin/protocol-client.js';

export async function syntheticGif() {
  const width = 458, height = 196;
  const frames = [[255,0,0], [0,255,0], [0,0,255]].map(color => {
    const b = Buffer.alloc(width * height * 3);
    for (let i=0; i<b.length; i+=3) { b[i]=color[0]; b[i+1]=color[1]; b[i+2]=color[2]; }
    return b;
  });
  return sharp(Buffer.concat(frames), {raw:{width,height:height*3,channels:3,pageHeight:height}})
    .gif({delay:[200,400,600],loop:0}).toBuffer();
}

if (process.argv.includes('--generate')) {
  await mkdir('probe-output', {recursive:true});
  const gif = await syntheticGif();
  await writeFile('probe-output/synthetic.gif', gif);
  await writeFile('probe-output/poster.png', await sharp(gif).png().toBuffer());
  await writeFile('probe-output/state.json', JSON.stringify({cmd:'state',uuid:'ACTION_UUID',key:'3_2',actionid:'EXACT_ACTION_ID',param:{statelist:[{uuid:'ACTION_UUID',key:'3_2',actionid:'EXACT_ACTION_ID',type:3,gifdata:`data:image/gif;base64,${gif.toString('base64')}`,textData:'',showtext:false}]}}, null, 2));
}

// Intentionally no auto-discovery of contexts and no profile modifications.
if (process.argv.includes('--send-approved')) {
  const context = process.env.GIF_PROBE_CONTEXT;
  if (!context) throw new Error('Provide the exact manually approved GIF_PROBE_CONTEXT');
  const client = new UlanziProtocolClient();
  const gif = await syntheticGif();
  client.onError(()=>{});
  client.onConnected(()=>{
    client.setGifDataIcon(context, `data:image/gif;base64,${gif.toString('base64')}`);
    setTimeout(async()=>{client.setBaseDataIcon(context, `data:image/png;base64,${(await sharp(gif).png().toBuffer()).toString('base64')}`);client.close();},10000);
  });
  client.connect(context.split('___')[0].split('.').slice(0,4).join('.'));
}

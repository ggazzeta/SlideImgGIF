// Deliberately never launched by the plugin. Sending to Studio requires an approved manual operation.
import sharp from 'sharp';
import { writeFile, mkdir } from 'node:fs/promises';
export {syntheticGif} from '../plugin/capability-probe.js';
import {syntheticGif} from '../plugin/capability-probe.js';

if (process.argv.includes('--generate')) {
  await mkdir('probe-output', {recursive:true});
  const gif = await syntheticGif();
  await writeFile('probe-output/synthetic.gif', gif);
  await writeFile('probe-output/poster.png', await sharp(gif).png().toBuffer());
  await writeFile('probe-output/state.json', JSON.stringify({cmd:'state',uuid:'ACTION_UUID',key:'3_2',actionid:'EXACT_ACTION_ID',param:{statelist:[{uuid:'ACTION_UUID',key:'3_2',actionid:'EXACT_ACTION_ID',type:3,gifdata:`data:image/gif;base64,${gif.toString('base64')}`,textData:'',showtext:false}]}}, null, 2));
}

// Intentionally no auto-discovery of contexts and no profile modifications.
if (process.argv.includes('--send-approved')) {
  throw new Error('Standalone send disabled to avoid duplicate main connections. After approval, launch Studio with GG_IMAGESLIDE_GIF_PROBE_CONTEXT set to the exact fork context; see MANUAL_VALIDATION.md.');
}

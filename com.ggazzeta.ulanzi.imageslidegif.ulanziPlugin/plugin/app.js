import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { UlanziProtocolClient } from "./protocol-client.js";
import { ACTION_UUID, PLUGIN_UUID, loadConfiguration } from "./slideshow.js";
import {ProfileRuntime} from './profile-runtime.js';
import { SetupService } from "./setup.js";
import {createCapabilityProbe} from './capability-probe.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const client = new UlanziProtocolClient();
const service = new ProfileRuntime({ client, configuration: await loadConfiguration(root) });
const setup = new SetupService({ client, root });
const probe=process.env.GG_IMAGESLIDE_GIF_PROBE_CONTEXT
  ? await createCapabilityProbe({client,context:process.env.GG_IMAGESLIDE_GIF_PROBE_CONTEXT}) : null;
if(probe){client.onError(()=>{});probe.bind();}else{service.bind();setup.bind();}
client.connect(PLUGIN_UUID);

function shutdown() { probe?.close();service.close(); setup.close(); client.close(); }
process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);

export { ACTION_UUID, PLUGIN_UUID };

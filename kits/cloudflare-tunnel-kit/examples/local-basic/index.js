import { parseCloudflaredTunnelUrl, toPublicWsUrl } from '../../src/index.js';

const log = 'Your quick Tunnel has been created! Visit it at https://abc-def.trycloudflare.com';
const publicUrl = parseCloudflaredTunnelUrl(log);
console.log(JSON.stringify({ publicUrl, publicWsUrl: toPublicWsUrl(publicUrl) }, null, 2));

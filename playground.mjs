import { promisify } from 'node:util';
import { exec as callbackExec } from 'node:child_process';
const exec  = promisify(callbackExec);
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';


const appDir = resolve(fileURLToPath(import.meta.url));
console.log(appDir);
const mediaUrl = 'https://music.youtube.com/watch?v=BVOFGnrrNi4&feature=share';

try {
    const {stdout, stderr} = await exec(`yt-dlp -j "${mediaUrl}"`);
    console.log(JSON.parse(stdout));
} catch (e) {
    console.log("There was an error");
}
// localhost:8080/api/v1/media-metadata?url=https%3A%2F%2Fmusic.youtube.com%2Fwatch%3Fv%3DtcL2B0ilMZw%26feature%3Dshare
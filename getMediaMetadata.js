'use strict';

const { promisify } = require('util');
const exec  = promisify(require('child_process').exec);

async function getMediaMetadata(mediaUrl) {
    const cmdResult = await exec(
        `yt-dlp -j "${mediaUrl}"`
    );
    const {stdout, stderr} = cmdResult;
    const {
        title,
        artist,
        thumbnails,
        channel,
        release_year,
        duration_string: duration
    } = JSON.parse(stdout);
    const thumbnail = thumbnails[5].url;
    return {
        title,
        artist,
        thumbnail,
        channel,
        release_year,
        duration
    }
}

module.exports = getMediaMetadata;
'use strict';

const filenameRegex = new RegExp(
    `\\[ExtractAudio\\] Destination: /.*?/media/(.*? - .*?\\.f\\d{1,}\\.mp3)`
);
function extractMediaName(cliOutput) {
    let filename = cliOutput.match(filenameRegex)[1];
    return filename;
}

module.exports = extractMediaName;
'use strict';
const regex = new RegExp(
    `\\[download\\] /.*?/media/(.*? - .*?\\.f\\d{1,}\\.mp3) has already been downloaded`
);
function wasDownloaded(text) {
    const matches = text.match(regex);
    if (matches === null) {
        return null;
    }
    return matches[1];
}

module.exports = wasDownloaded;
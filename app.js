'use strict';

const { promisify } = require('util');
const exec  = promisify(require('child_process').exec);
const { resolve, dirname } = require('path');
const { opendir } = require('fs/promises');
const express = require('express');

const extractMediaName = require('./extractMediaName.js');
const wasDownloaded = require('./wasDownloaded.js');
const getMediaMetadata = require('./getMediaMetadata.js');

const app = express();
const appDir = resolve(__dirname);
const port = 8080;

// Middleware
app.use('/media', express.static(resolve(appDir, 'media')));
app.use('/pub/js', express.static(resolve(appDir, 'assets/js')));
app.use('/pub/css', express.static(resolve(appDir, 'assets/css')));

// Main app page (and only one by the moment)
app.get('/', (req, res) => {
    res.sendFile(resolve(appDir, './public/index.html'));
});


app.get('/api/v1/download-audio', async (req, res, next) => {
    const mediaUrl = decodeURIComponent(req.query.url);
    let cmdResult;
    try {
        cmdResult = await exec(
            `yt-dlp --no-playlist -f 'ba' -x --audio-format mp3 "${mediaUrl}" -o '${appDir}/media/%(artist)s - %(title)s.f%(format_id)s.%(ext)s'`
        );
    } catch (e) {
        res.send("FAIL");
        return next();
    }

    const {stdout, stderr} = cmdResult;
    const alreadyDownloaded = wasDownloaded(stdout);
    if (alreadyDownloaded) {
        res.send(`ALREADY_DOWNLOADED ${alreadyDownloaded}`);
        return next();
    }

    let metadata = null;
    try {
        metadata = await getMediaMetadata(mediaUrl);
    } catch (e) {
        // continue
    }

    try {
        const filename = extractMediaName(stdout);
        const downloadLink = `/media/${encodeURIComponent(filename)}`;
        res.json({
            downloadLink,
            metadata: metadata === null ? null : metadata
        });
    } catch (e) {
        res.send("FAIL");
        return next();
    }
});

app.get('/api/v1/downloaded-media', async (req, res, next) => {
    let dir;
    const files = [];
    try {
        dir = await opendir(resolve(appDir, 'media'));
        for await (const dirEntry of dir) {
            if (!dirEntry.isFile() || !dirEntry.name.includes('.mp3')) {
                continue;
            }
            files.push(resolve('/media', encodeURIComponent(dirEntry.name)));
        }
    } catch (e) {
        res.send('FAIL');
        return next();
    }

    res.json(files);
});

app.get('/api/v1/media-metadata', async (req, res, next) => {
    const mediaUrl = decodeURIComponent(req.query.url);
    try {
        const metadata = await getMediaMetadata(mediaUrl);
        res.json(metadata);
    } catch (e) {
        console.error(e);
        res.send("FAIL");
        return next();
    }
});

app.listen(port, () => {
    console.log(`App is running on port ${port}`);
});
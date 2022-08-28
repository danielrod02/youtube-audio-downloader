'use strict';

const { exec } = require('child_process');
const { resolve } = require('path');
const { opendir } = require('fs/promises');
const express = require('express');

const extractMediaName = require('./extractMediaName.js');

const app = express();
const appDir = resolve(__dirname);
const port = 8080;

// Middleware
app.use('/media', express.static(resolve(appDir, 'media')));

// Main app page (and only one by the moment)
app.get('/', (req, res) => {
    res.sendFile(resolve(appDir, './public/index.html'));
});


app.get('/api/v1/download-audio', (req, res, next) => {
    const mediaUrl = decodeURIComponent(req.query.url);
    exec(
        `yt-dlp --no-playlist -f 'ba' -x --audio-format mp3 "${mediaUrl}" -o '${appDir}/media/%(artist)s - %(title)s.f%(format_id)s.%(ext)s'`,
        (error, stdout, stderr) => {
            if (error) {
                res.send("FAIL");
                return next();
            }

            // console.log(stdout);
            try {
                const filename = extractMediaName(stdout);
                res.send(`/media/${encodeURIComponent(filename)}`);
            } catch (e) {
                res.send("FAIL");
                return next();
            }
        }
    );
});

app.get('/api/v1/downloaded-media', async (req, res, next) => {
    let dir;
    try {
        dir = await opendir(resolve(appDir, 'media'));
    } catch (e) {
        res.send('FAIL');
        return next();
    }
    
    const files = [];
    try {
        for await (const dirEntry of dir) {
            if (!dirEntry.isFile()) {
                continue;
            }
            files.push(resolve('/media', encodeURIComponent(dirEntry.name)));
        }
    } catch (e) {
        dir.close();
        res.send('FAIL');
        return next();
    }

    res.json(files);
});

app.listen(port, () => {
    console.log(`App is running on port ${port}`);
});
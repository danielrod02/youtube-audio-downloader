const { readdir } = require('fs/promises');
const { unlinkSync, statSync: stat } = require('fs');
const { resolve } = require('path');
const cron = require('node-cron');


const appDir = resolve(__dirname);

cron.schedule('*/10 * * * *', () => {
    readdir(resolve(appDir, 'media')).then((files) => {
        for (const file of files) {
            const filePath = resolve(appDir, `media/${file}`);
            if (
                file.endsWith('.mp3') &&
                (Date.now() - stat(filePath).birthtimeMs > 600000)
            ) {
                try {
                    unlinkSync(filePath);
                } catch (e) {
                    console.log('error deleting', file);
                }
            }
        }
        process.send(1);
    });
});
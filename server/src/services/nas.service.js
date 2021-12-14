import * as fs from 'fs';
import chokidar from 'chokidar';
import { getAppConfig } from './appConfig.service';
import { parseReleaseName } from '../utils/parseReleaseName';
import { isTitleInFilterConfigs } from './showConfig.service';
import { logger } from '../utils/logger';
import { addLog } from './log.service';

const videoExtensions = ['mp4', 'mov', 'avi', 'mkv', 'mpg', 'mpeg'];
let nasAvailable = false;
const nasCopyQueue = [];
let copyInProgress = false;
let queueInProgress = false;
const LOG_LABEL = `{red}[NAS]{/red}`;

const getNasDirs = async () => {
    if (!nasAvailable) {
        return [];
    }

    const nasConfig = await getAppConfig('nas');
    return fs.readdirSync(nasConfig.targetDir).filter(fn => fn[0] !== '.');
};

export const getNasTVShowData = async () => {
    const nasConfig = await getAppConfig('nas');
    const tvShowDirs = await getNasDirs();
    const nasShowData = [];

    for (const dir of tvShowDirs) {
        const episodes = fs.readdirSync(nasConfig.targetDir + '/' + dir)
            .filter(fn => fn[0] !== '.')
            .filter(fn => videoExtensions.includes(fn.toLowerCase().split('.').slice(-1).pop()));
        for (const episode of episodes) {
            const episodeInfo = parseReleaseName(episode);
            if (episodeInfo) {
                nasShowData.push({
                    name: episodeInfo.name,
                    season: episodeInfo.season,
                    episode: episodeInfo.episode,
                    file: episode
                });
            }
        }
    }

    return nasShowData;
};

export const copyDownloadedTorrentToNas = async (torrent) => {
    if (!nasAvailable) {
        nasCopyQueue.push(torrent);
        logger.warn(`${LOG_LABEL} NAS is unavailable. Adding {red}${torrent.name}{/red} to the queue.`);
        return false;
    }

    if (copyInProgress) {
        logger.warn(`${LOG_LABEL} Copy is in progress. Adding {red}${torrent.name}{/red} to the queue.`);
        nasCopyQueue.push(torrent);
        return;
    }

    copyInProgress = true;

    const nasConfig = await getAppConfig('nas');
    const filterConfig = await isTitleInFilterConfigs(torrent.name);
    const episodeInfo = parseReleaseName(torrent.name);

    if (!filterConfig) {
        logger.error(`${LOG_LABEL} {red}${torrent.name}{/red} is not found in the filters. Don't know what to do.`);
        copyInProgress = false;
        return;
    }

    const targetDir = `${nasConfig.targetDir}/${filterConfig.targetDirName}`;
    const visualName = `${episodeInfo.name} ${episodeInfo.season}x${('0' + episodeInfo.episode).slice(-2)}`;

    try {
        if (!fs.existsSync(targetDir)) {
            logger.info(`${LOG_LABEL} ${filterConfig.targetDirName} directory is not exist. Creating.`);
            fs.mkdirSync(targetDir);
        }
    } catch (e) {
        logger.info(`${LOG_LABEL} Error creating ${filterConfig.targetDirName} directory on NAS.`);
    }

    try {
        const filteredFiles = torrent.files.filter(file => file.name.match(nasConfig.fileFilter));
        const filesForLog = [];
        for (const file of filteredFiles) {
            const targetFile = `${targetDir}/${file.name}`;
            if (fs.existsSync(targetFile) && fs.statSync(file.path).size === fs.statSync(targetFile).size) {
                logger.info(`${LOG_LABEL} ${file.name} is already exists on NAS.`);
            } else {
                logger.info(`${LOG_LABEL} Copying ${file.name} (${visualName}) to NAS.`);
                await fs.promises.copyFile(file.path, targetFile);
                logger.info(`${LOG_LABEL} {green}{bold}${file.name}{/bold}{/green} copied to NAS.`);
                filesForLog.push(file.name);
            }
        }
        await addLog({
            event: 'DATA_COPIED_TO_NAS',
            showName: episodeInfo.name,
            season: episodeInfo.season,
            episode: episodeInfo.episode,
            data: {
                files: filesForLog
            }
        });
    } catch (e) {
        logger.error(`${LOG_LABEL} Error while copying {red}${visualName}{/red} to NAS. ${e}`);
    }

    copyInProgress = false;

    if (nasCopyQueue.length && !queueInProgress) {
        queueInProgress = true;

        while (nasCopyQueue.length) {
            const torrentData = nasCopyQueue.shift();
            await copyDownloadedTorrentToNas(torrentData);
        }
        queueInProgress = false;
    }



};

// checks mounted nas file changes
const nasWatcher = async (nasConfig) => {
    if (fs.existsSync(nasConfig.targetDir)) {
        await new Promise(resolve => {
            const watcher = chokidar.watch(nasConfig.targetDir, {
                ignored: /^\./,
                persistent: true,
                usePolling: true,
                interval: 100
            });

            const fileUnlinked = (file) => {
                // is this unlinked or nas unmounted?
                if (!fs.existsSync(nasConfig.targetDir)) {
                    // unmounted, go back to nasService while loop
                    watcher.unwatch(nasConfig.targetDir);
                    resolve();
                }
                // todo: sync data
            };

            const fileAdded = (file) => {
                // todo: sync data
            };

            watcher
                .on('add', fileAdded)
                .on('unlink', fileUnlinked);
        });
    }
};

// waits for nas mount
const nasMountWatcher = async (nasConfig) => {
    const watcher = chokidar.watch(nasConfig.targetDir, {ignored: /^\./, persistent: true, usePolling: true, interval: 100});

    await new Promise((resolve) => {
        const mounted = () => {
            if (fs.existsSync(nasConfig.targetDir)) {
                watcher.unwatch(nasConfig.targetDir);
                resolve();
            }
        };
        watcher.on('all', mounted).on('raw', mounted);
    });
};

const checkNas = async (nasConfig, serviceStart) => {
    if (fs.existsSync(nasConfig.targetDir)) {
        nasAvailable = true;

        logger.info(`${LOG_LABEL} NAS is available.`);

        // it is mounted since app start
        const itemsInQueue = nasCopyQueue.length;
        if (serviceStart === false && itemsInQueue > 0) {
            logger.info(`${LOG_LABEL} ${itemsInQueue} item(s) waiting in copy queue.`);

            // others will be handled by copyDownloadedTorrentToNas
            const torrent = nasCopyQueue.shift();
            await copyDownloadedTorrentToNas(torrent);
        }
    } else {
        nasAvailable = false;

        logger.error(`${LOG_LABEL} {red}{bold}NAS target dir in unavailable. Is NAS mounted?{/bold}{/red}`);
        logger.error(`${LOG_LABEL} NAS related features are disabled.`);
        logger.info(`${LOG_LABEL} turning on NAS watcher.`);

        await nasMountWatcher(nasConfig);
        await checkNas(nasConfig, false);
    }
};

export const nasService = async () => {
    const nasConfig = await getAppConfig('nas');

    await checkNas(nasConfig, true);
    // eslint-disable-next-line
    // while (true) {
    await nasWatcher(nasConfig);
    await checkNas(nasConfig, false);
    // todo: repeat somehow
    // }
};


export default {
    getNasTVShowData,
    copyDownloadedTorrentToNas,
    nasService
};

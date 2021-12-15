import * as fs from 'fs';
import chokidar from 'chokidar';
import { getAppConfig } from './appConfig.service';
import { parseReleaseName } from '../utils/parseReleaseName';
import { isTitleInFilterConfigs } from './showConfig.service';
import { logger } from '../services/log.service';
import { addLog } from './log.service';

const LOG_LABEL = `{green}[NAS]{/green}`;
const videoExtensions = ['mp4', 'mov', 'avi', 'mkv', 'mpg', 'mpeg'];
const nasCopyQueue = [];

let copyInProgress = false;
let queueInProgress = false;
let nasAvailable = null;
let watcher = null;
let watcherPrevPath = null;

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

const checkNas = async (nasConfig, serviceStart) => {
    if ((nasAvailable === false || serviceStart) && fs.existsSync(nasConfig.targetDir)) {
        nasAvailable = true;

        logger.info(`${LOG_LABEL} NAS is available.`);

        // it is mounted since app start
        const itemsInQueue = nasCopyQueue.length;
        if (serviceStart === false && itemsInQueue > 0) {
            logger.info(`${LOG_LABEL} ${itemsInQueue} item${itemsInQueue === 1 ? ' is' : 's are'} waiting in copy queue.`);

            // others will be handled by copyDownloadedTorrentToNas
            const torrent = nasCopyQueue.shift();
            await copyDownloadedTorrentToNas(torrent);
        }
    }

    if ((nasAvailable === true || serviceStart) && !fs.existsSync(nasConfig.targetDir)) {
        nasAvailable = false;

        logger.error(`${LOG_LABEL} {red}{bold}NAS target dir in unavailable. Is NAS mounted?{/bold}{/red}`);
        logger.error(`${LOG_LABEL} NAS related features are disabled.`);
    }
};

const nasFsWatcher = (path) => {
    if (watcher && watcherPrevPath) {
        watcher.unwatch(watcherPrevPath);
    }
    watcherPrevPath = path;

    const fileUnlinked = (file) => {
        // is a file deleted or the nas unmounted?
        if (fs.existsSync(path)) {
            console.log('event - file unlinked - ' + file);
            // TODO: sync data
        }
    };

    const fileAdded = (file) => {
        console.log('event - file added - ' + file);
        // TODO: sync data
    };

    watcher = chokidar.watch(path, {
        ignored: /^\./,
        persistent: true,
        usePolling: true,
        interval: 1000,
        ignoreInitial: true
    });

    watcher.on('add', fileAdded).on('unlink', fileUnlinked);
};

export const nasService = async () => {
    const nasConfig = await getAppConfig('nas');

    await checkNas(nasConfig, true);
    nasFsWatcher(nasConfig.targetDir);

    setInterval(() => {
        checkNas(nasConfig, false);
    }, 2000);
};


export default {
    getNasTVShowData,
    copyDownloadedTorrentToNas,
    nasService
};

import * as fs from 'fs';
import { getAppConfig } from './appConfig.service';
import { parseReleaseName } from '../utils/parseReleaseName';
import { isTitleInFilterConfigs } from './showConfig.service';
import { logger } from '../utils/logger';
import { addLog } from './log.service';

const videoExtensions = ['mp4', 'mov', 'avi', 'mkv', 'mpg', 'mpeg'];
let nasAvailable = false;
const LOG_LABEL = `{red}[NAS]{/red}`;

const getNasDirs = async () => {
    if (!nasAvailable) {
        return [];
    }

    const nasConfig = await getAppConfig('nas');
    return fs.readdirSync(nasConfig.targetDir).filter(fn => fn[0] !== '.');
};

export const nasService = async () => {
    const nasConfig = await getAppConfig('nas');

    if (fs.existsSync(nasConfig.targetDir)) {
        logger.debug(`${LOG_LABEL} NAS is available.`);
        nasAvailable = true;
    } else {
        logger.error(`${LOG_LABEL} {red}{bold}NAS target dir in unavailable. Is NAS mounted?{/bold}{/red}`);
        logger.error(`${LOG_LABEL} NAS related features are disabled.`);
        nasAvailable = false;
    }

    return nasAvailable;
};

export const getNasShowData = async () => {
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
        return false;
    }

    const nasConfig = await getAppConfig('nas');
    const filterConfig = await isTitleInFilterConfigs(torrent.name);
    const episodeInfo = parseReleaseName(torrent.name);

    if (!filterConfig) {
        logger.error(`${LOG_LABEL} {red}${torrent.name}{/red} is not found in the filters. Don't know what to do.`);
        return;
    }

    const targetDir = `${nasConfig.targetDir}/${filterConfig.targetDirName}`;
    const visualName = `${episodeInfo.name} ${episodeInfo.season}x${('0' + episodeInfo.episode).slice(-2)}`;

    try {
        if (!fs.existsSync(targetDir)) {
            logger.info(`${LOG_LABEL} ${filterConfig.targetDirName} directory is not exist. Creating...`);
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
                logger.info(`${LOG_LABEL} Copying ${file.name} ${visualName} to NAS.`);
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
};

export default {
    getNasShowData,
    copyDownloadedTorrentToNas,
    nasService
};

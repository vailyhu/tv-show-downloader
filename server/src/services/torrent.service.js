import WebTorrent from 'webtorrent';
import * as path from 'path';
import chokidar from 'chokidar';
import fs from 'fs';
import { getAppConfig } from './appConfig.service';
import { logger } from '../utils/logger';
import { formatBytes } from '../utils/formatBytes';
import { toHHMMSS } from '../utils/toHHMMSS';
import { copyDownloadedTorrentToNas } from './nas.service';
import { Torrent } from '../models/torrent.model';
import { addLog } from './log.service';
import { parseReleaseName } from '../utils/parseReleaseName';

// TODO: check ratio and seed time

const LOG_LABEL = `{magenta}[TORRENT]{/magenta}`;
const TORRENT_DB_UPDATE_INTERVAL = 5;
const torrentFileMap = [];
const client = new WebTorrent();

client.on('error', function (err) {
    logger.error(`${LOG_LABEL} Torrent error!`);
    console.log(err);
});

const getTorrentStatus = async (torrent) => {
    const id = torrent.infoHash + ':' + torrent.name;
    const torrentDataInDb = await Torrent.findOne({id});
    const unixTimestamp = Math.floor(+new Date() / 1000);
    const seedTime = torrent.done && torrentDataInDb ? torrentDataInDb.seedTime + unixTimestamp - torrentDataInDb.lastUpdate : 0;

    return {
        name: torrent.name,
        uploadSpeed: formatBytes(torrent.uploadSpeed),
        downloadSpeed: formatBytes(torrent.downloadSpeed),
        progress: parseFloat((torrent.progress * 100).toFixed(1), 2),
        ratio: torrentDataInDb ? parseFloat((torrentDataInDb.uploaded / torrentDataInDb.downloaded).toFixed(2)) : 0,
        downloaded: torrentDataInDb ? formatBytes(torrentDataInDb.downloaded) : 0,
        uploaded: torrentDataInDb ? formatBytes(torrentDataInDb.uploaded) : 0,
        timeRemaining: torrent.timeRemaining ? toHHMMSS(torrent.timeRemaining / 1000) : 0,
        seedTime,
        done: torrent.done
    };
};

const updateTorrentInDb = async (torrent, added = false) => {
    const id = torrent.infoHash + ':' + torrent.name;
    const unixTimestamp = Math.floor(+new Date() / 1000);

    const torrentDataInDb = await Torrent.findOne({id});

    if (torrentDataInDb) {
        const seedTime = added ? torrentDataInDb.seedTime : torrentDataInDb.seedTime + unixTimestamp - torrentDataInDb.lastUpdate;
        try {
            await Torrent.update({id}, {$set: {
                downloaded: torrent.downloaded,
                uploaded: torrent.uploaded + torrentDataInDb.uploaded,
                lastUpdate: unixTimestamp,
                seedTime: torrent.done ? seedTime : 0
            }});
        } catch (e) {
            logger.error(`${LOG_LABEL} error updating ${id} in db.`);
        }
    } else {
        try {
            await Torrent.insert({
                id,
                downloaded: torrent.downloaded,
                uploaded: torrent.uploaded,
                lastUpdate: unixTimestamp,
                seedTime: 0
            });
        } catch (e) {
            logger.error(`${LOG_LABEL} error inserting ${id} to db.`);
        }
    }
};

const removeTorrentFromDb = async (torrent) => {
    const id = torrent.infoHash + ':' + torrent.name;
    try {
        await Torrent.remove({id}, {});
    } catch (e) {
        logger.error(`${LOG_LABEL} error deleting ${id} from db.`);
    }
};

export const removeTorrent = async (fileName) => {
    const torrentData = torrentFileMap.find(map => map.fileName === fileName);
    if (torrentData) {
        logger.info(`${LOG_LABEL} Torrent file of ${torrentData.torrent.name} is deleted. Stopping.`);
        await removeTorrentFromDb(torrentData.torrent);
        client.remove(torrentData.torrent);
    }
};

export const getTorrents = () => client.torrents.map(t => t.name);

export const addTorrent = async (fileName) => {
    const torrentConfig = await getAppConfig('torrent');
    logger.info(`${LOG_LABEL} Adding ${path.basename(fileName)}`);
    try {
        client.add(fileName, {path: torrentConfig.torrentDir}, (torrent) => {
            torrentFileMap.push({fileName, torrent});
            torrent.on('ready', () => logger.debug(`${LOG_LABEL} ${torrent.name} is added.`));
            torrent.on('warning', (warning) => logger.warn(`${LOG_LABEL} ${torrent.name}: ${warning}`));
            torrent.on('error', (error) => logger.warning(`${LOG_LABEL} ${torrent.name}: ${error}`));
            torrent.on('noPeers', () => !torrent.done && logger.warn(`${LOG_LABEL} ${torrent.name}: No peer available.`));
            torrent.on('done', async () => {
                const episodeData = parseReleaseName(torrent.name);
                const torrentStatus = await getTorrentStatus(torrent);
                await addLog({
                    event: 'TORRENT_DATA_DOWNLOADED',
                    showName: episodeData.name,
                    season: episodeData.season,
                    episode: episodeData.episode,
                    data: {
                        name: torrent.name,
                        downloadedSize: torrentStatus.downloaded
                    }
                });
                logger.info(`${LOG_LABEL} {green}{bold}${torrent.name}{/bold}{/green} is downloaded, seeding.`);
                await copyDownloadedTorrentToNas(torrent);
            });
            updateTorrentInDb(torrent, true);
            setInterval(() => updateTorrentInDb(torrent), TORRENT_DB_UPDATE_INTERVAL * 1000);
        });
    } catch (e) {
        logger.error(`${LOG_LABEL} Error fetching ${fileName}`);
    }

    setInterval(async () => {
        for (const torrent of client.torrents) {
            torrent.ready && !torrent.done && console.log(await getTorrentStatus(torrent));
        }
    }, 2000);
};

const destroyClient = () => {
    if (client.torrents.length > 0) {
        logger.info('${LOG_LABEL} Stopping torrents.');
    }
    try {
        client.destroy();
    } catch (e) {
        // nothing to do...
    }
};

export const torrentService = async () => {
    const torrentConfig = await getAppConfig('torrent');
    if (fs.existsSync(torrentConfig.watchDir)) {
        const watcher = chokidar.watch(torrentConfig.watchDir, {ignored: /^\./, persistent: true});

        watcher
            .on('add', (file) => addTorrent(file))
            .on('unlink', (file) => removeTorrent(file));
    } else {
        logger.error(`${LOG_LABEL} Watch dir ${torrentConfig.watchDir} is not exists!`);
    }
};

const exitHandler = (options, err) => {
    if (err && typeof err !== 'number') {
        console.log(err);
    }
    if (options.exit) {
        destroyClient();
        process.exit();
    }
};

process.stdin.resume();
process.on('exit', exitHandler.bind(null, {cleanup: true}));
process.on('SIGINT', exitHandler.bind(null, {exit: true}));
process.on('SIGUSR1', exitHandler.bind(null, {exit: true}));
process.on('SIGUSR2', exitHandler.bind(null, {exit: true}));
process.on('uncaughtException', exitHandler.bind(null, {exit: true}));

export default {
    addTorrent,
    getTorrents,
    removeTorrent,
    torrentService
};

import Parser from 'rss-parser';
import * as fs from 'fs';
import Downloader from 'nodejs-file-downloader';
import { getAppConfig } from './appConfig.service';
import { logger } from '../utils/logger';
import { isTitleInFilterConfigs } from './showConfig.service';
import { getNasShowData } from './nas.service';
import { isTheSameEpisode, parseReleaseName } from '../utils/parseReleaseName';
import { getTorrents } from './torrent.service';
import { addLog } from './log.service';

const LOG_LABEL = '{cyan}[RSS]{/cyan}';
let isTorrentDownloadedSinceAppStart = false;

export const validateRssFeed = async (feedUrl) => {
    const parser = new Parser();
    try {
        await parser.parseURL(feedUrl);
    } catch (e) {
        return 'Can not fetch the RSS Feed URL';
    }
    return true;
};

export const getFeeds = async () => {
    const config = await getAppConfig('rss');
    const parser = new Parser();
    let feeds = [];

    for (const rssConfig of config.feeds) {
        logger.debug(`${LOG_LABEL} Fetching ${rssConfig.name} RSS`);
        try {
            let feed = await parser.parseURL(rssConfig.url);
            feed = feed.items.map(item => {
                let title = item.title;
                if (rssConfig.titleRegex) {
                    title = title.match(rssConfig.titleRegex)[1];
                }
                return {
                    pageName: rssConfig.name,
                    title,
                    downloadLink: item.link,
                    pubDate: item.pubDate || ''
                };
            });
            feeds = feeds.concat(feed);
        } catch (e) {
            logger.error(`${LOG_LABEL} ${rssConfig.name} RSS fetching failed`);
        }
    }

    return feeds;
};

const getFilteredFeedItems = async () => {
    let feedItems = await getFeeds();

    feedItems = await Promise.all(feedItems.map(async feedItem => ({
        feedItem,
        showConfig: await isTitleInFilterConfigs(feedItem.title)
    })));
    feedItems = feedItems.filter(feedItem => feedItem.showConfig !== false);
    return feedItems;
};

export const downloadTorrents = async () => {
    const torrentConfig = await getAppConfig('torrent');
    const itemsToDownload = await getFilteredFeedItems();
    const nasShowData = await getNasShowData();
    const torrentData = getTorrents().map(torrentName => ({
        torrentName,
        ...parseReleaseName(torrentName)
    }));

    logger.debug(`${LOG_LABEL} Checking downloaded RSS feeds`);

    const dupeCheck = [];
    for (const item of itemsToDownload) {
        const episodeData = parseReleaseName(item.feedItem.title);
        const checkEpisodeOnNas = nasShowData.find(nasEpisode => isTheSameEpisode(nasEpisode, episodeData));
        const checkEpisodeIsDownloading = torrentData.find(torrentEpisode => isTheSameEpisode(torrentEpisode, episodeData));
        const checkDuplicatedDownload = dupeCheck.find(feedItem => isTheSameEpisode(feedItem, episodeData));
        dupeCheck.push({
            titleName: item.feedItem.title,
            ...episodeData
        });

        if (checkDuplicatedDownload) {
            if (isTorrentDownloadedSinceAppStart) {
                logger.debug(`${LOG_LABEL} Just downloaded ${checkDuplicatedDownload.titleName}. Skip downloading ${item.feedItem.title} from ${item.feedItem.pageName}.`);
            }
        } else if (checkEpisodeOnNas) {
            logger.debug(`${LOG_LABEL} Found ${checkEpisodeOnNas.file} on NAS. Skip downloading ${item.feedItem.title} from ${item.feedItem.pageName}.`);
        } else if (fs.existsSync(`${torrentConfig.watchDir}/${item.feedItem.title}.torrent`)) {
            if (isTorrentDownloadedSinceAppStart) {
                logger.info(`${LOG_LABEL} ${item.feedItem.pageName} lost the race with ${item.feedItem.title}. It is already downloaded.`);
            }
        } else if (checkEpisodeIsDownloading) {
            logger.debug(`${LOG_LABEL} Already downloading torrent ${checkEpisodeIsDownloading.torrentName}. Skip downloading ${item.feedItem.title} from ${item.feedItem.pageName}.`);
        } else {
            isTorrentDownloadedSinceAppStart = true;
            logger.info(`${LOG_LABEL} Downloading {yellow}{bold}${item.feedItem.title}{/bold}{/yellow} from {green}${item.feedItem.pageName}{/green} to ${torrentConfig.watchDir}`);
            const downloader = new Downloader({
                url: item.feedItem.downloadLink,
                directory: torrentConfig.watchDir,
                fileName: `${item.feedItem.title}.torrent`
            });
            // need to download one-by-one, to avoid duplicated torrent files from different sources
            await downloader.download();

            await addLog({
                event: 'TORRENT_FILE_DOWNLOADED',
                showName: episodeData.name,
                season: episodeData.season,
                episode: episodeData.episode,
                data: {
                    file: `${item.feedItem.title}.torrent`,
                    sourceFeed: item.feedItem.pageName
                }
            });
        }
    }
    // watchDir.service will start the download. On this way manual adding and deleting torrent files are also possible.
};

export const rssService = async () => {
    const rssConfig = await getAppConfig('rss');

    await downloadTorrents();
    setInterval(async () => {
        await downloadTorrents();
    }, rssConfig.checkInterval * 1000);
};

export default {
    getFeeds,
    downloadTorrents,
    rssService,
    validateRssFeed
};

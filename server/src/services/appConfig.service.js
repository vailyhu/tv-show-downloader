import {AppConfig} from '../models/appConfig.model';
import { getItem, updateItem } from './common.service';
import metaDataService from './metaData.service';
import rssService from './rss.service';
import { validatePath } from '../utils/validatePath';

export const updateAppConfig = async (data) => updateItem(AppConfig, {}, data, {override: true, upsert: true});

/**
 @returns {Object<AppConfig.model>}>
 */
export const getAppConfig = async (category) => {
    const config = await getItem(AppConfig);
    return category ? config[category] : config;
};

const validateConfig = async (appConfig) => {
    let errors = {};
    try {
        // meta check
        const apiCheck = await metaDataService.validateTmdbApiKey(appConfig.metaData.tmdbApiKey);
        if (apiCheck !== true) {
            errors = {...errors, metaData: {tmdbApiKey: apiCheck}};
        }

        // nas check
        const targetDirCheck = validatePath(appConfig.nas.targetDir);
        if (targetDirCheck !== true) {
            errors = {...errors, nas: {targetDir: targetDirCheck}};
        }

        // torrent checks
        const watchDirCheck = validatePath(appConfig.torrent.watchDir);
        if (watchDirCheck !== true) {
            errors = {...errors, torrent: {watchDir: watchDirCheck}};
        }

        const torrentDirCheck = validatePath(appConfig.torrent.torrentDir);
        if (torrentDirCheck !== true) {
            errors = {...errors, torrent: {...errors.torrent, torrentDir: torrentDirCheck}};
        }

        // feeds checks
        const feedErrors = [];
        for (const i in appConfig.rss.feeds) {
            const feedCheck = await rssService.validateRssFeed(appConfig.rss.feeds[i].url);
            if (feedCheck !== true) {
                feedErrors[i] = {url: feedCheck};
            }
        }
        if (feedErrors.length) {
            errors = {...errors, rss: {...errors.rss, feeds: feedErrors}};
        }
    } catch (e) {
        return 'Unknown error happened';
    }

    return Object.keys(errors).length ? errors : true;
};

export default {
    updateAppConfig,
    getAppConfig,
    validateConfig
};

import {ShowConfig} from '../models/showConfig.model';
import { parseReleaseName } from '../utils/parseReleaseName';
import { createItem, deleteItem, getItem, getAllItem, updateItem } from './common.service';

export const getShowConfig = async (filter) => getItem(ShowConfig, filter);

export const getAllShowConfig = async () => getAllItem(ShowConfig, {});

export const createShowConfig = async (data) => createItem(ShowConfig, data);

export const deleteShowConfig = async (filter) => deleteItem(ShowConfig, filter);

export const updateShowConfig = async (filter, data, opts) => updateItem(ShowConfig, filter, data, opts);

export const isTitleInFilterConfigs = async (title) => {
    const showConfigs = await getAllShowConfig();
    const episodeData = parseReleaseName(title);

    for (const showConfig of showConfigs) {
        const regexTitle = new RegExp(showConfig.releaseFilter.toLowerCase(), 'i');
        const regexReleaseType = showConfig.releaseType ? new RegExp(showConfig.releaseType.toLowerCase(), 'i') : null;
        if (
            regexTitle.test(episodeData.name) &&
            (showConfig.season === episodeData.season || showConfig.season === 0) &&
            (!showConfig.releaseType || regexReleaseType.test(episodeData.releaseData))
        ) {
            return showConfig;
        }
    }
    return false;
};

export default {
    getShowConfig,
    getAllShowConfig,
    createShowConfig,
    updateShowConfig,
    deleteShowConfig,
    isTitleInFilterConfigs
};

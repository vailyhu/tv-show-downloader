import { catchAsync } from '../utils/catchAsync';
import showConfigService from '../services/showConfig.service';
import metaDataService from '../services/metaData.service';

export const getShowConfig = catchAsync(async(req, res) => {
    const showConfig = await showConfigService.getShowConfig({_id: req.params.id});
    showConfig.meta = await metaDataService.getMetaDataForShowConfig(showConfig);
    showConfig.meta.episodes = [];
    res.json(showConfig);
});

export const createShowConfig = catchAsync(async(req, res) => {
    const showConfig = await showConfigService.createShowConfig(req.body);
    res.json(showConfig);
});

export const updateShowConfig = catchAsync(async(req, res) => {
    const data = {
        name: req.body.name,
        releaseFilter: req.body.releaseFilter,
        releaseType: req.body.releaseType,
        season: req.body.season,
        targetDirName: req.body.targetDirName
    };
    const success = await showConfigService.updateShowConfig({_id: req.params.id}, data);
    res.json(success ? {...data, _id: req.params.id} : {error: true});
});

export const deleteShowConfig = catchAsync(async(req, res) => {
    const success =  await showConfigService.deleteShowConfig({_id: req.params.id});
    res.json(success ? {deleted: req.params.id} : null);
});

export const getAllShowConfig = catchAsync(async(req, res) => {
    let showConfigs = await showConfigService.getAllShowConfig();

    showConfigs = await Promise.all(showConfigs.map(async showConfig =>
        ({...showConfig, meta: await metaDataService.getMetaDataForShowConfig(showConfig)})
    ));
    showConfigs = showConfigs.map(showConfig => ({...showConfig, meta: {...showConfig.meta, episodes: []}}));

    res.json(showConfigs);
});

export const searchShow = catchAsync(async(req, res) => {
    const results = await metaDataService.searchTvShows(req.params.query);
    res.json(results);
});

export const addByMetaId = catchAsync(async(req, res) => {
    if (!req.body.theMovieDbId) {
        res.json({error: 'NO_META_ID'});
    }
    const checkDupe = await showConfigService.getShowConfig({theMovieDbId: req.body.theMovieDbId});
    if (checkDupe?.theMovieDbId) {
        res.json({error: 'DUPLICATED_ENTRY'});
    }
    const showData = await metaDataService.getTmdbDataById(req.body.theMovieDbId);
    const showConfig = await showConfigService.createShowConfig({
        name: showData.name,
        releaseFilter: showData.name.toLowerCase().replace(/[^a-z0-9]+/gi, '.'),
        releaseType: '1080p',
        targetDirName: showData.name.replace(/[^a-z0-9]+/gi, '.'),
        season: showData.numberOfSeasons,
        theMovieDbId: showData.theMovieDbId
    });
    res.json({
        ...showConfig,
        newItem: true,
        meta: showData
    });
});

export default {
    getShowConfig,
    getAllShowConfig,
    createShowConfig,
    updateShowConfig,
    deleteShowConfig,
    searchShow,
    addByMetaId
};

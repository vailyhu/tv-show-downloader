import TVDB from 'node-tvdb';
import imdb from 'imdb-scrapper';
import MovieDB from 'node-themoviedb';
import { getAppConfig } from './appConfig.service';
import { createItem, deleteItem, getItem, getAllItem, updateItem } from './common.service';
import { MetaData } from '../models/metaData.model';
import { updateShowConfig } from './showConfig.service';

imdb.stopCacheClear();

export const getMetaData = async (filter) => getItem(MetaData, filter);

export const getAllMetaData = async () => getAllItem(MetaData, {});

export const createMetaData = async (data) => createItem(MetaData, data);

export const deleteMetaData = async (filter) => deleteItem(MetaData, filter);

export const updateMetaData = async (filter, data, opts) => updateItem(MetaData, filter, data, opts);

const tvdbSearch = async (imdbData) => {
    const mainConfig = await getAppConfig('main');
    const tvdb = new TVDB(mainConfig.theTVDBApiKey);
    const res = await tvdb.getSeriesByImdbId(imdbData.imdbId);
    const basicInfo = res.pop();
    return tvdb.getSeriesAllById(basicInfo.id);
};

const mapTheMovieDbData = (map, inputData) => {
    const imagePrefix = '/themoviedb';
    const maps = {
        show: {
            theMovieDbId: 'id',
            voteAverage: 'vote_average',
            name: 'original_name',
            overview: 'overview',
            firstAirDate: 'first_air_date',
            lastAirDate: 'last_air_date',
            backdropImage: (data) => data.backdrop_path ? imagePrefix + data.backdrop_path : null,
            posterImage: (data) => data.poster_path ? imagePrefix + data.poster_path : null,
            inProduction: 'in_production',
            numberOfSeasons: 'number_of_seasons',
            lastAiredEpisode: (data) => mapTheMovieDbData('episode', data.last_episode_to_air),
            nextEpisodeToAir: (data) => data.next_episode_to_air ? mapTheMovieDbData('episode', data.next_episode_to_air) : null,
            seasons: () => [],
            episodes: () => []
        },
        season: {
            seasonNumber: 'season_number',
            posterImage: (data) => data.poster_path ? imagePrefix + data.poster_path : null,
            overview: 'overview'
        }, episode: {
            episodeOfSeason: (data) => `${data.season_number}x${('0' + data.episode_number).slice(-2)}`,
            seasonNumber: 'season_number',
            episodeNumber: 'episode_number',
            name: 'name',
            airDate: 'air_date',
            image: (data) => data.still_path ? imagePrefix + data.still_path : null,
            overview: 'overview',
            voteAverage: 'vote_average'
        }
    };
    const mappedObject = {};
    for (const key of Object.keys(maps[map])) {
        const toMap = maps[map][key];
        if (typeof toMap === 'string') {
            mappedObject[key] = inputData[toMap];
        } else if (typeof toMap === 'function') {
            mappedObject[key] = toMap(inputData);
        }
    }
    return mappedObject;
};

export const searchTvShows = async (query) => {
    const metaDataConfig = await getAppConfig('metaData');
    const mdb = new MovieDB(metaDataConfig.tmdbApiKey);
    const res = await mdb.search.TVShows({query: {query}});
    if (res?.data) {
        const data = res.data.results.sort((a, b) => b.popularity - a.popularity);
        return data.map(item => ({
            name: item.name === item.original_name ? item.name : `${item.original_name} (${item.name})`,
            voteAverage: item.vote_average,
            overview: item.overview,
            image: item.backdrop_path ? '/themoviedb' + item.backdrop_path : null,
            theMovieDbId: item.id,
            year: item.first_air_date ? item.first_air_date.slice(0, 4) : ''
        }));
    }
    return [];
};

const getTmdbDataById = async (id, imdbId = null) => {
    const metaDataConfig = await getAppConfig('metaData');
    const mdb = new MovieDB(metaDataConfig.tmdbApiKey);
    let showData = {};

    const rawShowData = await mdb.tv.getDetails({pathParameters: {tv_id: id}});

    if (!rawShowData?.data) {
        return null;
    }

    // data mapping
    showData = {imdbId, ...mapTheMovieDbData('show', rawShowData.data)};
    for (let seasonNumber = 1; seasonNumber <= showData.numberOfSeasons; seasonNumber++) {
        const rawSeason = await mdb.tv.season.getDetails({pathParameters: {tv_id: id, season_number: seasonNumber}});
        showData.seasons.push(mapTheMovieDbData('season', rawSeason.data));
        rawSeason.data.episodes.forEach(rawEpisode => {
            showData.episodes.push(mapTheMovieDbData('episode', rawEpisode));
        });
    }

    // save to db
    const checkInDb = await getMetaData({theMovieDbId: showData.theMovieDbId});
    if (!checkInDb) {
        await createMetaData(showData);
    }

    return showData;
};

const theMovieDbSearchByImdbId = async (imdbData) => {
    const metaDataConfig = await getAppConfig('metaData');
    const mdb = new MovieDB(metaDataConfig.tmdbApiKey);
    const res = await mdb.find.byExternalID({pathParameters: {external_id: imdbData.imdbId}, query: {external_source: 'imdb_id'}});
    const basicInfo = res?.data?.tv_results.pop();
    if (basicInfo?.id) {
        return getTmdbDataById(basicInfo.id, imdbData.imdbId);
    }

    return null;
};

export const imdbSearch = async (title) => {
    const data = await imdb.simpleSearch(title);
    const showData = data.d.filter(i => ['TV mini-series', 'TV series'].includes(i.q)).shift();

    return showData ? {
        name: showData.l,
        year: showData.y,
        imdbId: showData.id,
        imageUrl: showData.i[0]
    } : false;
};

export const getMetaDataForShowConfig = async (showConfig) => {
    let metaData;

    if (showConfig.theMovieDbId) {
        metaData = await getMetaData({theMovieDbId: showConfig.theMovieDbId});
        if (metaData) {
            return metaData;
        }
    }
    const showTitle = showConfig.name.replace(/[^a-z0-9]/ig, ' ');
    // imdb is better in looking for tv shows by name
    const imdbData = await imdbSearch(showTitle);

    if (imdbData) {
        metaData = await theMovieDbSearchByImdbId(imdbData);
        if (metaData.theMovieDbId !== showConfig.theMovieDbId) {
            await updateShowConfig({_id: showConfig._id}, {theMovieDbId: metaData.theMovieDbId});
        }
    }

    return metaData;
};

export const validateTmdbApiKey = async (apiKey) => {
    const mdb = new MovieDB(apiKey);
    try {
        await mdb.genre.getTVList();
    } catch (e) {
        if (e.errorCode === 401) {
            return 'API key is not valid';
        }
    }
    return true;
};

export default {
    getMetaData,
    getAllMetaData,
    createMetaData,
    deleteMetaData,
    updateMetaData,
    getMetaDataForShowConfig,
    imdbSearch,
    searchTvShows,
    getTmdbDataById,
    validateTmdbApiKey
};

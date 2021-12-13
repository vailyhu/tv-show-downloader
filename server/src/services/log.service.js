import { Log } from '../models/log.model';
import { createItem, getItem, getAllItem, updateItem } from './common.service';


/**
@returns {Object<Log.model>}>
*/
export const getLog = async (filter) => getItem(Log, filter);
export const getAllLog = async (filter, sort) => getAllItem(Log, filter, sort);
const createLog = async (data) => createItem(Log, data);
export const setSeen = async (filter) => updateItem(Log, filter, {seen: true});

export const addLog = async (data) => createLog({
    seen: false,
    timestamp: +new Date(),
    ...data
});

export default {
    getLog,
    getAllLog,
    setSeen,
    addLog
};

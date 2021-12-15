import winston from 'winston';
import { Log } from '../models/log.model';
import { createItem, getItem, getAllItem, updateItem } from './common.service';
import logLevels from '../config/winston.logLevels';
import colorCodes from '../config/winston.colorCodes';
import { WinstonSocketIoTransport } from '../utils/winston.socketIo.transport';

const logLevel = 'debug';

winston.addColors(logLevels.colors);
const myFormat = winston.format.printf(({ level, message, timestamp }) => {
    let colorizedMessage = message;
    typeof message === 'string' && Object.keys(colorCodes).forEach(color => {
        colorizedMessage = colorizedMessage.replace(new RegExp('{' + color + '}', 'ig'), '\u001b[' + colorCodes[color][0] + 'm');
        colorizedMessage = colorizedMessage.replace(new RegExp('{/' + color + '}', 'ig'), '\u001b[' + colorCodes[color][1] + 'm');
    });

    return `[${timestamp}] ${level}: ${colorizedMessage}`;
});

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

const enumerateErrorFormat = winston.format((info) => {
    if (info instanceof Error) {
        Object.assign(info, { message: info.stack });
    }
    return info;
});

export const logger = winston.createLogger({
    level: logLevel,
    levels: logLevels.levels,
    format: winston.format.combine(
        enumerateErrorFormat(),
        winston.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        // config.env === 'development' ? winston.format.colorize() : winston.format.uncolorize(),
        winston.format.colorize(),
        winston.format.splat(),
        winston.format.prettyPrint(),
        myFormat
    ),
    transports: [
        new (winston.transports.Console)({
            timestamp: true
        }),
        new WinstonSocketIoTransport()
    ]
});

export default {
    logger,
    getLog,
    getAllLog,
    setSeen,
    addLog
};

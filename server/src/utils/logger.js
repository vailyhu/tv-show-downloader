import winston from 'winston';

const enumerateErrorFormat = winston.format((info) => {
    if (info instanceof Error) {
        Object.assign(info, { message: info.stack });
    }
    return info;
});

const colorCodes = {
    reset: [0, 0],

    bold: [1, 22],
    dim: [2, 22],
    italic: [3, 23],
    underline: [4, 24],
    inverse: [7, 27],
    hidden: [8, 28],
    strike: [9, 29],

    black: [30, 39],
    red: [31, 39],
    green: [32, 39],
    yellow: [33, 39],
    blue: [34, 39],
    magenta: [35, 39],
    cyan: [36, 39],
    white: [37, 39],
    grey: [90, 39]
};

const customLevels = {
    levels: {
        critical: 0,
        error: 1,
        warn: 2,
        info: 4,
        notice: 5,
        debug: 6
    },
    colors: {
        critical: 'bold red',
        error: 'red',
        warn: 'yellow',
        info: 'cyan',
        notice: 'green',
        debug: 'grey'
    }
};

// level: config.env === 'development' ? 'debug' : 'info',
// const logLevel = customLevels.levels[cliArgs.log] ? cliArgs.log : 'debug';
const logLevel = 'debug';

winston.addColors(customLevels.colors);
const myFormat = winston.format.printf(({ level, message, timestamp }) => {
    let colorizedMessage = message;
    typeof message === 'string' && Object.keys(colorCodes).forEach(color => {
        colorizedMessage = colorizedMessage.replace(new RegExp('{' + color + '}', 'ig'), '\u001b[' + colorCodes[color][0] + 'm');
        colorizedMessage = colorizedMessage.replace(new RegExp('{/' + color + '}', 'ig'), '\u001b[' + colorCodes[color][1] + 'm');
    });

    return `[${timestamp}] ${level}: ${colorizedMessage}`;
});

export const logger = winston.createLogger({
    level: logLevel,
    levels: customLevels.levels,
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
        })
    ]
});

import Transport from 'winston-transport';

// TODO
class WinstonSocketIoTransport extends Transport {
    log(info, callback) {
        // const {message, level} = info ;
        callback();
    }
}

export {
    WinstonSocketIoTransport
};

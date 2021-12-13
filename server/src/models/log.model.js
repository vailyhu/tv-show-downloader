import Datastore from 'nedb-promises';

const Log = Datastore.create({
    filename: './log.db',
    autoload: true
});
Log.name = 'log';
Log.model = {
    timestamp: Number,
    event: String,
    showName: String,
    season: Number,
    episode: Number || String,
    data: Object,
    seen: Boolean
};

export {Log};

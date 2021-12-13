import Datastore from 'nedb-promises';

const ShowConfig = Datastore.create({
    filename: './shows.db',
    autoload: true
});
ShowConfig.name = 'show';
ShowConfig.model = {
    name: String,
    releaseFilter: String,
    releaseType: String,
    targetDirName: String,
    season: Number,
    tvdbId: Number
};
export {ShowConfig};

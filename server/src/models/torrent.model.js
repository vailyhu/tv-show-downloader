import Datastore from 'nedb-promises';

const Torrent = Datastore.create({
    filename: './torrent.db',
    autoload: true
});
Torrent.name = 'torrent';
export {Torrent};

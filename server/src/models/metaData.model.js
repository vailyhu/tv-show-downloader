import Datastore from 'nedb-promises';

const MetaData = Datastore.create({
    filename: './metaData.db',
    autoload: true
});
MetaData.name = 'metaData';
MetaData.model = {
};
export {MetaData};

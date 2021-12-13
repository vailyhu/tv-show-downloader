import Datastore from 'nedb-promises';

const AppConfig = Datastore.create({
    filename: './config.db',
    autoload: true
});

AppConfig.name = 'appConfig';
AppConfig.model = {
    main: {
        theTVDBApiKey: String
    },
    nas: {
        targetDir: String,
        fileFilter: String
    },
    rss: {
        checkInterval: Number,
        feeds: Array(
            {
                name: String,
                url: String,
                itemsArray: String,
                fieldName: String,
                titleRegex: String,
                pubDate: Boolean,
                downloadLinkField: String
            }
        )
    },
    torrent: {
        watchDir: String,
        torrentDir: String,
        minSeedRatio: Number,
        minSeedHours: Number
    }
};

export {AppConfig};


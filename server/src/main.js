import { rssService } from './services/rss.service';
import { torrentService } from './services/torrent.service';
import { expressApp } from './express';
import { nasService } from './services/nas.service';

export const main = async () => {
    expressApp();
    await Promise.all([
        torrentService(),
        // rssService(),
        nasService()
    ]);
};

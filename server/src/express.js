import express from 'express';
import request from 'request';
import apiRouter from './routes';
const config = {
    port: 9000
};

export const expressApp = () => {
    const app = express();
    app.use(express.json());
    app.use(express.urlencoded({extended: false}));
    app.use('/api/', apiRouter);

    app.get('/tvdb/*.jpg', function(req, res) {
        request.get('https://www.thetvdb.com/banners/' + req.params[0] + '.jpg').pipe(res);
    });
    app.get('/themoviedb/*.jpg', function(req, res) {
        request.get('https://image.tmdb.org/t/p/w500/' + req.params[0] + '.jpg').pipe(res);
    });

    const server = app.listen(config.port, (err) => {
        if (err) {
            switch (err.code) {
                case 'EACCES':
                    console.error(`Port ${config.port} requires elevated privileges`);
                    process.exit(1);
                    break;
                case 'EADDRINUSE':
                    console.error(`Port ${config.port}  is already in use`);
                    process.exit(1);
                    break;
                default:
                    throw err;
            }
        }
    });
    return app;
};


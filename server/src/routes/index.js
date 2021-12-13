import express from 'express';
import showConfigRoute from './showConfig.route';
import appConfigRoute from './appConfig.route';

const router = express.Router();

const mainRoutes = {
    showConfig: showConfigRoute,
    appConfig: appConfigRoute
};

for (const route in mainRoutes) {
    router.use(`/${route}`, mainRoutes[route]);
}

export default router;

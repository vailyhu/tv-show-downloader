import express from 'express';
import appConfigController from '../controllers/appConfig.controller';

const router = express.Router();

router.route('/')
    .get(appConfigController.getAppConfig)
    .put(appConfigController.updateAppConfig);

export default router;

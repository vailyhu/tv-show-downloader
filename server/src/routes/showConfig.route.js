import express from 'express';
import showConfigController from '../controllers/showConfig.controller';

const router = express.Router();

router.route('/')
    .get(showConfigController.getAllShowConfig)
    .put(showConfigController.createShowConfig);

router.route('/:id')
    .get(showConfigController.getShowConfig)
    .patch(showConfigController.updateShowConfig)
    .delete(showConfigController.deleteShowConfig);

router.route('/addByMetaId')
    .post(showConfigController.addByMetaId);

router.route('/query/:query')
    .get(showConfigController.searchShow);

export default router;

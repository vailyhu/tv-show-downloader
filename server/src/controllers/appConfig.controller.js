import { catchAsync } from '../utils/catchAsync';
import appConfigService from '../services/appConfig.service';

export const getAppConfig = catchAsync(async(req, res) => {
    const appConfig = await appConfigService.getAppConfig();
    res.json(appConfig);
});

export const updateAppConfig = catchAsync(async(req, res) => {
    const appConfig = req.body;
    const result = await appConfigService.validateConfig(appConfig);
    if (result === true) {
        await appConfigService.updateAppConfig(appConfig);
    }
    res.json(result === true ? appConfig : {errors: result});
});

export default {
    getAppConfig,
    updateAppConfig
};

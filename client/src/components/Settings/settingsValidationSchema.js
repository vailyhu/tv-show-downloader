import * as yup from 'yup';

yup.addMethod(yup.string, 'regexp', function (errorMessage) {
    return this.test("locale-equal", errorMessage, function (value) {
        const { path, createError } = this;
        try {
            RegExp(`/${value}/`);
        } catch (e) {
            return createError({ path, message: 'Syntax Error in Regular Expression'});
        }
        return true;
    });
});

yup.addMethod(yup.string, 'regexpCaptureGroup', function (errorMessage) {
    return this.test("locale-equal", errorMessage, function (value) {
        const { path, createError } = this;
        return !value || value.match(/\(.*\)/) ? true : createError({ path, message: 'Regular Expression does not have capturing group'});
    });
});

export const settingsValidationSchema = yup.object().shape({
    metaData: yup.object().shape({
        tmdbApiKey: yup.string().required('TheMovieDB API key is required')
    }),
    nas: yup.object().shape({
        fileFilter: yup.string().regexp().required('File filter is required'),
        targetDir: yup.string().required('Target Directory is required')
    }),
    rss: yup.object().shape({
        checkInterval: yup.number().positive().required('RSS check interval is required'),
        feeds: yup.array().of(yup.object().shape({
            name: yup.string().required('Feed Name is required'),
            url: yup.string().url('Feed URL should be valid').required('Feed URL is required'),
            titleRegex: yup.string().regexp().regexpCaptureGroup()
        }))
    }),
    torrent: yup.object().shape({
        watchDir: yup.string().required('Watch directory is required'),
        torrentDir: yup.string().required('Download directory is required'),
        minSeedHours: yup.number().positive(),
        minSeedRatio: yup.number().positive()
    })
});

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

export const editShowConfigValidationSchema = yup.object().shape({
    name: yup.string().required('Name is required'),
    releaseFilter: yup.string().regexp().required('Release Filter is required'),
    releaseType: yup.string().required('Release Type is required'),
    targetDirName: yup.string().required('Target Directory name is required'),
    season: yup.number().required('Season is required')
});

import React from 'react';
import { useDispatch } from 'react-redux';

import BackupIcon from '@mui/icons-material/Backup';
import { Box, Button, TextField } from '@mui/material';
import { useFormik } from 'formik';

import { updateShowConfig } from '../../../store/reducers/showConfigSlice';
import { editShowConfigValidationSchema } from './editShowConfigValidationSchema';

const defaultInputProps = {margin: 'dense', fullWidth: true, variant: 'outlined', type: 'text'};

export const EditShowConfig = ({ show }) => {
    const dispatch = useDispatch();

    const formik = useFormik({
        initialValues: {...show, meta: null},
        validationSchema: editShowConfigValidationSchema,
        onSubmit: async (values) => dispatch(updateShowConfig(values))
    });

    React.useEffect(() => {
        formik.setValues({...show, meta: null});
    }, [show]);

    return (
        <form onSubmit={formik.handleSubmit}>
            <TextField
                {...defaultInputProps}
                label="Show Title"
                error={!!(formik.errors.name)}
                helperText={formik.errors.name}
                {...formik.getFieldProps('name')}
            />
            <TextField
                {...defaultInputProps}
                label="Name Filter / Regex"
                error={!!(formik.errors.releaseFilter)}
                helperText={formik.errors.releaseFilter}
                {...formik.getFieldProps('releaseFilter')}
            />
            <TextField
                {...defaultInputProps}
                label="Release Type"
                error={!!(formik.errors.releaseType)}
                helperText={formik.errors.releaseType}
                {...formik.getFieldProps('releaseType')}
            />
            <TextField
                {...defaultInputProps}
                label="NAS Target Directory"
                error={!!(formik.errors.targetDirName)}
                helperText={formik.errors.targetDirName}
                {...formik.getFieldProps('targetDirName')}
            />
            <TextField
                {...defaultInputProps}
                label="Season"
                type="number"
                error={!!(formik.errors.season)}
                helperText={formik.errors.season}
                {...formik.getFieldProps('season')}
            />

            <Box sx={{ mt: 2, width: '100%', textAlign: 'center' }}>
                <Button type="submit" variant="contained" disabled={!formik.isValid || !formik.dirty} startIcon={<BackupIcon />}>Save</Button>
            </Box>
        </form>
    );
};

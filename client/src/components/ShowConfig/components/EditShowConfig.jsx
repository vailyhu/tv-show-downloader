import React from 'react';

import { TextField } from '@mui/material';
import { useFormik } from 'formik';

import { editShowConfigValidationSchema } from './editShowConfigValidationSchema';

const defaultInputProps = {margin: 'dense', fullWidth: true, variant: 'outlined', type: 'text'};

export const EditShowConfig = ({ show }) => {
    const formik = useFormik({
        initialValues: show,
        validationSchema: editShowConfigValidationSchema,
        onSubmit: async (values) => {
            console.log(values);
        }
    });

    return (
        <>
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
        </>
    );
};

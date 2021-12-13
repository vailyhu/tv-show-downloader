import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { Box, Typography } from '@mui/material';

import { setPageName } from '../MainMenu/mainMenuSlice';

export const Home = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(setPageName('Home'));
    }, []);

    return (
        <Box sx={{ m: 2 }}>
            <Typography variant="h1" component="h2">Home</Typography>
        </Box>
    );
};

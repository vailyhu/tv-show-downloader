import React from 'react';

import { Box, Typography } from '@mui/material';

export const ShowEpisode = ({data}) => (
    <>
        <Box>
            <Typography variant="body2">
                {data.episodeOfSeason && (<><b>{data.episodeOfSeason}</b>:</>)} {data.name}
            </Typography>
        </Box>

        {data.overview && (
            <Box sx={{ pt: 1 }}>
                <Typography variant="body2">
                    {data.overview}
                </Typography>
            </Box>
        )}

        {data.image && (
            <Box sx={{ pt: 1 }}>
                <img width="100%" src={data.image} alt={data.name}/>
            </Box>
        )}
    </>
);

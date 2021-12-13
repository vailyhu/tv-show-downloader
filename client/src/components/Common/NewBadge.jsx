import React from 'react';

import NewReleasesIcon from '@mui/icons-material/NewReleases';
import { Chip } from '@mui/material';

export const NewBadge = ({ visible = false }) =>
    visible && <Chip color="success" label="New" variant="outlined" icon={<NewReleasesIcon />}/>;

import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { Box, Tab, Tabs } from '@mui/material';

const items =  [
    {label: 'Home', link: '/', icon: 'pi pi-fw pi-home'},
    {label: 'Show Config', link: '/show-config', icon: 'pi pi-fw pi-filter'},
    {label: 'NAS', link: '/nas', icon: 'pi pi-fw pi-server'},
    {label: 'Settings', link: '/settings', icon: 'pi pi-fw pi-cog'}
];

export const MainMenu = () => {
    const [tabIndex, setTabIndex] = useState(0);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const newTabIndex = items.findIndex(e => e.link === location.pathname);
        setTabIndex(newTabIndex === -1 ? 0 : newTabIndex);
        navigate(items[newTabIndex].link);
    }, [location.pathname]);

    const onTabChange = (e, newValue) => {
        navigate(items[newValue].link);
    };

    return (
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabIndex} onChange={onTabChange}>
                <Tab label="Home" />
                <Tab label="Show Config" />
                <Tab label="NAS" />
                <Tab label="Settings" />
            </Tabs>
        </Box>
    );
};

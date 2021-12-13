import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { Box, Tab, Tabs } from '@mui/material';

import { selectPageName, setPageName } from './mainMenuSlice';

const items =  [
    {label: 'Home', link: '/', icon: 'pi pi-fw pi-home'},
    {label: 'Show Config', link: '/show-config', icon: 'pi pi-fw pi-filter'},
    {label: 'NAS', link: '/nas', icon: 'pi pi-fw pi-server'},
    {label: 'Settings', link: '/settings', icon: 'pi pi-fw pi-cog'}
];

export const MainMenu = () => {
    const [tabIndex, setTabIndex] = useState(0);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const pageName = useSelector(selectPageName);

    useEffect(() => {
        if (!pageName) {
            return null;
        }

        const newTabIndex = items.findIndex(e => e.label === pageName);
        setTabIndex(newTabIndex === -1 ? 0 : newTabIndex);
        navigate(items[newTabIndex].link);
    }, [pageName]);

    const onTabChange = (e, newValue) => {
        dispatch(setPageName(items[newValue].label));
    };

    return (
        pageName && <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabIndex} onChange={onTabChange}>
                <Tab label="Home" />
                <Tab label="Show Config" />
                <Tab label="NAS" />
                <Tab label="Settings" />
            </Tabs>
        </Box>
    );
};

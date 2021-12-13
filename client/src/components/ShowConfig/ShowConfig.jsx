import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
    Accordion, AccordionDetails, AccordionSummary, Box, Card, CardContent, CardHeader, CardMedia,
    Grid, IconButton, Typography
} from '@mui/material';

import { UiContext } from '../../context/UiContext';
import { deleteShowConfig, loadShowConfigs, selectShowConfigs } from '../../store/reducers/showConfigSlice';
import { NewBadge } from '../Common/NewBadge';
import { AddNewShowConfig } from './components/AddNewShowConfig';
import { EditShowConfig } from './components/EditShowConfig';
import { ShowEpisode } from './components/ShowEpisode';

export const ShowConfig = () => {
    const dispatch = useDispatch();
    const showConfigs = useSelector(selectShowConfigs);
    const { showDialog } = React.useContext(UiContext);

    useEffect(() => {
        !showConfigs.length && dispatch(loadShowConfigs());
    }, []);

    const onScrollToNewItem = (node) => {
        node && node.scrollIntoView({behavior: 'smooth'});
    };

    const onClickDelete = (show) => {
        showDialog({
            title: <>Do you really want to delete <b>{show.name}</b> from Show Config?</>,
            okColor: 'error',
            cancelColor: 'primary',
            okCallback: () => dispatch(deleteShowConfig(show))
        });
    };

    if (!showConfigs.length) {
        return null;
    }

    const CardAction = ({ show }) => (
        <>
            <NewBadge visible={show.newItem}/>
            <IconButton aria-label="settings" onClick={() => onClickDelete(show)}>
                <DeleteForeverIcon />
            </IconButton>
        </>
    );

    return (
        <Box sx={{ m: 2 }}>
            <Grid container direction="row" justifyContent="space-between" alignItems="center">
                <Grid item>
                    <Typography variant="h1" component="h2">Show Config</Typography>
                </Grid>
                <Grid item>
                    <AddNewShowConfig />
                </Grid>
            </Grid>

            <Grid container spacing={2}>
                {showConfigs.map((show, idx) =>
                    <Grid item xs={12} md={6} lg={4} xl={3} key={idx}>
                        <Card ref={show.newItem ? onScrollToNewItem : null}>
                            <CardHeader title={show.name} action={<CardAction show={show}/>} />
                            <CardMedia component="img" width="100%" image={show.meta.backdropImage} alt={show.name}/>
                            <CardContent>
                                <Accordion disableGutters square elevation={0}>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                        <Typography>Edit Show Config</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <EditShowConfig show={show} />
                                    </AccordionDetails>
                                </Accordion>
                                <Accordion disableGutters square elevation={0}>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                        <Typography>Latest aired episode (Spoiler alert!)</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <ShowEpisode data={show.meta.lastAiredEpisode}/>
                                    </AccordionDetails>
                                </Accordion>
                            </CardContent>
                        </Card>
                    </Grid>
                )}
            </Grid>
        </Box>
    );
};

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
    const [expanded, setExpanded] = React.useState({});
    // do not render hidden content
    const [accordionContentVisible, setAccordionContentVisible] = React.useState({});
    const { showDialog } = React.useContext(UiContext);

    useEffect(() => {
        dispatch(loadShowConfigs());
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

    React.useEffect(() => {
        showConfigs.filter(show => show.newItem).forEach(show => {
            const id = `${show._id}:config`;
            setExpanded({...expanded, [id]: true});
        });
    }, [showConfigs]);

    const onClickAccordion = ((show, label) => {
        const id = `${show._id}:${label}`;
        if (expanded[id]) {
            // keep the content visible while the accordion closes
            setTimeout(() => {
                setAccordionContentVisible({...expanded, [id]: false});
            }, 500);
        } else {
            setAccordionContentVisible({...expanded, [id]: true});
        }
        setExpanded({...expanded, [id]: !expanded[id]});
    });

    const isAccordionExpanded = ((show, label) => {
        const id = `${show._id}:${label}`;
        return expanded[id] || false;
    });

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
                                <Accordion onChange={() => onClickAccordion(show, 'config')} expanded={isAccordionExpanded(show, 'config')} disableGutters elevation={0}>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                        <Typography>Edit Show Config</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        {accordionContentVisible[`${show._id}:config`] && <EditShowConfig show={show} />}
                                    </AccordionDetails>
                                </Accordion>
                                <Accordion onChange={() => onClickAccordion(show, 'latest')} expanded={isAccordionExpanded(show, 'latest')} disableGutters elevation={0}>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                        <Typography>Latest aired episode (Spoiler alert!)</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        {accordionContentVisible[`${show._id}:latest`] && <ShowEpisode data={show.meta.lastAiredEpisode} />}
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

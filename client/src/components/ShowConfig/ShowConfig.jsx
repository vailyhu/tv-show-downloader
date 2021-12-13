import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import {
    Accordion, AccordionDetails, AccordionSummary, Box, Card, CardContent, CardHeader, CardMedia, Chip,
    Grid, IconButton, TextField, Typography
} from '@mui/material';
import { styled } from '@mui/material/styles';

import { UiContext } from '../../context/UiContext';
import { setPageName } from '../MainMenu/mainMenuSlice';
import { AddNewShowConfig } from './AddNewShowConfig';
import { deleteShowConfig, loadShowConfigs, selectShowConfigs } from './showConfigSlice';
import { ShowEpisode } from './ShowEpisode';

const ShowAccordion = styled((props) => (
    <Accordion disableGutters elevation={0} square {...props} />
))(({ theme }) => ({
    border: `1px solid ${theme.palette.divider}`,
    '&:not(:last-child)': {
        borderBottom: 0
    },
    '&:before': {
        display: 'none'
    }
}));

export const ShowConfig = () => {
    const scrollRef = React.useRef(null);
    const dispatch = useDispatch();
    const showConfigs = useSelector(selectShowConfigs);
    const { showDialog } = React.useContext(UiContext);

    useEffect(() => {
        !showConfigs.length && dispatch(loadShowConfigs());
        dispatch(setPageName('Show Config'));
    }, []);

    useEffect(() => {
        scrollRef.current && scrollRef.current.scrollIntoView({behavior: 'smooth', block: 'start'});
    }, [showConfigs]);

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
                        <Card>

                            {/* <Card ref={show.newItem ? scrollRef : null}>*/}
                            <CardHeader
                                title={show.name}
                                action={
                                    <>
                                        {show.newItem && <Chip color="success" label="New" variant="outlined" icon={<NewReleasesIcon />}/>}
                                        <IconButton aria-label="settings" onClick={() => onClickDelete(show)}>
                                            <DeleteForeverIcon />
                                        </IconButton>
                                    </>
                                }
                            />
                            <CardMedia component="img" width="100%" image={show.meta.backdropImage} alt={show.name}/>
                            <CardContent>
                                <ShowAccordion>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                        <Typography>Edit Show Config</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <TextField
                                            margin="dense"
                                            id="name"
                                            label="Show Title"
                                            type="text"
                                            fullWidth
                                            variant="outlined"
                                            value={show.name}
                                        />
                                        <TextField
                                            margin="dense"
                                            id="releaseFilter"
                                            label="Name Filter / Regex"
                                            type="text"
                                            fullWidth
                                            variant="outlined"
                                            value={show.releaseFilter}
                                        />
                                        <TextField
                                            margin="dense"
                                            id="releaseType"
                                            label="Release Type"
                                            type="text"
                                            fullWidth
                                            variant="outlined"
                                            value={show.releaseType}
                                        />
                                        <TextField
                                            margin="dense"
                                            id="targetDirName"
                                            label="NAS Target Directory"
                                            type="text"
                                            fullWidth
                                            variant="outlined"
                                            value={show.targetDirName}
                                        />
                                        <TextField
                                            margin="dense"
                                            id="season"
                                            label="Season"
                                            type="number"
                                            fullWidth
                                            variant="outlined"
                                            value={show.season}
                                        />
                                    </AccordionDetails>
                                </ShowAccordion>
                                <ShowAccordion>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                        <Typography>Latest aired episode (Spoiler alert!)</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <ShowEpisode data={show.meta.lastAiredEpisode}/>
                                    </AccordionDetails>
                                </ShowAccordion>
                                {/* <Typography variant="body2" color="text.secondary">*/}
                                {/*    <div>Last downloaded episode: 5x06</div>*/}
                                {/*    <div>Downloaded: 2021-12-04</div>*/}
                                {/*    <div>Last episode with subtitles: 5x03</div>*/}
                                {/* </Typography>*/}
                            </CardContent>
                        </Card>
                    </Grid>
                )}
            </Grid>
        </Box>
    );
};

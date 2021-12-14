import React, { useEffect } from 'react';

import AddIcon from '@mui/icons-material/Add';
import BackupIcon from '@mui/icons-material/Backup';
import DeleteIcon from '@mui/icons-material/Delete';
import {
    Box,
    Button,
    Card,
    Grid,
    Link,
    Stack,
    TextField,
    Typography
} from '@mui/material';
import { useFormik } from 'formik';

import { UiContext } from '../../context/UiContext';
import { useApiCall } from '../../hooks/useApiCall';
import { settingsValidationSchema } from './settingsValidationSchema';

const defaultInputProps = {margin: 'dense', fullWidth: true, variant: 'outlined'};

export const Settings = () => {
    const { showDialog, showSnackbar } = React.useContext(UiContext);
    const [settings, setSettings] = React.useState(null);
    const [scrollToSection, setScrollToSection] = React.useState(null);
    const { apiResponse, setApiRequest } = useApiCall();

    const formik = useFormik({
        validationSchema: settingsValidationSchema,
        onSubmit: async (values) => setApiRequest({id: 'PUT_CONFIG', method: 'put', url: '/appConfig', data: values})
    });

    useEffect(() => {
        setApiRequest({id: 'GET_CONFIG', url: '/appConfig'});
    }, []);

    useEffect(() => {
        if (apiResponse.id === 'GET_CONFIG') {
            setSettings(apiResponse.data);
        }

        if (apiResponse.id === 'PUT_CONFIG') {
            if (apiResponse.data.errors) {
                setScrollToSection(Object.keys(apiResponse.data.errors)[0]);
                formik.setErrors(apiResponse.data.errors);
                showSnackbar({message: 'Error happened during the save', severity: 'error'});
            } else {
                showSnackbar({message: 'Settings are saved', severity: 'success'});
            }
        }
    }, [apiResponse]);

    useEffect(() => {
        formik.setValues(settings);
    }, [settings]);

    const onRef = (node) => {
        if (node?.id === scrollToSection) {
            node.scrollIntoView({behavior: 'smooth'});
            setScrollToSection(null);
        }
    };

    const addRssFeed = () => {
        setSettings({
            ...settings,
            rss: {
                ...settings.rss,
                feeds: settings.rss.feeds.concat({
                    name: 'New Feed',
                    url: 'https://',
                    titleRegex: '(.*)'
                })
            }
        });
    };

    const openDeleteRssFeedDialog = (id) => {
        showDialog({
            title: <>Do you really want to delete <b>{settings.rss.feeds[id].name}</b> from RSS Items?</>,
            okColor: 'error',
            cancelColor: 'primary',
            okCallback: () => {
                setSettings({
                    ...settings,
                    rss: {
                        ...settings.rss,
                        feeds: settings.rss.feeds.filter((e, idx) => idx !== id)
                    }
                });
            }
        });
    };

    if (!settings || !formik.values) {
        return null;
    }

    return (
        <Box sx={{ m: 2 }}>
            <form onSubmit={formik.handleSubmit}>
                <Typography variant="h1">Settings</Typography>

                <Card id="metaData" sx={{p: 2, mb: 2}} ref={onRef}>
                    <Typography variant="h2" sx={{pb: 2}}>Meta Data settings</Typography>

                    <Typography sx={{pb: 1, pt: 1, color: 'text.secondary'}} variant="body2">
                        Signing up for an account on themoviedb.org and copy/paste the <b>v3</b> API key
                        from <Link href="https://www.themoviedb.org/settings/api" target="_blank" rel="noreferrer">
                        https://www.themoviedb.org/settings/api
                        </Link>.
                    </Typography>
                    <TextField
                        {...defaultInputProps}
                        required
                        type="text"
                        label="TheMovieDB API key"
                        error={!!formik.errors.metaData?.tmdbApiKey}
                        helperText={formik.errors.metaData?.tmdbApiKey}
                        {...formik.getFieldProps('metaData.tmdbApiKey')}
                    />
                </Card>

                <Card id="nas" sx={{p: 2, mb: 2}} ref={onRef}>
                    <Typography variant="h2" sx={{pb: 2}}>NAS settings</Typography>

                    <Typography sx={{pb: 1, pt: 1, color: 'text.secondary'}} variant="body2">
                      Regular Expression Pattern for the files that will be copied to the NAS.
                        Do not change it if you are unsure.
                    </Typography>
                    <TextField
                        {...defaultInputProps}
                        required
                        type="text"
                        label="File filter"
                        InputProps={{style: {fontFamily: 'monospace'}}}
                        error={!!formik.errors.nas?.fileFilter}
                        helperText={formik.errors.nas?.fileFilter}
                        {...formik.getFieldProps('nas.fileFilter')}
                    />

                    <Typography sx={{pb: 1, pt: 1, color: 'text.secondary'}} variant="body2">
                       Downloaded TV Shows will be copied to this folder.
                    </Typography>
                    <TextField
                        {...defaultInputProps}
                        required
                        type="text"
                        label="Target Directory on NAS"
                        error={!!formik.errors.nas?.targetDir}
                        helperText={formik.errors.nas?.targetDir}
                        {...formik.getFieldProps('nas.targetDir')}
                    />
                </Card>

                <Card id="rss" sx={{p: 2, mb: 2}} ref={onRef}>
                    <Typography variant="h2" sx={{pb: 2}}>RSS Feed settings</Typography>

                    <Typography sx={{pb: 1, pt: 1, color: 'text.secondary'}} variant="body2">
                        Time interval in seconds. The default 600 seconds means that the RSS Feeds will be fetched in
                        every 600 seconds (10 minutes).
                    </Typography>
                    <TextField
                        {...defaultInputProps}
                        required
                        type="number"
                        label="RSS check interval in seconds"
                        error={!!formik.errors.rss?.checkInterval}
                        helperText={formik.errors.rss?.checkInterval}
                        {...formik.getFieldProps('rss.checkInterval')}
                    />

                    {settings.rss.feeds.map((feed, i) =>
                        <Box sx={{pt: 2, pb: 2, ml: 5}} key={i}>
                            <Grid container direction="row" justifyContent="space-between" alignItems="center">
                                <Grid item>
                                    <Typography variant="h3" sx={{pb: 2}}>{feed.name}</Typography>
                                </Grid>
                                <Grid item>
                                    <Button variant="contained" startIcon={<DeleteIcon />} onClick={() => openDeleteRssFeedDialog(i)}>
                                        Delete Feed
                                    </Button>
                                </Grid>
                            </Grid>


                            <Typography sx={{pb: 1, pt: 1, color: 'text.secondary'}} variant="body2">
                                Name of the feed. Can be anything, you will see this name in notifications and logs only.
                            </Typography>
                            <TextField
                                {...defaultInputProps}
                                required
                                type="text"
                                label="Feed Name"
                                error={!!(formik.errors.rss?.feeds && formik.errors.rss.feeds[i]?.name)}
                                helperText={formik.errors.rss?.feeds && formik.errors.rss.feeds[i]?.name}
                                {...formik.getFieldProps(`rss.feeds.${i}.name`)}
                            />

                            <Typography sx={{pb: 1, pt: 1, color: 'text.secondary'}} variant="body2">
                                Since the RSS service does not support cookies, the URL should contain the passkey,
                                otherwise the torrent files will not be able to be downloaded.
                            </Typography>
                            <TextField
                                {...defaultInputProps}
                                required
                                type="text"
                                label="Feed URL"
                                error={!!(formik.errors.rss?.feeds && formik.errors.rss.feeds[i]?.url)}
                                helperText={formik.errors.rss?.feeds && formik.errors.rss.feeds[i]?.url}
                                {...formik.getFieldProps(`rss.feeds.${i}.url`)}
                            />

                            <Typography sx={{pb: 1, pt: 1, color: 'text.secondary'}} variant="body2">
                                Optional. Regular Expression Pattern to clean-up unnecessary information from the title.
                                Do not change it if you are unsure. If set, then the first capturing group ($1) will be
                                used as input for the Show Filters.
                            </Typography>
                            <TextField
                                {...defaultInputProps}
                                type="text"
                                label="Title regex"
                                InputProps={{style: {fontFamily: 'monospace'}}}
                                error={!!(formik.errors.rss?.feeds && formik.errors.rss.feeds[i]?.titleRegex)}
                                helperText={formik.errors.rss?.feeds && formik.errors.rss.feeds[i]?.titleRegex}
                                {...formik.getFieldProps(`rss.feeds.${i}.titleRegex`)}
                            />
                        </Box>
                    )}
                    <Box sx={{textAlign: 'right'}}>
                        <Button variant="contained" startIcon={<AddIcon />} onClick={addRssFeed}>Add new RSS Feed</Button>
                    </Box>
                </Card>

                <Card id="torrent" sx={{p: 2, mb: 2}} ref={onRef}>
                    <Typography variant="h2" sx={{pb: 2}}>Torrent settings</Typography>

                    <Typography sx={{pb: 1, pt: 1, color: 'text.secondary'}} variant="body2">
                        Torrent files will be downloaded into this directory. It will be auto-created if not exists.
                    </Typography>
                    <TextField
                        {...defaultInputProps}
                        required
                        type="text"
                        label="Watch directory"
                        error={!!formik.errors.torrent?.watchDir}
                        helperText={formik.errors.torrent?.watchDir}
                        {...formik.getFieldProps('torrent.watchDir')}
                    />

                    <Typography sx={{pb: 1, pt: 1, color: 'text.secondary'}} variant="body2">
                        TV Shows will be downloaded into this directory. It will be auto-created if not exists.
                    </Typography>
                    <TextField
                        {...defaultInputProps}
                        required
                        type="text"
                        label="Download directory"
                        error={!!formik.errors.torrent?.torrentDir}
                        helperText={formik.errors.torrent?.torrentDir}
                        {...formik.getFieldProps('torrent.torrentDir')}
                    />

                    <Typography sx={{pb: 1, pt: 1, color: 'text.secondary'}} variant="body2">
                        The torrent will be seeded until the specified ratio OR seed time (in hours).
                    </Typography>
                    <Stack direction="row" spacing={2} >
                        <Box sx={{width: '100%'}}>
                            <TextField
                                {...defaultInputProps}
                                type="number"
                                label="Minimum seed time in hours"
                                error={!!formik.errors.torrent?.minSeedHours}
                                helperText={formik.errors.torrent?.minSeedHours}
                                {...formik.getFieldProps('torrent.minSeedHours')}
                            />
                        </Box>
                        <Box sx={{width: '100%'}}>
                            <TextField
                                {...defaultInputProps}
                                type="text"
                                label="Minimum seed ratio"
                                error={!!formik.errors.torrent?.minSeedRatio}
                                helperText={formik.errors.torrent?.minSeedRatio}
                                {...formik.getFieldProps('torrent.minSeedRatio')}
                            />
                        </Box>
                    </Stack>
                </Card>

                <Box sx={{textAlign: 'center', p: 2}}>
                    <Button type="submit" color="success" disabled={!formik.isValid} variant="contained" startIcon={<BackupIcon />}>
                            Save Settings
                    </Button>
                </Box>
            </form>
        </Box>
    );
};

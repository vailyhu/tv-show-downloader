import React from 'react';
import { useDispatch } from 'react-redux';

import CloseIcon from '@mui/icons-material/Close';
import {
    Autocomplete, Box,
    Button,
    CircularProgress,
    Dialog,
    DialogContent,
    DialogContentText,
    DialogTitle, Grid, IconButton,
    TextField, Typography
} from '@mui/material';

import { addShowConfig } from '../../../store/reducers/showConfigSlice';
import apiCall from '../../../utils/apiCall';
import { Image } from '../../Common/Image';
import { ShowEpisode } from './ShowEpisode';

const autocompleteCache = {};

const autoCompleteRenderOption = (props, option) => (
    <li {...props} key={option.theMovieDbId}>
        <Grid container alignItems="center">
            <Grid item>
                <Box sx={{width: 120, mr: 1}}>
                    <Image src={option.image} width={120} alt={option.name}/>
                </Box>
            </Grid>
            <Grid item xs>
                <Typography variant="body1" color="text.secondary">
                    {option.name} - {option.year}
                </Typography>
            </Grid>
        </Grid>
    </li>
);

const autoCompleteRenderInput = (params, onInputChange, loading) => (
    <TextField
        {...params}
        label="Search for new TV Show"
        onChange={onInputChange}
        InputProps={{
            ...params.InputProps,
            endAdornment: (
                <React.Fragment>
                    {loading ? <CircularProgress color="inherit" size={20} /> : null}
                    {params.InputProps.endAdornment}
                </React.Fragment>
            )
        }}
    />
);

export const AddNewShowConfig = () => {
    const dispatch = useDispatch();
    const [dialogOpen, setDialogOpen] = React.useState(false);
    const [autoCompleteOpen, setAutoCompleteOpen] = React.useState(false);
    const [inputValue, setInputValue] = React.useState('');
    const [options, setOptions] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const [selectedItem, setSelectedItem] = React.useState(null);

    React.useEffect(async () => {
        setOptions([]);
        if (inputValue) {
            if (autocompleteCache[inputValue]) {
                setOptions(autocompleteCache[inputValue]);
            } else {
                setLoading(true);
                const response = await apiCall.get('/showConfig/query/' + inputValue);
                setOptions(response);
                setLoading(false);
                autocompleteCache[inputValue] = response;
            }
        }
    }, [inputValue]);

    const openDialog = () => {
        setDialogOpen(true);
    };

    const closeDialog = () => {
        setDialogOpen(false);
    };

    const onAutoCompleteSelect = (e, item) => {
        setSelectedItem(item);
    };

    const onInputChange = (e) => {
        setInputValue(e.target.value);
    };

    const saveTvShow = async () => {
        dispatch(addShowConfig(selectedItem.theMovieDbId));
        setDialogOpen(false);
    };

    return (
        <>
            <Button variant="contained" onClick={openDialog}>Add New</Button>
            <Dialog sx={{ p: 2}} fullWidth open={dialogOpen} onClose={closeDialog}>
                <DialogTitle>
                    Add New TV Show
                    <IconButton
                        aria-label="close"
                        onClick={closeDialog}
                        sx={{
                            position: 'absolute',
                            right: 8,
                            top: 8,
                            color: (theme) => theme.palette.grey[500]
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ pb: 2}}>
                        Find a new TV show. The show configuration will be set automatically, but you can update it.
                    </DialogContentText>
                    <Autocomplete
                        open={autoCompleteOpen}
                        onOpen={() => setAutoCompleteOpen(true)}
                        onClose={() => setAutoCompleteOpen(false)}
                        isOptionEqualToValue={(option, value) => option.name === value.name}
                        getOptionLabel={(option) => option.name}
                        options={options}
                        loading={loading}
                        noOptionsText="Start typing to search TV Shows"
                        onChange={onAutoCompleteSelect}
                        renderOption={autoCompleteRenderOption}
                        renderInput={(params) => autoCompleteRenderInput(params, onInputChange, loading)}
                    />
                    {selectedItem && (
                        <>
                            <Box sx={{ pt: 2 }}>
                                <ShowEpisode data={selectedItem} />
                            </Box>
                            <Box sx={{ pt: 2, textAlign: 'center' }}>
                                <Button variant="outlined" onClick={saveTvShow}>Save TV Show</Button>
                            </Box>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
};

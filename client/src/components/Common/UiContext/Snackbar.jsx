import React from 'react';
import ReactDOM from 'react-dom';

import {Slide, Snackbar as MuiSnackbar} from '@mui/material';
import MuiAlert from '@mui/material/Alert';

import {UiContext} from '../../../context/UiContext';

export const Snackbar = () => {
    const { isShowSnackbar, showSnackbar, snackbarData } = React.useContext(UiContext);

    return ReactDOM.createPortal(
        <MuiSnackbar
            open={isShowSnackbar}
            onClose={() => showSnackbar(null)}
            autoHideDuration={4000}
            TransitionComponent={Slide}
            anchorOrigin={{vertical: 'bottom', horizontal: 'center'}}
        >
            <MuiAlert elevation={6} variant="filled" severity={snackbarData.severity}>
                {snackbarData.message}
            </MuiAlert>
        </MuiSnackbar>,
        document.querySelector("#snackbar")
    );
};


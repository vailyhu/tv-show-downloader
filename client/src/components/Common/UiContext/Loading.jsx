import React from 'react';
import ReactDOM from 'react-dom';

import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

// import { makeStyles } from '@mui/styles';
import {UiContext} from '../../../context/UiContext';

// const useStyles = makeStyles((theme) => ({
//     backdrop: {
//         zIndex: theme.zIndex.drawer + 1,
//         color: '#fff'
//     }
// }));

export const Loading = () => {
    const { loading } = React.useContext(UiContext);
    // const classes = useStyles();

    return ReactDOM.createPortal(
        // className={classes.backdrop}
        <Backdrop open={loading} >
            <CircularProgress color="inherit" />
        </Backdrop>,
        document.querySelector("#loading")
    );
};

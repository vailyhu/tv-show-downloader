import React from 'react';
import ReactDOM from 'react-dom';
import { useSelector } from 'react-redux';

import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

import {UiContext} from '../../../context/UiContext';
import { selectLoading } from '../../../store/reducers/loadingSlice';

export const Loading = () => {
    const storeLoading = useSelector(selectLoading);
    const { loading } = React.useContext(UiContext);

    return ReactDOM.createPortal(
        <Backdrop open={loading || storeLoading} >
            <CircularProgress color="inherit" />
        </Backdrop>,
        document.querySelector("#loading")
    );
};

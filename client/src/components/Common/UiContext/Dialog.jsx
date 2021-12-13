import React from 'react';
import ReactDOM from 'react-dom';

import {Dialog as MuiDialog} from '@mui/material';
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Slide from '@mui/material/Slide';

import {UiContext} from '../../../context/UiContext';

export const Dialog = () => {
    const { isShowDialog, showDialog, dialogData } = React.useContext(UiContext);
    function onClose() {
        showDialog(null);
    }

    function onClick() {
        onClose();
        dialogData.okCallback && dialogData.okCallback();
    }

    return ReactDOM.createPortal(
        <MuiDialog
            open={isShowDialog}
            TransitionComponent={Slide}
            keepMounted
            onClose={onClose}
        >
            <DialogTitle>{dialogData.title}</DialogTitle>
            <DialogContent>
                <DialogContentText>{dialogData.message}</DialogContentText>
            </DialogContent>
            <DialogActions>
                {dialogData.cancelText &&
                    <Button onClick={onClose} variant="contained" color={dialogData.cancelColor}>
                        {dialogData.cancelText}
                    </Button>
                }
                <Button onClick={onClick} variant="contained" color={dialogData.okColor}>{dialogData.okText}</Button>
            </DialogActions>
        </MuiDialog>,
        document.querySelector("#dialog")
    );
};

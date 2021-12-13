import React from 'react';

const useSnackbar = () => {
    const [isShowSnackbar, setIsShowSnackbar] = React.useState(false);
    const [snackbarData, setSnackbarData] = React.useState({
        message: '',
        severity: 'success'
    });

    const showSnackbar = (props) => {
        if (props) {
            const severity = props.severity || 'success';
            const message = props.message;
            setIsShowSnackbar(true);
            setSnackbarData({message, severity});
        } else {
            setIsShowSnackbar(false);
        }
    };

    return { isShowSnackbar, showSnackbar, snackbarData };
};

export default useSnackbar;

import React from 'react';

const useDialog = () => {
    const defaultParams = {
        title: '',
        message: '',
        cancelText: 'Cancel',
        okText: 'Ok',
        okCallback: null,
        cancelColor: 'secondary',
        okColor: 'primary'
    };
    const [isShowDialog, setIsShowDialog] = React.useState(false);
    const [dialogData, setDialogData] = React.useState({});


    const showDialog = (params) => {
        if (params?.message || params?.title) {
            setDialogData({...defaultParams, ...params});
            setIsShowDialog(true);
        } else {
            setIsShowDialog(false);
        }
    };

    return { isShowDialog, showDialog, dialogData };
};

export default useDialog;

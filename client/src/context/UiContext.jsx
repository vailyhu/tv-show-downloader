import React from 'react';

import { Dialog } from '../components/Common/UiContext/Dialog';
import { Loading } from '../components/Common/UiContext/Loading';
import { Snackbar } from '../components/Common/UiContext/Snackbar';
import useDialog from '../hooks/useDialog';
import useLoading from '../hooks/useLoading';
import useSnackbar from '../hooks/useSnackbar';

const UiContext = React.createContext();

const UiProvider = ({ children }) => (
    <UiContext.Provider value={{...useSnackbar(), ...useLoading(), ...useDialog()}}>
        <Snackbar/>
        <Loading/>
        <Dialog/>
        {children}
    </UiContext.Provider>
);

export { UiContext, UiProvider };

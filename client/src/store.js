import { configureStore } from '@reduxjs/toolkit';

import mainMenuReducer from './components/MainMenu/mainMenuSlice';
import showConfigReducer from './components/ShowConfig/showConfigSlice';

export const store = configureStore({
    reducer: {
        mainMenu: mainMenuReducer,
        showConfig: showConfigReducer
    }
});

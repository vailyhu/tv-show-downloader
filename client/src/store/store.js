import { configureStore } from '@reduxjs/toolkit';

import loadingReducer from './reducers/loadingSlice';
import showConfigReducer from './reducers/showConfigSlice';

export const store = configureStore({
    reducer: {
        loading: loadingReducer,
        showConfig: showConfigReducer
    }
});

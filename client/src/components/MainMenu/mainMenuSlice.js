import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    pageName: null
};

export const mainMenuSlice = createSlice({
    name: 'mainMenu',
    initialState,
    reducers: {
        setPageName: (state, action) => {
            state.pageName = action.payload;
        }
    }
});

export const { setPageName } = mainMenuSlice.actions;

export const selectPageName = (state) => state.mainMenu.pageName;

export default mainMenuSlice.reducer;

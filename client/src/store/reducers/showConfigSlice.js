import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import apiCall from '../../utils/apiCall';

const initialState = {
    showConfigs: []
};

export const loadShowConfigs = createAsyncThunk(
    'showConfig/loadShowConfigs',
    async () => apiCall.get('/showConfig')
);
export const addShowConfig = createAsyncThunk(
    'showConfig/addShowConfig',
    async (theMovieDbId) => apiCall.post('/showConfig/addByMetaId', {theMovieDbId})
);
export const deleteShowConfig = createAsyncThunk(
    'showConfig/deleteShowConfig',
    async (showConfig) => apiCall.delete('/showConfig/' + showConfig._id)
);

export const showConfigSlice = createSlice({
    name: 'showConfig',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(loadShowConfigs.fulfilled, (state, action) => {
                state.showConfigs = action.payload.sort((a, b) => a.name.localeCompare(b.name));
            })
            .addCase(addShowConfig.fulfilled, (state, action) => {
                state.showConfigs = [action.payload, ...state.showConfigs.map(e => ({...e, newItem: false}))]
                    .sort((a, b) =>
                        a.name.localeCompare(b.name)
                    );
            })
            .addCase(deleteShowConfig.fulfilled, (state, action) => {
                state.showConfigs = state.showConfigs.filter(e => e._id !== action.payload?.deleted);
            });
    }
});

export const selectShowConfigs = (state) => state.showConfig.showConfigs;

export default showConfigSlice.reducer;

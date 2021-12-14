import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

axios.defaults.baseURL = '/api';

const initialState = {
    showConfigs: []
};

export const loadShowConfigs = createAsyncThunk(
    'showConfig/loadShowConfigs',
    async () => {
        const response = await axios.get('/showConfig');
        return response?.data;
    }
);
export const addShowConfig = createAsyncThunk(
    'showConfig/addShowConfig',
    async (theMovieDbId) => {
        const response = await axios.post('/showConfig/addByMetaId', {theMovieDbId});
        return response?.data;
    }
);
export const deleteShowConfig = createAsyncThunk(
    'showConfig/deleteShowConfig',
    async (showConfig) => {
        const response = await axios.delete('/showConfig/' + showConfig._id);
        return response?.data;
    }
);
export const updateShowConfig = createAsyncThunk(
    'showConfig/updateShowConfig',
    async (showConfig) => {
        const response = await axios.patch('/showConfig/' + showConfig._id, showConfig);
        return response?.data;
    }
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
            })
            .addCase(updateShowConfig.fulfilled, (state, action) => {
                if (!action.payload.error) {
                    const idx = state.showConfigs.findIndex(e => e._id === action.payload._id);
                    if (idx !== -1) {
                        state.showConfigs[idx] = {...state.showConfigs[idx], ...action.payload};
                    }
                }
            });
    }
});

export const selectShowConfigs = (state) => state.showConfig.showConfigs;

export default showConfigSlice.reducer;

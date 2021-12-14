import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    isLoading: false,
    requests: []
};

function isPendingAction(action) {
    return action.type.endsWith('/pending');
}

function isFulfilledAction(action) {
    return action.type.endsWith('/fulfilled');
}

function isRejectedAction(action) {
    return action.type.endsWith('/rejected');
}

const loadingSlice = createSlice({
    name: 'loading',
    initialState,
    reducers: {
        setLoading: (state, action) => {
            state.isLoading = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            .addMatcher(isPendingAction, (state) => {
                state.isLoading = true;
            })
            .addMatcher(isRejectedAction, (state) => {
                state.isLoading = false;
            })
            .addMatcher(isFulfilledAction, (state) => {
                state.isLoading = false;
            });
    }
});

export const { setLoading } = loadingSlice.actions;
export const selectLoading = (state) => state.loading.isLoading;

export default loadingSlice.reducer;

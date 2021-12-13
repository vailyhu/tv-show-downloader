import React from 'react';
import { Provider } from 'react-redux';
import { Route, Routes } from 'react-router-dom';

import { CssBaseline, ThemeProvider } from '@mui/material';

import { Home } from './components/Home/Home';
import { MainMenu } from './components/MainMenu/MainMenu';
import { Settings } from './components/Settings/Settings';
import { ShowConfig } from './components/ShowConfig/ShowConfig';
import { UiProvider } from './context/UiContext';
import { store } from './store/store';
import theme from './theme';

function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Provider store={store}>
                <UiProvider>
                    <MainMenu />
                    <Routes>
                        <Route path="show-config" element={<ShowConfig />} />
                        <Route path="settings" element={<Settings />} />
                        <Route path="/" element={<Home />} />
                    </Routes>
                </UiProvider>
            </Provider>
        </ThemeProvider>
    );
}

export default App;

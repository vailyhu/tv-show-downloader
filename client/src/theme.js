import { createTheme } from '@mui/material/styles';

const mode = 'dark';

const theme = createTheme(({
    palette: {
        mode
    },
    typography: {
        fontFamily: 'Roboto, Helvetica, Arial, sans-serif',
        body: {
            padding: 10
        },
        h1: {
            marginTop: 16,
            marginBottom: 16,
            fontSize: 30
        },
        h2: {
            fontSize: 24
        },
        h3: {
            fontSize: 20
        },
        body1: {
            fontSize: 16
        },
        subtitle2: {
            fontSize: 18
        }
    }
}));

export default theme;

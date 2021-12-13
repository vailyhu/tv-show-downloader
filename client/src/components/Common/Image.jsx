import React from 'react';

import fallbackImage from './assets/placeholder-600x400.png';

export const Image = (props) => {
    const [url, setUrl] = React.useState(props.src || fallbackImage);

    const errorHandler = () => {
        console.log('error');
        setUrl(fallbackImage);
    };

    return (
        <img alt="" {...props} src={url} onError={errorHandler} />
    );
};

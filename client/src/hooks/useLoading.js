import React from 'react';

const useLoading = () => {
    const [loading, setLoading] = React.useState(false);

    return { loading, setLoading };
};

export default useLoading;

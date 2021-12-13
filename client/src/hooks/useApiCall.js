import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

import { setLoading } from '../store/reducers/loadingSlice';
import apiCall from '../utils/apiCall';

export const useApiCall = (url, params = {}) => {
    const dispatch = useDispatch();
    const [response, setResponse] = useState(undefined);
    const [error, setError] = useState('');

    const fetchData = async () => {
        params.method = params.method || 'get';
        params.url = '/api' + params.url;

        try {
            dispatch(setLoading(true));
            const result = await apiCall[params.method](url, params);
            setResponse(result);
        } catch (e) {
            setError(e);
        } finally {
            dispatch(setLoading(false));
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return { response, error };
};

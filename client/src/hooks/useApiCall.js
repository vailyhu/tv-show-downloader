import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

import axios from 'axios';

import { setLoading } from '../store/reducers/loadingSlice';

axios.defaults.baseURL = '/api';
const optionParams = ['id', 'setLoading'];
export const useApiCall = () => {
    const dispatch = useDispatch();
    const [apiResponse, setApiResponse] = useState({
        id: null,
        data: {}
    });
    const [apiError, setApiError] = useState(null);
    const [apiRequest, setApiRequest] = useState({});

    const fetchData = async (params) => {
        const options = {};
        params.method = params.method || 'get';

        optionParams.forEach(option => {
            if (params[option]) {
                options[option] = params[option];
                delete params[option];
            }
        });

        if (!params.url) {
            return null;
        }

        try {
            options.setLoading
                ? options.setLoading(true)
                : dispatch(setLoading(true));
            const result = await axios.request(params);
            setApiResponse({id: options.id, data: result.data});
        } catch (e) {
            setApiError({id: options.id, error: e});
        } finally {
            options.setLoading
                ? options.setLoading(false)
                : dispatch(setLoading(false));
        }
    };

    useEffect(() => {
        fetchData(apiRequest);
    }, [apiRequest.id]);

    return { apiResponse, apiError, setApiRequest };
};

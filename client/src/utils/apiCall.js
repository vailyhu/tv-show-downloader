import axios from 'axios';

const axiosCall = (method) =>
    async (path, data = {}) => {
        try {
            // console.log('call', method, path, data);
            const params = ['/api/' + path];
            if (['patch', 'put', 'post'].includes(method)) {
                params.push(data);
            }
            const response = await axios[method](...params);

            // console.log('resp', response);
            if (!response?.data) {
                throw new Error('no data');
            }
            return response.data;
        } catch (e) {
            console.log('call-err', method, path, data);
            throw (e);
        }
    };

const apiCall = {
    get: axiosCall('get'),
    post: axiosCall('post'),
    delete: axiosCall('delete'),
    put: axiosCall('put'),
    patch: axiosCall('patch')
};

export default apiCall;


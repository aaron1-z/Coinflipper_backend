import axios from 'axios';
import {config} from './env-config';

export const apiClient = axios.create({
    baseURL:config.serviceBaseUrl,
    timeout : 5000,
    headers: {
        'Content-Type' : 'application/json',
    },
});
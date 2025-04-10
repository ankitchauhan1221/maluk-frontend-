import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000',
});

interface RequestConfig {
  method: string;
  url: string;
  data?: any;
  headers: Record<string, string>;
}

const request = async (method: string, url: string, data?: any, token?: string) => {
  const config: RequestConfig = {
    method,
    url,
    data,
    headers: {},
  };
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return api(config);
};

export default {
  get: (url: string, token?: string) => request('get', url, undefined, token),
  post: (url: string, data?: any, token?: string) => request('post', url, data, token),
  put: (url: string, data?: any, token?: string) => request('put', url, data, token),
  delete: (url: string, token?: string) => request('delete', url, undefined, token),
};
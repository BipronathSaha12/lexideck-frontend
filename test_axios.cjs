const axios = require('axios');
const client = axios.create({ baseURL: 'http://127.0.0.1:8000/api' });
client.interceptors.request.use((config) => {
  if (config.url.startsWith('/')) config.url = config.url.substring(1);
  console.log('Final URL:', client.getUri(config));
  return config;
});
client.get('/decks/').catch(() => {});

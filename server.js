import pkg from 'stremio-addon-sdk';
const { serveHTTP } = pkg;

import addonInterface from './addon.js';

serveHTTP(addonInterface, { port: 7000 });

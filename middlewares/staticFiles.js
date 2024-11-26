// middleware/staticFiles.js

const express = require('express');
const path = require('path');

const staticFilesMiddleware = express.static(path.join(__dirname, '../public'));

module.exports = staticFilesMiddleware;

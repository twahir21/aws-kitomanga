// middleware/bodyParser.js

const express = require('express');

const jsonParser = express.json();
const urlencodedParser = express.urlencoded({ extended: false });

module.exports = {
    jsonParser,
    urlencodedParser
};

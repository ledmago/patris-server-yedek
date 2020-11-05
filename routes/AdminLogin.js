
const express = require('express');
const mongoose = require('mongoose');
const route = express.Router();
const { adminLogin } = require('../Controllers/UserController');

route.get('/', async (req, res) => {
    adminLogin(req, res);
});

module.exports = route;
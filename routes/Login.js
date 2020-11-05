
const express = require('express');
const mongoose = require('mongoose');
const route = express.Router();
const { login } = require('../Controllers/UserController');

route.get('/', async (req, res) => {
    login(req, res);
});

module.exports = route;
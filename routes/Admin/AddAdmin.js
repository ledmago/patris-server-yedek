
const express = require('express');
const mongoose = require('mongoose');
const route = express.Router();
const { addAdmin } = require('../../controllers/AdminController');

route.get('/', async (req, res) => {
    addAdmin(req, res);
});

module.exports = route;
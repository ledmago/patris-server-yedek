
const express = require('express');
const mongoose = require('mongoose');
const route = express.Router();
const { updateVideo } = require('../../controllers/AdminController');

route.get('/', async (req, res) => {
    updateVideo(req, res);
});

module.exports = route;
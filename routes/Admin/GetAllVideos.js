
const express = require('express');
const mongoose = require('mongoose');
const route = express.Router();
const { getAllVideos } = require('../../controllers/AdminController');

route.get('/', async (req, res) => {
    getAllVideos(req, res);
});

module.exports = route;
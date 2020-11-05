
const express = require('express');
const mongoose = require('mongoose');
const route = express.Router();
const { deleteCategory } = require('../../controllers/AdminController');

route.get('/', async (req, res) => {
    deleteCategory(req, res);
});

module.exports = route;
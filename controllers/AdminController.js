const { param } = require('../routes/RegisterUser');
const User = require('../Schemas/User');
const Admins = require('../Schemas/Admins');
var validator = require('validator');
const errorHandler = require('./ErrorHandler');
const { isAdmin, checkLogin, checkMissingParams } = require('./General');
const bcrypt = require('bcryptjs');
const config = require('../config.json');
var jwt = require('jsonwebtoken');
const { request } = require('express');
const Category = require("../Schemas/Category");
const { findById } = require('../Schemas/User');
const adminLogin = async (req, res) => {


    if (await checkLogin(req) == false) {
        const { email, password } = req.body;
        const userByEmail = await Admins.findOne({ email });
        if (userByEmail) {
            const comparePassword = await bcrypt.compare(password, userByEmail.hash)
            const token = jwt.sign({ email: email, type: 'admin' }, config.privateKey);
            if (comparePassword) {
                res.cookie('token', token); // set token to the cookie
                res.status(200).send({ token: token, user: userByEmail })
            }
            else {
                new errorHandler(res, 500, 13)
            }
        }
        else {
            new errorHandler(res, 500, 13)
        }

    }
    else {
        const user = await checkLogin(req);
        res.status(200).send({ token: req.cookies.token, user: user })
    }



};

// Category İşlemleri

const addCategory = async (req, res) => {
    if (isAdmin(req)) { // Admin ise
        const params = ['categoryName', 'order'];
        if (!checkMissingParams(params, req, res)) return;
        const { categoryName, order } = req.body;
        const addCategory = new Category({
            categoryName,
            order
        });
        await addCategory.save();
        res.status(200).send({ message: "category added" })

    }
}

const getCategory = async (req, res) => {
    try {
        if (isAdmin(req)) { // Admin ise
            const params = ['categoryId'];
            if (!checkMissingParams(params, req, res)) return;
            const { categoryId } = req.body;
            const category = await Category.findById(categoryId)
            res.status(200).send({ category })
        }
    }
    catch (e) {
        new errorHandler(res, 500, 0)
    }
}

const getAllCategories = async (req, res) => {
    try {
        if (isAdmin(req)) { // Admin ise
            // No need any parameters
            const category = await Category.find()
            res.status(200).send({ data: category })
        }
    }
    catch (e) {
        new errorHandler(res, 500, 0)
    }
}

const updateCategory = async (req, res) => {
    try {
        if (isAdmin(req)) { // Admin ise
            const params = ['categoryId', 'categoryName'];
            if (!checkMissingParams(params, req, res)) return;
            const { categoryId, categoryName, order } = req.body;
            const category = await Category.findById(categoryId)
            await category.updateOne({
                categoryName,
                order
            })
            res.status(200).send({ message: 'updated' })
        }
    }
    catch (e) {
        console.log(e)
        new errorHandler(res, 500, 0)
    }
}

const deleteCategory = async (req, res) => {
    try {
        if (isAdmin(req)) { // Admin ise
            const params = ['categoryId'];
            if (!checkMissingParams(params, req, res)) return;
            const { categoryId } = req.body;
            const category = await Category.findById(categoryId)
            await category.deleteOne()
            res.status(200).send({ message: 'deleted' })
        }
    }
    catch (e) {
        new errorHandler(res, 500, 0)
    }
}

module.exports = { adminLogin, addCategory, getCategory, getAllCategories, updateCategory, deleteCategory }
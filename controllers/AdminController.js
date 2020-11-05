const { param } = require('../routes/RegisterUser');
const User = require('../Schemas/User');
const Admins = require('../Schemas/Admins');
var validator = require('validator');
const errorHandler = require('./ErrorHandler');
const { isAdmin } = require('./General');
const bcrypt = require('bcryptjs');
const config = require('../config.json');
var jwt = require('jsonwebtoken');
const { request } = require('express');
const Category = require("../Schemas/Category");
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

const addCategory = async (req, res) => {
    if (isAdmin(req)) { // Admin ise
        const params = ['categoryName'];
        if (!checkMissingParams(params, req, res)) return;
        const { categoryName } = req.body;
        const addCategory = new Category({
            categoryName
        });
        res.status(200).send({ message: "category added" })

    }
}

module.exports = { adminLogin, addCategory }
const { param } = require('../routes/RegisterUser');
const User = require('../Schemas/User');
var validator = require('validator');
const errorHandler = require('./ErrorHandler');
const { checkMissingParams, checkLogin } = require('./General');
const bcrypt = require('bcryptjs');
const config = require('../config.json');
var jwt = require('jsonwebtoken');
const { request } = require('express');

async function userNameValidator(userName, res) {
    const already = await isUserNameAlready(userName);
    const length = validator.isByteLength(userName, { min: 3, max: 20 }) // length should be between 4 and 10
    const regex = validator.matches(userName, /^[a-zA-Z0-9_]+[a-zA-Z]+[0-9]*$/g); // should contains at least 1 char


    if (!length) new errorHandler(res, 500, 2);
    if (already) new errorHandler(res, 500, 9);
    if (!regex) new errorHandler(res, 500, 3);
    return !already && length && regex;
}

function firstNameValidator(firstName, res) {
    const length = validator.isByteLength(firstName, { min: 2, max: 20 }) // length should be between 4 and 10
    const regex = validator.matches(firstName, /^[a-zA-Z0-9ğüşöçİıĞÜŞÖÇ]+$/g); // should contains at least 1 char (letter)
    if (!length) new errorHandler(res, 500, 4);
    if (!regex) new errorHandler(res, 500, 5);
    return length && regex;
}

function lastNameValidator(lastName, res) {
    const length = validator.isByteLength(lastName, { min: 2, max: 20 }) // length should be between 4 and 10
    const regex = validator.matches(lastName, /^[a-zA-Z0-9ğüşöçİıĞÜŞÖÇ]+$/g); // should contains at least 1 char (letter)
    if (!length) new errorHandler(res, 500, 6);
    if (!regex) new errorHandler(res, 500, 7);
    return length && regex;
}
function passwordValidator(password, res) {
    const regex = validator.matches(password, /^(?=.*\d)(?=.*[a-z])(?=.*[a-zA-Z]).{8,25}$/g)
    if (!regex) new errorHandler(res, 500, 8);
    return regex;
}
async function emailValidator(email, res) {
    const isEmail = validator.isEmail(email);
    const already = await isEmailAlready(email);

    if (already) new errorHandler(res, 500, 10);
    if (!isEmail) new errorHandler(res, 500, 11);


    return !already && isEmail


}
function CapitalizeString(string) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLocaleLowerCase()
}

const createJWT = (userName) => {
    var JWT = jwt.sign({ userName: userName }, config.privateKey);
    return JWT;
}
function ageValidator(age) {
    if (age <= 8 && age >= 150) new errorHandler(res, 500, 12);
    return age > 8 && age < 150;
}
async function isUserNameAlready(userName) {
    return await User.findOne({ userName: userName }) ? true : false
}
async function isEmailAlready(email) {
    return await User.findOne({ email: email }) ? true : false
}

const registerUser = async (req, res) => {


    if (!req.cookies.token) {
        const params = [
            'userName',
            'firstName',
            'lastName',
            'email',
            'password',
            'age',
            'gender',
            'city',
        ];

        if (!checkMissingParams(params, req, res)) return;

        let { userName, firstName, lastName, email, password, city, age, gender } = req.body;
        userName = userName.toLowerCase();
        firstName = CapitalizeString(firstName);
        lastName = CapitalizeString(lastName);
        email = email.toLowerCase();
        age = Number(age);



        if (
            await userNameValidator(userName, res) &&
            firstNameValidator(firstName, res) &&
            lastNameValidator(lastName, res) &&
            passwordValidator(password, res) &&
            await emailValidator(email, res) &&
            ageValidator(age)
        ) {

            const newUser = new User({
                userName,
                firstName,
                lastName,
                email,
                hash: bcrypt.hashSync(password, 12),
                age,
                gender,
                city
            });



            await newUser.save(); // Insert to database
            const token = createJWT(userName) // Create token
            res.cookie('token', token); // set token to the cookie
            res.status(200).send({ message: "User registered successfully", token: token, user: newUser }) // send response;




        }


    }
    else {
        res.status(500).send({ message: "You are already logged in" });
    }







};

const logOut = (req, res) => {
    res.clearCookie('token');
    res.status(202).send({ message: 'Log Outed Successfully' })
};

const login = async (req, res) => {


    if (await checkLogin(req) == false) {
        const { userName, password } = req.body;
        const userByUsername = await User.findOne({ userName });
        if (userByUsername) {
            const comparePassword = await bcrypt.compare(password, userByUsername.hash)
            const token = jwt.sign({ userName: userName }, config.privateKey);
            if (comparePassword) {
                res.cookie('token', token); // set token to the cookie
                res.status(200).send({ token: token, user: userByUsername })
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


const updateSocket = (socket, params) => {

    console.log("updated", params.message, socket.id)

}

module.exports = { registerUser, logOut, login, updateSocket };

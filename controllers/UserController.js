const { param, use } = require('../routes/RegisterUser');
const User = require('../Schemas/User');
const Admins = require('../Schemas/Admins');
var validator = require('validator');
const errorHandler = require('./ErrorHandler');
const { checkMissingParams, checkLogin } = require('./General');
const bcrypt = require('bcryptjs');
const config = require('../config.json');
var jwt = require('jsonwebtoken');
const { request } = require('express');
const Category = require("../Schemas/Category");
const Video = require('../Schemas/Videos');
const VideoPart = require('../Schemas/VideoParts');
const WatchedInfo = require('../Schemas/WatchedInfo');
var nodemailer = require('nodemailer');
const ErrorHandler = require('./ErrorHandler');
const { schema } = require('../Schemas/User');
<<<<<<< HEAD
const Payments = require('../Schemas/Payments');
=======
var Iyzipay = require('iyzipay');
var iyzipay = new Iyzipay(config.iyziCo);


>>>>>>> 0361fee7209d2ec01253f85587add5f4e9af7468

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

const createJWT = (email) => {
    var JWT = jwt.sign({ email: email, type: 'user' }, config.privateKey);
    return JWT;
}


async function isEmailAlready(email) {
    return await User.findOne({ email: email }) ? true : false
}

const registerUser = async (req, res) => {


    if (!req.cookies.token) {
        const params = [
            'firstName',
            'lastName',
            'email',
            'password',
            'country',
            'university',
            'city',
            'grade'
        ];

        if (!checkMissingParams(params, req, res)) return;

        let { firstName, lastName, email, password, city, country, university, grade } = req.body;
        firstName = CapitalizeString(firstName);
        lastName = CapitalizeString(lastName);
        email = email.toLowerCase();



        if (
            firstNameValidator(firstName, res) &&
            lastNameValidator(lastName, res) &&
            passwordValidator(password, res) &&
            await emailValidator(email, res)
        ) {

            const newUser = new User({
                firstName,
                lastName,
                email,
                hash: bcrypt.hashSync(password, 12),
                country,
                university,
                city,
                grade
            });



            await newUser.save(); // Insert to database
            const token = createJWT(email) // Create token
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
const refreshToken = async (req, res) => {
    try {
        const token = req.body.token ? req.body.token : req.cookies.token;

        if (token) {
            var result = jwt.verify(token, config.privateKey);
            const user = await User.findOne({ email: result.email })


            if (user) {
                res.cookie('token', token);
                res.status(200).send({ user: user })
            }
            else {
                new errorHandler(res, 500, 0)
            }
        }
        else {
            new errorHandler(res, 500, 0)
        }
    }
    catch (e) {
        new errorHandler(res, 500, 0)
    }

}
const login = async (req, res) => {


    if (await checkLogin(req) == false) {
        const { email, password } = req.body;
        const userByEmail = await User.findOne({ email });
        if (userByEmail) {
            const comparePassword = await bcrypt.compare(password, userByEmail.hash)
            const token = jwt.sign({ email: email }, config.privateKey);
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


const getVideo = async (req, res) => {
    try {

        const params = ['videoId'];
        if (!checkMissingParams(params, req, res)) return;
        const { videoId } = req.body;
        const video = await Video.findById(videoId)
        res.status(200).send({ video })

    }
    catch (e) {
        new errorHandler(res, 500, 0)
    }
}

const getAllVideos = async (req, res) => {
    try {
        if (await checkLogin(req)) {
            const params = ['categoryId'];
            const { categoryId } = req.body;
            let video = await Video.find({ categoryId: categoryId })
            video.sort((a, b) => (a.videoNumber > b.videoNumber) ? 1 : ((b.videoNumber > a.videoNumber) ? -1 : 0));

            const getuser = await checkLogin(req);
            let subscriptionEndDate = new Date(getuser.subscriptionEndDate).getTime();
            let nowDate = new Date().getTime();
            let constraint = getuser.subscription && nowDate < subscriptionEndDate;


            if (!constraint) {
                video.map((item) => {
                    item.videoSource = !constraint && !item.freeTrial ? false : item.videoSource;

                    // item.thumb = constraint ? item.thumb : false;
                })
            }
            res.status(200).send({ data: video })
        }
        else {
            new errorHandler(res, 500, 0)
        }
    }
    catch (e) {
        new errorHandler(res, 500, 0)
    }
}


const getCategory = async (req, res) => {
    try {
        if (await checkLogin(req)) { // Admin ise
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
        if (await checkLogin(req)) { // Admin ise
            // No need any parameters
            const category = await Category.find()

            category.sort((a, b) => (a.categoryNumber > b.categoryNumber) ? 1 : ((b.categoryNumber > a.categoryNumber) ? -1 : 0));
            res.status(200).send({ data: category })
        }
    }
    catch (e) {
        new errorHandler(res, 500, 0)
    }
}


const getVideoPart = async (req, res) => {
    try {
        if (await checkLogin(req)) { // Admin ise
            const params = ['videoPartId'];
            if (!checkMissingParams(params, req, res)) return;
            const { videoPartId } = req.body;
            const videoPart = await VideoPart.findById(videoPartId)
            res.status(200).send({ videoPart })
        }
    }
    catch (e) {
        new errorHandler(res, 500, 0)
    }
}

const getAllVideoParts = async (req, res) => {
    try {
        if (await checkLogin(req)) { // Admin ise
            // No need any parameters
            const { videoId } = req.body;
            const videoPart = await VideoPart.find({ videoId: videoId })
            res.status(200).send({ data: videoPart })
        }
    }
    catch (e) {
        new errorHandler(res, 500, 0)
    }
}

const changeUserProfile = async (req, res) => {
    try {
        if (await checkLogin(req)) { // Admin ise
            const { firstName, lastName, email, country, university, city, grade } = req.body;

            const token = req.cookies.token;
            var userResult = jwt.verify(token, config.privateKey);
            const user = await User.findOne({ email: userResult.email })

            if (user) {

                let newToken = token;
                if (userResult.email != email) {
                    newToken = createJWT(email)
                    res.cookie('token', newToken); // set token to the cookie

                }

                await user.updateOne({ firstName, lastName, email, country, university, city, grade });
                const newUser = await User.findById(user._id)

                res.status(200).send({ token: newToken, user: newUser })
            }
            else {
                res.status(500).send({ error: 'error' })
            }


        }
    }
    catch (e) {
        console.log(e)
        // new errorHandler(res, 500, 0)
        res.status(500).send({ error: 'error' })
    }
}

const changePassword = async (req, res) => {
    // try {
    if (await checkLogin(req)) { // Admin ise
        const { oldPassword, newPassword } = req.body;

        const token = req.cookies.token;
        var userResult = jwt.verify(token, config.privateKey);
        const user = await User.findOne({ email: userResult.email })
        if (user) {
            const comparePassword = await bcrypt.compare(oldPassword, user.hash)
            if (comparePassword) {
                // if old password was correct
                const hash = bcrypt.hashSync(newPassword, 12);
                await user.updateOne({ hash });
                const newUser = await User.findById(user._id)

                res.status(200).send({ user: newUser })
            }
            else {
                res.status(500).send({ error: "Old password was not correct" })
            }



        }
        else {
            res.status(500).send({ error: 'error user not found' })
        }


    }
    // }
    // catch (e) {
    //     console.log(e)
    //     // new errorHandler(res, 500, 0)
    //     res.status(500).send({ error: 'error', e: e })
    // }
}


const isUserSubscribed = async (req, res) => {

    const token = req.cookies.token;
    if (token) {
        var userResult = jwt.verify(token, config.privateKey);
        const user = await User.findOne({ email: userResult.email })
        if (user) {
            let subscriptionEndDate = new Date(user.subscriptionEndDate).getTime();
            let nowDate = new Date().getTime();
            if (user.subscription && nowDate < subscriptionEndDate) {
                res.status(200).send({ subscribe: true });
            }
            else {
                res.status(500).send({ subscribe: false });
            }

        }
        else {
            res.status(500).send({ subscribe: false });
        }
    }
    else {
        res.status(500).send({ subscribe: false });
    }


}

const sendMail = async (req, res) => {
    const { email, title, content } = req.body;
    const mailjet = require('node-mailjet')
        .connect('f1eea4906be660d06590659d8f738d71', '21e8ad4bf8a2eff76dd2f34169ea7ed9')
    const request = mailjet
        .post("send", { 'version': 'v3.1' })
        .request({
            "Messages": [
                {
                    "From": {
                        "Email": "maze.software.mail.sender@gmail.com",
                        "Name": "Maze"
                    },
                    "To": [
                        {
                            "Email": "ledmago@gmail.com",
                            "Name": "Maze Software Mail Sender : Dr. Patris"
                        }
                    ],
                    "Subject": "Kullanıcınız Yeni Mesajınız Var",
                    "TextPart": "Kullanıcıdan yeni mseajınız var",
                    "HTMLPart": "<strong> Email: </strong>" + email + " adlı kullanıcıdan mesaj var. <br><strong> Title: </strong>" + title + "<br> <strong> Message: </strong>" + content
                }
            ]
        })
    request
        .then((result) => {
            console.log(result.body)
            res.send("ok")
        })
        .catch((err) => {
            res.send("fail")
            console.log(err.statusCode)
        })



}

const forgetPassword = async (req, res) => {
    const { email } = req.body;
    const newPassword = generateRandomPassword(10);


    const user = await User.findOne({ email: email });
    await user.updateOne({ hash: bcrypt.hashSync(newPassword, 12) })

    if (user) {


        const mailjet = require('node-mailjet')
            .connect('f1eea4906be660d06590659d8f738d71', '21e8ad4bf8a2eff76dd2f34169ea7ed9')
        const request = mailjet
            .post("send", { 'version': 'v3.1' })
            .request({
                "Messages": [
                    {
                        "From": {
                            "Email": "maze.software.mail.sender@gmail.com",
                            "Name": "Maze"
                        },
                        "To": [
                            {
                                "Email": email,
                                "Name": "Dr. Patris Lectures"
                            }
                        ],
                        "Subject": "Change Password Request",
                        "TextPart": "You have requested new password",
                        "HTMLPart": "<br><br><strong> Your new password: </strong>" + newPassword
                    }
                ]
            })
        request
            .then((result) => {
                console.log(result.body)
                res.send("ok")
            })
            .catch((err) => {
                res.send("fail")
                console.log(err.statusCode)
            })

    }






}

function generateRandomPassword(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

const watchedInfo = async (req, res) => {
    try {
        if (await checkLogin(req)) {
            const user = await checkLogin(req)

            const { videoId, timeOfWatched, isComplated } = req.body;
            const schema = {
                userId: user._id,
                videoId,
                timeOfWatched,

            };
            if (isComplated) { schema.isComplated = isComplated }


            const updateIfAldready = await WatchedInfo.findOne({ userId: user._id, videoId: videoId });

            if (updateIfAldready) {
                await WatchedInfo.updateOne({ userId: user._id, videoId: videoId }, schema);
                res.status(200).send({ message: "ok" })
            }
            else {
                const newWatchInfo = new WatchedInfo(schema);
                await newWatchInfo.save();
                res.status(200).send({ message: "ok" })
            }


        }
        else {
            new errorHandler(res, 500, 0);
        }
    }
    catch (e) {
        new errorHandler(res, 500, 1);
        console.log(e)
    }
}

const getWatchedInfo = async (req, res) => {
    try {
        if (await checkLogin(req)) {
            const user = await checkLogin(req)

            const infoList = await WatchedInfo.find({ userId: user._id });

            res.send({ data: infoList })

        }
        else {
            new errorHandler(res, 500, 0);
        }
    }
    catch (e) {
        new errorHandler(res, 500, 1);
        console.log(e)
    }
}

const paymentForm = async (req, res) => {



    // var request = {
    //     locale: Iyzipay.LOCALE.EN,
    //     conversationId: '123456789',
    //     price: '1',
    //     paidPrice: '15',
    //     currency: Iyzipay.CURRENCY.TRY,
    //     installment: '1',
    //     basketId: 'B67832',
    //     paymentChannel: Iyzipay.PAYMENT_CHANNEL.WEB,
    //     paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
    //     paymentCard: {
    //         cardHolderName: 'John Doe',
    //         cardNumber: '5528790000000008',
    //         expireMonth: '12',
    //         expireYear: '2030',
    //         cvc: '123',
    //         registerCard: '0'
    //     },
    //     buyer: {
    //         id: 'BY789',
    //         name: 'John',
    //         surname: 'Doe',
    //         gsmNumber: '+905350000000',
    //         email: 'email@email.com',
    //         identityNumber: '74300864791',
    //         lastLoginDate: '2015-10-05 12:43:35',
    //         registrationDate: '2013-04-21 15:12:09',
    //         registrationAddress: 'Nidakule Göztepe, Merdivenköy Mah. Bora Sok. No:1',
    //         ip: '85.34.78.112',
    //         city: 'Istanbul',
    //         country: 'Turkey',
    //         zipCode: '34732'
    //     },
    //     shippingAddress: {
    //         contactName: 'Jane Doe',
    //         city: 'Istanbul',
    //         country: 'Turkey',
    //         address: 'Nidakule Göztepe, Merdivenköy Mah. Bora Sok. No:1',
    //         zipCode: '34742'
    //     },
    //     billingAddress: {
    //         contactName: 'Jane Doe',
    //         city: 'Istanbul',
    //         country: 'Turkey',
    //         address: 'Nidakule Göztepe, Merdivenköy Mah. Bora Sok. No:1',
    //         zipCode: '34742'
    //     },
    //     basketItems: [
    //         {
    //             id: 'BI101',
    //             name: 'Binocular',
    //             category1: 'Collectibles',
    //             category2: 'Accessories',
    //             itemType: Iyzipay.BASKET_ITEM_TYPE.PHYSICAL,
    //             price: '0.3'
    //         },
    //         {
    //             id: 'BI102',
    //             name: 'Game code',
    //             category1: 'Game',
    //             category2: 'Online Game Items',
    //             itemType: Iyzipay.BASKET_ITEM_TYPE.VIRTUAL,
    //             price: '0.5'
    //         },
    //         {
    //             id: 'BI103',
    //             name: 'Usb',
    //             category1: 'Electronics',
    //             category2: 'Usb / Cable',
    //             itemType: Iyzipay.BASKET_ITEM_TYPE.PHYSICAL,
    //             price: '0.2'
    //         }
    //     ]
    // };

    // iyzipay.payment.create(request, function (err, result) {
    //     console.log(err, result);

    // });

    var request = {
        locale: Iyzipay.LOCALE.EN,
        conversationId: '123456789',
        price: '1',
        paidPrice: '1.2',
        currency: Iyzipay.CURRENCY.TRY,
        basketId: 'B67832',
        paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
        callbackUrl: 'http://' + req.get('host') + '/api/user/paymentcallback',
        enabledInstallments: [2, 3, 6, 9],
        buyer: {
            id: 'BY789',
            name: 'John',
            surname: 'Doe',
            gsmNumber: '+905350000000',
            email: 'email@email.com',
            identityNumber: '74300864791',
            lastLoginDate: '2015-10-05 12:43:35',
            registrationDate: '2013-04-21 15:12:09',
            registrationAddress: 'Nidakule Göztepe, Merdivenköy Mah. Bora Sok. No:1',
            ip: '85.34.78.112',
            city: 'Istanbul',
            country: 'Turkey',
            zipCode: '34732'
        },
        shippingAddress: {
            contactName: 'Jane Doe',
            city: 'Istanbul',
            country: 'Turkey',
            address: 'Nidakule Göztepe, Merdivenköy Mah. Bora Sok. No:1',
            zipCode: '34742'
        },
        billingAddress: {
            contactName: 'Jane Doe',
            city: 'Istanbul',
            country: 'Turkey',
            address: 'Nidakule Göztepe, Merdivenköy Mah. Bora Sok. No:1',
            zipCode: '34742'
        },
        basketItems: [
            {
                id: 'BI101',
                name: 'Binocular',
                category1: 'Collectibles',
                category2: 'Accessories',
                itemType: Iyzipay.BASKET_ITEM_TYPE.PHYSICAL,
                price: '0.3'
            },
            {
                id: 'BI102',
                name: 'Game code',
                category1: 'Game',
                category2: 'Online Game Items',
                itemType: Iyzipay.BASKET_ITEM_TYPE.VIRTUAL,
                price: '0.5'
            },
            {
                id: 'BI103',
                name: 'Usb',
                category1: 'Electronics',
                category2: 'Usb / Cable',
                itemType: Iyzipay.BASKET_ITEM_TYPE.PHYSICAL,
                price: '0.2'
            }
        ]
    };

    iyzipay.checkoutFormInitialize.create(request, function (err, result) {
        // console.log(err, result);
        res.send(`<body style="margin:0"><iframe src="${result.paymentPageUrl}&iframe=true" style="width:100%;height:100%;border:0" allowfullscreen></iframe><body>`)

    });



}

const paymentCallBack = async (req, res) => {



    iyzipay.checkoutForm.retrieve({
        locale: Iyzipay.LOCALE.TR,
        conversationId: '123456788',
        token: req.body.token
    }, function (err, result) {
        // console.log(err, result);
        if (result.status == 'success') {
            // bırada aktifleştir
            res.send("Payment is successfull")
        }
        else {

            res.send("Error occoured while payment, " + err.errorMessage)
        }
    });


<<<<<<< HEAD
const paymentSuccess = async (req, res) => {
    try {
        const { userToken, paymentId, subscriptionType, paymentDate, amount, date } = req.body;

        const result = jwt.verify(userToken, config.privateKey);

        const user = await User.findOne({ email: result.email })

        if (user) {

            const newPayment = new Payments({
                userId: user._id,
                paymentId,
                date: paymentDate,
                amount: amount,
                subscriptionType
            });
            await newPayment.save();
            const newDate = new Date();
            const subscriptionEndDate = newDate.setMonth(newDate.getMonth() + subscriptionType)

            user.updateOne({ subscription: true, subscriptionEndDate: subscriptionEndDate })
            res.status(200).send({ message: "ok" })
        }






    }
    catch (e) {
        new errorHandler(res, 500, 1);
        console.log(e)
    }
}


module.exports = { registerUser, logOut, login, getVideo, getAllVideos, getCategory, getAllCategories, getAllVideoParts, getVideoPart, refreshToken, changeUserProfile, isUserSubscribed, changePassword, sendMail, forgetPassword, watchedInfo, getWatchedInfo, paymentSuccess };
=======
}

module.exports = { registerUser, logOut, login, getVideo, getAllVideos, getCategory, getAllCategories, getAllVideoParts, getVideoPart, refreshToken, changeUserProfile, isUserSubscribed, changePassword, sendMail, forgetPassword, watchedInfo, getWatchedInfo, paymentForm, paymentCallBack };
>>>>>>> 0361fee7209d2ec01253f85587add5f4e9af7468

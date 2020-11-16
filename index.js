const express = require('express');
const Port = process.env.Port || 1337;
const connectDB = require('./consts/DbConnection');
const app = express();
const config = require('./config.json');
var jwt = require('jsonwebtoken');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
const server = require('http').Server(app);
app.use(cookieParser());
connectDB();
app.use(express.json({ extended: false }));
app.use(bodyParser.urlencoded({ extended: false }))
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
// ---------------------------------------- //


app.use((req, res, next) => {
    if (req.body.token) {
        req.cookies.token = req.body.token;
    }
    next();
})
// -- ROUTES -- //
// USER
app.use('/api/registeruser', require('./routes/RegisterUser'));
app.use('/api/logout', require('./routes/LogOut'));
app.use('/api/login', require('./routes/Login'));


// ADMIN ICIN
app.use('/api/adminlogin', require('./routes/Admin/AdminLogin'));
app.use('/api/addcategory', require('./routes/Admin/AddCategory'));
app.use('/api/getcategory', require('./routes/Admin/GetCategory'));
app.use('/api/getallcategories', require('./routes/Admin/GetAllCategories'));
app.use('/api/updatecategory', require('./routes/Admin/UpdateCategory'));
app.use('/api/deletecategory', require('./routes/Admin/DeleteCategory'));
app.use('/api/addvideo', require('./routes/Admin/AddVideo'));
app.use('/api/getvideo', require('./routes/Admin/GetVideo'));
app.use('/api/getallvideos', require('./routes/Admin/GetAllVideos'));
app.use('/api/getallvideoparts', require('./routes/Admin/GetAllVideoParts'));
app.use('/api/updatevideo', require('./routes/Admin/UpdateVideo'));
app.use('/api/deletevideo', require('./routes/Admin/DeleteVideo'));
app.use('/api/addadmin', require('./routes/Admin/AddAdmin'));
app.use('/api/updatevideopart', require('./routes/Admin/UpdateVideoPart'));
app.use('/api/addvideopart', require('./routes/Admin/AddVideoPart'));
app.use('/api/deletevideopart', require('./routes/Admin/DeleteVideoPart'));
app.use('/api/getalladmins', require('./routes/Admin/GetAllAdmins'));
app.use('/api/updateadmin', require('./routes/Admin/UpdateAdmin'));
app.use('/api/deleteadmin', require('./routes/Admin/DeleteAdmin'));

// -- ROUTES END -- //








server.listen(Port, () => console.log('Server started'));
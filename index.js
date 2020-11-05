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
// ---------------------------------------- //


// -- ROUTES -- //

app.use('/api/registerUser', require('./routes/RegisterUser'));
app.use('/api/logout', require('./routes/LogOut'));
app.use('/api/login', require('./routes/Login'));
// -- ROUTES END -- //



// SOCKET EMBEDDING //

const socketInit = require('./socket/index.js');
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/Socket/html/index.html');
});
socketInit(server);
// SOCKET EMBEDDING CLOSE // 





server.listen(Port, () => console.log('Server started'));
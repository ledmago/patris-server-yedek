const { updateSocket } = require('../controllers/UserController');

module.exports = socketUpdate = (socket) => socket.on('update', (socketState) => { updateSocket(socket, socketState); });
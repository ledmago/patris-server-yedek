
module.exports = socketUpdate = (socket) => socket.on('disconnecting', (reason) => {


    console.log('\x1b[31m', 'disconnected =>', socket.id, reason, '\x1b[0m')



});
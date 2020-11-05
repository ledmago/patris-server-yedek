
const SocketInit = (server) => {

    const io = require('socket.io')(server);

    io.on('connection', socket => {

        require('./connection')(socket);
        require('./disconnect')(socket);

        // socket.on('disconnecting', (reason) => {
        //     console.log('disconnect')
        // });


        // SOCKET EVENTS

        require('./update')(socket)


        // SOCKET EVENTS END




    });
}
module.exports = SocketInit;
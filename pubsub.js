/*
    Simple pub/sub demonstrating use of EventEmitter. Basically copied from Node.js in Action.
    Note the slight modification required in the `createServer` method.
 */


var events = require('events');
var net = require('net');
var channel = new events.EventEmitter();
channel.clients = {};
channel.subscriptions = {};

channel.on('join', function (id, client) {
    console.log('join: ' + id)
    this.clients[id] = client;
    this.subscriptions[id] = function (senderId, message) {
        console.log('broadcast: ' + senderId)
        if (id != senderId) {
            this.clients[id].write(message);
        }
    };
    channel.on('broadcast', this.subscriptions[id]);
});

var server = net.createServer(function (client) {
    console.log('creating server')
    var id = client.remoteAddress + ':' + client.remotePort;
    channel.emit('join', id, client);

    // THIS DOESN'T WORK! This event never reaches the client.
    // Instead, emit the 'join' event when the server is created.
    client.on("connect", function () {
        console.log('connect');
        channel.emit('join', id, client);
    });


    client.on('data', function (data) {
        console.log('data');
        data = data.toString();
        channel.emit('broadcast', id, data);
    });
});

var port = 8888;
server.listen(port,function () {
    console.log('server listening on port ' + port)
});

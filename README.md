server
====

Decsription
----

`Server` for `node`, `iojs` and `nwjs`.

Installing
----
You can install `server` using:

`git clone https://github.com/WoenZu/server.git`

##Using
Here is client example:

    'use strict';

    var tbox = require('tbox');
    var net = require('net');
    var protocol = new tbox.Protocol();

    var sock = {};
    var id = '';

    function connect(ip, port) {
        sock = net.createConnection({host: ip, port: port}, function() {
            console.log('Connected at ' + sock.remoteAddress + ':' + sock.remotePort);
            id = createId();
            sendTo(protocol.register(id, 'YourNickHere'));

            sock.setEncoding('utf8');

            sock.on('data', function(data) {
                console.log(protocol.parseString(data));
            });

            sock.on('error', function(e) {
                console.log(e);
            });

            sock.on('close', function() {
                console.log('Socket is closed...');
            });
        });
    }

    function createId() {
        return id = sock.address().address +':' + sock.address().port;
    }

    function sendTo(str) {
        sock.write(str, 'utf8');
    }

    connect('localhost', 6666);

##Dependencies
* tbox
* ip

##License
See `LICENSE` file.

##Autor
Andrey Lvov

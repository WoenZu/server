server
====

Decsription
----

`Server` for `node`, `iojs` and `nwjs`.

Installing
----
You can install `server` using:

`git clone https://github.com/WoenZu/server.git`

##Example

    'use strict';

    var tbox = require('tbox');
    var net = require('net');
    var protocol = new tbox.Protocol();
    var userinfo = new tbox.UserInfo();

    var sock = {};
    var ident = '';

    function connect(ip, port) {
        sock = net.createConnection({host: ip, port: port}, function() {
            console.log('Connected at ' + sock.remoteAddress + ':' + sock.remotePort);
            ident = createIdent();
            sendTo(protocol.register(ident, 'YourNickHere'));

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

    function createIdent() {
        return ident = sock.address().address +':' + sock.address().port;
    }

    function sendTo(str) {
        sock.write(str, 'utf8');
    }

    connect('localhost', 6666);

##Dependencies
* tbox
* colors (dev)
* ip

##License
See `LICENSE` file.

##Autor
Andrey Lvov

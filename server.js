'use strict';

var colors = require('colors');
var net = require('net');
var fs = require('fs');
var tbox = require('tbox');
var ip = require('ip');

var loadFile = tbox.tutils.loadFile;
var createPath = tbox.tutils.createPath;
var splitIdent = tbox.tutils.splitIdent;
var encoder = new tbox.Encoder('key');
var protocol = new tbox.Protocol();
var userDB = new tbox.UserDB(createPath('userDB.json'));
var pool = new tbox.ClientPool();

var configPath = createPath('config.json');

//default configuration for server
var defServerConfig = {};
defServerConfig.Users = [];
defServerConfig.MOTD = 'Hello Chat World';
defServerConfig.Test = 'test property';
defServerConfig.Port = '6666';

var serverConfig = {};

initialize();

var server = net.createServer(function(sock) {
  var chatClient = new tbox.Client(sock);
  pool.addClient(chatClient);
  console.log('client ' + chatClient.getIP().white + ':' + chatClient.getPort() + ' is connected to server');

  sock.setEncoding('utf8');
  sock.setTimeout(0);
  sock.write(protocol.motd(serverConfig.MOTD) + '\n', 'utf8'); //TODO temp

  sock.on('data', function(data) {
    console.log('<' + sock.remoteAddress.white + ':' + sock.remotePort + '> ' + data.white); // debug

    //TODO unwrap
    //TODO decode
    //TODO parse message to message object

    var msgObj = protocol.parseString(data);
    processMessage(msgObj);
  });

  sock.on('close', function() {
    console.log('<' + chatClient.getIP().white + ':' + chatClient.getPort() + '> is disconnected from server');
    pool.removeClient(chatClient);
  });

  sock.on('error', function(e) {
    console.log(e);
  });
});

function initialize() {
  console.log('[DEBUG] Initializing...');
  serverConfig = loadFile(configPath, defServerConfig);//TODO need refactoring (loadFile func and server conf load)
  userDB.loadDB();
}

function processMessage(msg) {
  var command = msg.cmd;
  var ident = msg.ident;
  var prm = msg.prm;
  var spl = splitIdent(ident);
  var ip = spl[0];
  var port = spl[1];

  switch (command) {
    case 'REGISTER':
      if (!userDB.checkForUser(ip, prm[0])) {
        console.log('User not available in DB...');
        userDB.addUser(userDB.createUser(ip, prm[0]));
        sendTo(ident, protocol.registered('Hello, you are registered on server, please wait activation.'));
      } else {
        sendTo(ident, protocol.registered('Welcome to trollbox chat!'));
      }
      break;
    case 'TEXT':
      if (prm[0] !== '*') {
        sendTo(prm[0], protocol.text(ident, '', prm[1]));
      } else {
        sendToAll(protocol.text('', '', prm[1]));
      }
      break;
    case 'ERROR':
      console.log('[ERROR] %s', param);
    default:
      //TODO обрабатываем как !неверная комманда протокола!
  }
}

function sendTo(ident, str) {
  var client = pool.getClientById(ident);

  //console.log('ident: ', ident);
  //console.log('client: ', client);
  //console.log(client.getSocket());
  try {
    var sock = client.getSocket();
    sock.write(str, 'utf8');
  } catch (err) {
    console.log(err);
    console.log('[ERROR] Cannot send message: Client is not found.');
  }
}

function sendToAll(str) {
  for (var i = 0; i < pool.getLength(); i++) {
    var client = pool.getClientByIndex(i);
    sendTo(client.getIdent(), str);
  }
}

server.listen({
  host: 'localhost',
  port: 6666
  }, function() {
    console.log('[DEBUG] Starting server listening at: %s:%s', ip.address(), serverConfig.Port);
});

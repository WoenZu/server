'use strict';

var colors = require('colors');
var net = require('net');
var fs = require('fs');
var tbox = require('tbox');
var ip = require('ip');

var loadFile = tbox.tutils.loadFile;
var createPath = tbox.tutils.createPath;
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
  sock.write(protocol.motd(serverConfig.MOTD) + '\n', 'utf8'); //TODO temp
  sock.setEncoding('utf8');
  sock.setTimeout(0);
  sock.on('data', function(data) {
    var msgObj = processMessage(data);

    console.log('<' + sock.remoteAddress.white + ':' + sock.remotePort + '> ' + data.white); // debug

    var userObj = {};
    if(msgObj.cmd === 'REGISTER') { //TODO проверять на целостность и валидность сообщения с данной коммандой
      if(userDB.checkForUser(msgObj.id)) { //если пользователь есть в базе
        userObj = userDB.getUser(msgObj.id);// получаем пользователя из базы
        chatClient.importUserFormDB(userObj); // импортируем данные пользователя из базы в клиент сервера
        pool.addClient(chatClient);
      } else { // если юзера нет в базе
        console.log('User : ' + msgObj.id.white + ' is not available in DB...');
        userObj = userDB.createUser(msgObj.id, msgObj.prm[0]);
        userDB.addUser(userObj); // добавляем пользователя в базу
        chatClient.importUserFormDB(userObj);
        pool.addClient(chatClient);
      }
      console.log('client ' + chatClient.getId().white + ' as ' + chatClient.getNick().red + ' is connected to server');
    }

    processMsgString(msgObj);
  });

  sock.on('close', function() {
    if(pool.checkForClient(chatClient)) {
      console.log('<' + chatClient.getIP().white + ':' + chatClient.getPort() + '> is disconnected from server');
      pool.removeClient(chatClient);
    } else {
      console.log('[server] Anonymous connection closed...');// not need to show
    }
  });

  sock.on('error', function(e) {
    console.log(e);
  });
});

function initialize() {
  console.log('[server] Initializing...');
  serverConfig = loadFile(configPath, defServerConfig);//TODO need refactoring (loadFile func and server conf load)
  userDB.loadDB();
}

function processMessage(data) {
  //TODO unwrap
  //TODO decode
  //TODO parse message to message object
  return protocol.parseString(data);
}

function processMsgString(msg) {
  var command = msg.cmd;
  var id = msg.id;
  var prm = msg.prm;

  switch (command) {
    case 'REGISTER': //TODO провека на состояние клиента pending, active or banned
      var nick = prm[0];
      if(!userDB.checkForUser(id)) {
        sendTo(id, protocol.registered('Hello ' + nick.white + '! You are registered on server, please wait activation. =)'));
      } else {
        sendTo(id, protocol.registered(nick + ' welcome to trollbox chat!'));
      }
      break;
    case 'TEXT':
      if(prm[0] !== '*') {
        sendTo(prm[0], protocol.text(id, '', prm[1]));
      } else {
        sendToAll(protocol.text(id, '*', prm[1]));
      }
      break;
    case 'ERROR':
      console.log('[server] ERROR %s', param);
    default:
      //TODO обрабатываем как !неверная комманда протокола!
  }
}

function sendTo(userId, str) {
  var client = pool.getClientById(userId);
  try {
    var sock = client.getSocket();
    sock.write(str, 'utf8');
    console.log('[server] string to send: ', str);
  } catch (err) {
    console.log(err);
    console.log('[server] Cannot send message: Client is not found.');
  }
}

function sendToAll(str) {
  for (var i = 0; i < pool.getLength(); i++) {
    var client = pool.getClientByIndex(i);
    sendTo(client.getId(), str);
  }
}

server.listen({
  host: 'localhost',
  port: 6666
  }, function() {
    console.log('[server] Starting server listening at: %s:%s', ip.address(), serverConfig.Port);
});

'use strict';

//var colors = require('colors');
var net = require('net');
var fs = require('fs');
var tbox = require('tbox');
var ip = require('ip');
var createPath = tbox.createPath;

var encoder = new tbox.Encoder('key');
var protocol = new tbox.Protocol();
var userDB = new tbox.UserDB(createPath('userDB.json'));
var serverConfig = new tbox.Config(createPath('config.json'));
var pool = new tbox.ClientPool();
var config = {};

initialize();

var server = net.createServer(function(sock) {
  var chatClient = new tbox.Client(sock);
  sock.write(protocol.motd(config.MOTD, 'utf8')); //TODO temp
  sock.setEncoding('utf8');
  sock.setTimeout(0);
  sock.on('data', function(data) {
    var msgObj = processReceivedData(data); // msgObj - command in JSON {cmd:'EXAMPLE', prm:'parameter'}

    console.log('<' + sock.remoteAddress + ':' + sock.remotePort + '> ' + data); // debug

    var userObj = {};
    if(msgObj.cmd === 'REGISTER') { //TODO проверять на целостность и валидность сообщения с данной коммандой

      //TODO проверить зарегистрирован ли уже пользователь с таким id  в pool и если да то не позволять подсоедениться
      if(userDB.checkForUser(msgObj.id)) { //если пользователь есть в базе
        userObj = userDB.getUser(msgObj.id);// получаем пользователя из базы
        chatClient.importUserFromDB(userObj); // импортируем данные пользователя из базы в клиент сервера
        chatClient.register();
        pool.addClient(chatClient);
      } else { // если юзера нет в базе
        console.log('User : ' + msgObj.id.white + ' is not available in DB...');
        userObj = userDB.createUser(msgObj.id, msgObj.prm[0]);
        userDB.addUser(userObj); // добавляем пользователя в базу
        userDB.saveDB();
        chatClient.importUserFromDB(userObj); //TODO
        chatClient.register();                //TODO repeating code
        pool.addClient(chatClient);           //TODO
      }
      console.log('client ' + chatClient.getId() + ' as ' + chatClient.getNick() + ' is connected to server');
    }

    //check client for registration on server
    if(chatClient.isRegistered()) {
      processCommand(msgObj);
    } else {
    //TODO добавить шифрование и т.п.
      sock.write(protocol.error('Client id: ' + msgObj.id + ' is not registered on server'), 'utf8');
    }

  });

  sock.on('close', function() {
    if(pool.checkForClient(chatClient)) {
      console.log('<' + chatClient.getIP() + ':' + chatClient.getPort() + '> is disconnected from server');
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
  serverConfig.load();
  config = serverConfig.getConfig();
  userDB.loadDB();
}

function processReceivedData(data) {
  //TODO unwrap
  //TODO decode
  return protocol.parseString(data);
}

function processCommand(msg) {
  var command = msg.cmd;
  var id = msg.id;
  var prm = msg.prm;

  switch (command) {
    case 'REGISTER': //TODO провека на состояние клиента pending, active or banned, make greeting of client to all users
      var nick = prm[0];
      if(!userDB.checkForUser(id)) {
        sendTo(id, protocol.registered('Hello ' + nick + '! You are registered on server, please wait activation. =)'));
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
    console.log(err.message);
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
  port: config.Port
  }, function() {
    console.log('[server] Starting server listening at: %s:%s', ip.address(), serverConfig.getProperty('Port'));
});

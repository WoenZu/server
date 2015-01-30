'use strict';

var colors = require('colors');
var net = require( 'net' );
var fs = require( 'fs' );
var tbox = require( 'tbox' );

var loadFile = tbox.utils.loadFile;
var encoder = new tbox.Encoder( 'key' );
var protocol = new tbox.Protocol();
var userDB = new tbox.UserDB();

var pool = new tbox.SocketPool();
//var clients = [];

var configPath = tbox.utils.createPath( 'config.json' );

//default configuration for server
var defServerConfig = {};
defServerConfig.motd = 'Hello Chat World';
defServerConfig.test = 'test property';
defServerConfig.port = '6666';

var serverConfig = {};

initialize();

var server = net.createServer( function( sock ) {
  sock.setEncoding( 'utf8' );
  sock.setTimeout( 0 );

  var chatClient = new tbox.Client( sock );

  console.log( 'client ' + chatClient.getIP().white + ':' + chatClient.getPort() + ' is connected to server');

  pool.push( chatClient );
  //clients.push( chatClient );//TODO надо ли делать отдельный контейнер или оставить просто массив?

  sock.write( serverConfig.motd + '\n', 'utf8' ); //TODO temp

  sock.on( 'data', function( data ) {
    console.log( '<' + sock.remoteAddress.white + ':' + sock.remotePort + '> ' + data.white ); // debug

    //TODO unwrap
    //TODO decode
    //TODO parse message to message object

    var msgObj = {};
    msgObj = protocol.parseString( data );

    processMessage( msgObj );
  });

  sock.on( 'error', function( e ) {
    console.log( e );
  });
});

function sendTo( recipient, str ) {
  // sock.write( str, 'utf8' );
}

function initialize() {
  console.log( '[DEBUG] initializing...' );
  serverConfig = loadFile( configPath, defServerConfig );//TODO need refactoring (loadFile func and server conf load)

  var userDBPath = tbox.utils.createPath( 'userDB.json' );
  var def = userDB.createUser( 'admin', '127.0.0.1', 0);
  userDB.loadDB( userDBPath, def );
}

function processMessage( msg ) {
  //TODO организовать проверку на соответствие принимаемого объекта сообщения
  switch ( msg.command ) {
    case 'REGISTER':
      console.log('register command');

        // распарсиваем параметры на ник и ip

      if ( !userDB.checkDBForUser( nick, ip ) ) {
        userDB.addUser( userDB.createUser( nick, ip ) );
      } else {
        sendTo( ip, 'IS_REGISTERED' ); //TODO надо использовать проткол для создания сообщения
      }
      break;
    default:
      //TODO обрабатываем как !неверная комманда протокола!
  }
}

server.listen( 6666 );
console.log( '[DEBUG] server listening...' );

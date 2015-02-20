'use strict';

var colors = require( 'colors' );
var net = require( 'net' );
var fs = require( 'fs' );
var tbox = require( 'tbox' );

var loadFile = tbox.tutils.loadFile;
var createPath = tbox.tutils.createPath;
var encoder = new tbox.Encoder( 'key' );
var protocol = new tbox.Protocol();
var userDB = new tbox.UserDB( createPath( 'userDB.json' ) );

var pool = new tbox.ClientPool();
//var clients = [];

var configPath = createPath( 'config.json' );

//default configuration for server
var defServerConfig = {};
defServerConfig.Users = [];
defServerConfig.MOTD = 'Hello Chat World';
defServerConfig.Test = 'test property';
defServerConfig.Port = '6666';

var serverConfig = {};

initialize();

var server = net.createServer( function( sock ) {
  sock.setEncoding( 'utf8' );
  sock.setTimeout( 0 );

  var chatClient = new tbox.Client( sock );
  pool.addClient( chatClient );

  console.log( 'client ' + chatClient.getIP().white + ':' + chatClient.getPort() + ' is connected to server' );

  sock.write( serverConfig.MOTD + '\n', 'utf8' ); //TODO temp

  sock.on( 'data', function( data ) {
    console.log( '<' + sock.remoteAddress.white + ':' + sock.remotePort + '> ' + data.white ); // debug

    //TODO unwrap
    //TODO decode
    //TODO parse message to message object

    var msgObj = {};
    msgObj = protocol.parseString( data );

    processMessage( msgObj );
  });

  sock.on( 'close', function() {
    console.log( '<' + chatClient.getIP().white + ':' + chatClient.getPort() + '> is disconnected from server' );
    //TODO remove this socket from pool
    pool.removeClient( chatClient );
  });

  sock.on( 'error', function( e ) {
    console.log( e );
  });
});

function initialize() {
  console.log( '[DEBUG] Initializing...' );

  serverConfig = loadFile( configPath, defServerConfig );//TODO need refactoring (loadFile func and server conf load)

  userDB.loadDB();
}

function processMessage( msg ) {
  var command = msg.cmd;
  var ident = msg.ident;
  var param = msg.prm;

  switch ( command ) {
    case 'REGISTER':
      console.log( 'Process message REGISTER...' );
      if ( !userDB.checkForUser( ident, param[ 0 ] ) ) {
        console.log( 'User not available in DB...' );
        userDB.addUser( userDB.createUser( ident, param[ 0 ] ) );
        sendTo( ident, protocol.registered( 'Hello, you are registered on server, please wait activation.' ) );
      } else {
        sendTo( ident, protocol.registered( 'Welcome to trollbox chat!' ) );
      }
      break;
    case 'TEXT':
      //=======
      break;
    case 'ERROR':
      console.log( '[ERROR] %s', param );
    default:
      //TODO обрабатываем как !неверная комманда протокола!
  }
}

function sendTo( ident, str ) {
  var client = pool.getClientById( ident );
  try {
    var sock = client.getSocket();
    sock.write( str, 'utf8' );
  } catch ( err ) {
    console.log( err );
    console.log( '[ERROR] Client is not found.' );
  }
}

server.listen( 6666 );
console.log( '[DEBUG] server listening...' );

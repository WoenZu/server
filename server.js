'use strict';

var colors = require('colors');
var net = require( 'net' );
var fs = require( 'fs' );
var tbox = require( 'tbox' );

var fabric = new tbox.MessageFabric();
var encoder = new tbox.Encoder( 'key' );
var checkFile = tbox.utils.checkFile;

var clients = [];
var appDir = process.cwd(); //TODO need to make multiplatform

//default configuration for server
var defServerConfig = {};
defServerConfig.motd = 'Hello Chat World';
defServerConfig.test = 'test property';
defServerConfig.port = '6666';

var serverConfig = {};
var userDB = {};

initialize();

var server = net.createServer( function( sock ) {
  sock.write( serverConfig.motd + '\n', 'utf8' ); //temp

  var chatClient = new tbox.Client( sock );
  console.log( 'client ' + chatClient.getIP().white + ':' + chatClient.getPort() + ' connected to server');
  clients.push( chatClient );

  sock.setEncoding( 'utf8' );
  sock.setTimeout( 0 );

  sock.on( 'data', function( data ) {
    console.log( '<' + sock.remoteAddress.white + ':' + sock.remotePort + '> ' + data.white ); // debug
    onReceivingMessage( data );
  });

  sock.on( 'error', function( e ) {
    console.log( e );
  });
});

function onReceivingMessage( data ){


  //TODO unwrap
  //TODO decode
  //TODO parse message to message object
}

function initialize() {
  console.log( '[DEBUG] initializing...' );

  serverConfig = checkFile( appDir + '/config.json', defServerConfig );
  userDB = checkFile( appDir + '/users/userDB.json', '{"users":[]}' ); //TODO make admin user for default
}

server.listen( 6666 );
console.log( '[DEBUG] server listening...' );

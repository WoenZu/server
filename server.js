'use strict';

var colors = require('colors');
var net = require( 'net' );
var fs = require( 'fs' );
var enc = require( 'encoder' );
var mf = require( 'fabric');
var client = require( 'client' );

var fabric = new mf.MessageFabric();
var encoder = new enc.Encoder( 'key' );

var clients = [];
var appDir = process.cwd();

var serverConfig = {};
var userDB = {};

initialize();

var server = net.createServer( function( sock ) {
  sock.write( serverConfig.configuration.MOTD + '\n', 'utf8' );

  var chatClient = new client.Client( sock );
  clients.push( chatClient );

  sock.setEncoding( 'utf8' );
  sock.setTimeout( 0 );

  sock.on( 'data', function( data ) {
    console.log( '<' + sock.remoteAddress + ':' + sock.remotePort + '> ' + data.white ); // debug
    onReceivingMessage( data );

    sock.write( 'wrong command\n', 'utf8' ); //debug
  });

  sock.on( 'error', function( e ) {
    console.log( e );
  });
});

function onReceivingMessage( msg ){
  //TODO process incoming message
}

function initialize() {

  //server config check
  var serverConfigPath = appDir + '/config.json';
  var configFile = checkForFileExistence( serverConfigPath, '{"configuration":{"MOTD":"Hello to trollbox server..."}}\n' );
  serverConfig = JSON.parse( configFile );

  //user database check
  var userDBPath = appDir + '/users/userDB.json';
  var userDBFile = checkForFileExistence( userDBPath, '{"users":[]}\n' );
  userDB = JSON.parse( userDBFile );
}

function checkForFileExistence( filename, defaultContent) {
  try {
    return fs.readFileSync( filename );
  } catch( e ) {
    fs.writeFileSync( filename, defaultContent );
    return fs.readFileSync( filename );
  }
}

server.listen( 6666 );

'use strict';

var colors = require('colors');
var net = require( 'net' );
var fs = require( 'fs' );

//TODO may be make all tBox modules in one require? var tbox = require( 'tbox' );
//TODO encoder = new tbox.Encoder( 'key' );

var enc = require( 'tbox/encoder' );
var mf = require( 'tbox/fabric');
var client = require( 'tbox/client' );

var fabric = new mf.MessageFabric();
var encoder = new enc.Encoder( 'key' );

var clients = [];
var appDir = process.cwd(); //TODO need to make multiplatform

var serverConfig = {};
var userDB = {};

initialize();

var server = net.createServer( function( sock ) {
  sock.write( serverConfig.configuration.MOTD + '\n', 'utf8' ); //temp

  var chatClient = new client.Client( sock );
  clients.push( chatClient );

  sock.setEncoding( 'utf8' );
  sock.setTimeout( 0 );

  sock.on( 'data', function( data ) {
    console.log( '<' + sock.remoteAddress + ':' + sock.remotePort + '> ' + data.white ); // debug
    onReceivingMessage( data );
  });

  sock.on( 'error', function( e ) {
    console.log( e );
  });
});

function onReceivingMessage( msg ){
  //TODO unwrap
  //TODO decode
  //TODO parse message to message object
}

function initialize() {
  console.log( 'initializung...' );
  //server config check
  var serverConfigPath = appDir + '/config.json';
  var configFile = checkForFileExistence( serverConfigPath, '{"configuration":{"MOTD":"Hello to trollbox server..."}}\n' );
  serverConfig = JSON.parse( configFile );
  console.log( 'config ok.' );

  //user database check
  var userDBPath = appDir + '/users/userDB.json';
  var userDBFile = checkForFileExistence( userDBPath, '{"users":[]}\n' ); //TODO make admin user for default
  userDB = JSON.parse( userDBFile );
  console.log( 'userDB ok.' );
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
console.log( 'server listening...' );

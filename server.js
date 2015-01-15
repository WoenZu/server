'use strict';

var colors = require('colors');
var net = require( 'net' );
var fs = require( 'fs' );
var tbox = require( 'tbox' );

var fabric = new tbox.MessageFabric();
var encoder = new tbox.Encoder( 'key' );
var config = new tbox.Config( console.log ); //TODO need notifier

var clients = [];
var appDir = process.cwd(); //TODO need to make multiplatform

var serverConfig = {};
var userDB = {};

initialize();

var server = net.createServer( function( sock ) {
  sock.write( serverConfig.configuration.MOTD + '\n', 'utf8' ); //temp

  var chatClient = new tbox.Client( sock );
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

function onReceivingMessage( msg ){
  //TODO unwrap
  //TODO decode
  //TODO parse message to message object
}

function initialize() {
  console.log( 'initializing...' );

  config.checkForFileExistence( appDir + '/config.json' );
  serverConfig = config.getConfiguration();

  //user database check
  //var userDBPath = appDir + '/users/userDB.json';
  //var userDBFile = checkForFileExistence( userDBPath, '{"users":[]}\n' ); //TODO make admin user for default
  //userDB = JSON.parse( userDBFile );
  //console.log( 'userDB ok.' );
}

server.listen( 6666 );
console.log( 'server listening...' );

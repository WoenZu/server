'use strict';

var net = require( 'net' );
var fs = require( 'fs' );

var client = require( 'client' );

var clients = [];
var appDir = process.env.PWD;

initialize();

var server = net.createServer( function( sock ) {
  createClient( sock );
  //TODO need add clients in clients array
});

function createClient( sock ) {
  var chatClient = new client.Client( sock );
  sock.setEncoding( 'utf8' );
  sock.setTimeout( 0 );

  sock.on( 'data', function( data ) {
    console.log( data );
  });

  sock.on( 'error', function( e ) {
    console.log( e );
  });

  sock.write( 'MOTD Placeholder... connected to server...\n', 'utf8' );
}

function initialize() {

  //server config check
  var serverConfigPath = appDir + '/config.json';
  checkForFileExistence( serverConfigPath, '{"configuration":{}}\n' );

  //user database check
  var userdbPath = appDir + '/users/userdb.json';
  var userdb = checkForFileExistence( userdbPath, '{"users":[]}\n' );
}


function checkForFileExistence( filename, defaultContent) {
  try {
    return fs.readFileSync( filename );
    //console.log('[DEBUG]file exists...');
  } catch( e ) {
    fs.writeFileSync( filename, defaultContent );
    return fs.readFileSync( filename );
    //console.log( '[DEBUG]file does not exist' );
  }
}

server.listen( 6666 );

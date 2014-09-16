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

  //TODO refactor duplicate code!!!
  //server config check
  var serverConfigPath = appDir + '/config.json';
  var isExist = checkForFileExistence( serverConfigPath );

  if(!isExist) {
    fs.writeFileSync( serverConfigPath, '{"configuration":{}}\n' );
  }

  //user database check
  var userdbPath = appDir + '/users/userdb.json';
  isExist = checkForFileExistence( userdbPath );

  if(!isExist) {
    fs.writeFileSync( userdbPath, '{"users":[]}\n' );
  }
}

function checkForFileExistence( filename ) {
  try {
    fs.readFileSync( filename );
    //console.log('[DEBUG]file exists...');
    return true;
  } catch( e ) {
    //console.log( '[DEBUG]file does not exist' );
    return false;
  }
}

server.listen( 6666 );

'use strict';

var net = require( 'net' );
var fs = require( 'fs' );

var client = require( 'client' );
var clients = [];
var appDir = process.cwd();

initialize();

var server = net.createServer( function( sock ) {
  createClient( sock );
});

function createClient( sock ) {
  sock.write( 'MOTD Placeholder... connected to server...\n', 'utf8' );

  var chatClient = new client.Client( sock );
  clients.push( chatClient );

  sock.setEncoding( 'utf8' );
  sock.setTimeout( 0 );

  sock.on( 'data', function( data ) {
    console.log( data );
  });

  sock.on( 'error', function( e ) {
    console.log( e );
  });

}

function initialize() {

  //server config check
  var serverConfigPath = appDir + '/config.json';
  checkForFileExistence( serverConfigPath, '{"configuration":{}}\n' );

  //user database check
  var userdbPath = appDir + '/users/userdb.json';
  var userdb = checkForFileExistence( userdbPath, '{"users":[]}\n' );
  console.log( 'file: ', userdb.toString() );
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

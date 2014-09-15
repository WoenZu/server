'use strict';

var net = require( 'net' );
var fs = require( 'fs' );

var client = require( 'client' );

var clients = [];

dbCheck();

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

function dbCheck() {
  console.log( 'trying to find usersdb.json' );
  console.log( 'checking in: ' + process.env.PWD + '/users' );
  var file = process.env.PWD + '/users/usersdb.json';

  try {
    fs.openSync( file, 'r+');
    console.log('file opened successfully');
  } catch( e ) {
    console.log( e );
    fs.openSync( file, 'w' );
    console.log( 'file created successfully' );
  }
}

server.listen( 6666 );

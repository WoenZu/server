'use strict';

var net = require( 'net' );
var client = require( 'client' );

var clients = [];

var server = net.createServer( function( sock ) {
  var chatClient = new client.Client( sock );
  sock.write( 'connected to server\n' );
  sock.setEncoding( 'utf8' );
  sock.setTimeout( 0 );

  sock.on( 'data', function( data ) {
    console.log( data );
  });

  sock.on( 'error', function( e ) {
    console.log( e );
  });
});

server.listen( 6666 );

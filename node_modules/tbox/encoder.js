/*
 * ARC4 symmetric cipher encryption/decryption
 *
 * Modularized port of gist code: https://gist.github.com/farhadi/2185197
 *
 * @license Public Domain
 * @param string key - secret key for encryption/decryption
 * @param string str - string to be encrypted/decrypted
 * @return string
 */

'use strict';

function Encoder( key ) {
  this.key = key;
}

Encoder.prototype.encode = function( str ) {

  var s = [];
  var j = 0;
  var x;
  var res = '';

  for ( var i = 0; i < 256; i++ ) {
    s[ i ] = i;
  }

  for ( i = 0; i < 256; i++ ) {
    j = ( j + s[ i ] + this.key.charCodeAt( i % this.key.length ) ) % 256;

    x = s[ i ];
    s[ i ] = s[ j ];
    s[ j ] = x;
  }

  i = 0;
  j = 0;

  for ( var y = 0; y < str.length; y++ ) {
    i = ( i + 1 ) % 256;
    j = ( j + s[ i ]) % 256;

    x = s[ i ];
    s[ i ] = s[ j ];
    s[ j ] = x;

    res += String.fromCharCode( str.charCodeAt( y ) ^ s[ ( s[ i ] + s[ j ] ) % 256 ] );
  }

  return res;
};

Encoder.prototype.setKey = function( key ) {
  this.key = key;
};

Encoder.prototype.getKey = function() {
  return this.key;
};

exports.Encoder = Encoder;

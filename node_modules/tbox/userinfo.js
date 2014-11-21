'use strict';

var os = require('os');

function UserInfo() {
  this.IP = '';
  this.userName = '';
  this.host = '';

  if( process.platform === 'win32' ) {

    this.IP = os.networkInterfaces().Ethernet[1].address;
    this.userName = process.env.USERNAME;
    this.host = os.hostname();

  } else if (process.platform === 'darwin') {
    this.IP = os.networkInterfaces().en0[1].address;
    this.userName = process.env.USER;
    this.host = os.hostname();

  } else {
    // linux
    // this.IP =
    // this.userName =
    // this.host =
  }
}

UserInfo.prototype.getUserName = function() {
  return this.userName;
};

UserInfo.prototype.getIP = function() {
  return this.IP;
};

UserInfo.prototype.getHostName = function(){
  return this.host;
};

UserInfo.prototype.getUserInfo = function() {
  return this.IP + '/' + this.host + '/' + this.userName;
};

exports.UserInfo = UserInfo;

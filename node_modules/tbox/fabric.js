"use strict";

function MessageFabric() {
  this.someVar = '=)';
}

MessageFabric.prototype.createMessage = function ( command, param ) {
  var message;

  switch ( command ) {
    case 'REGISTER':
      message = {
        "c" : command,
        "p" : param
      };
      break;
    case 'IS_REGISTERED':
      message = {
        "c" : command,
        "p" : param
      };
      break;
    default:
      //debug message - unknown command
  }

  console.log( 'builded message: ' + message );
  return message;
};

// chat commands:
// /? - this help message
// /help
// /cmdlist - list of available commands
// /clear - clear chat window
// /clear_history - clear history
// /refresh - refresh user list
// /who - refresh user list
// /nick "new nick" - change nick
// /nextnick "new nick" - change nick for next loading chat
// /msg "user" message - send private message
// /me message
// /smiles - show all of smiles

exports.MessageFabric = MessageFabric;

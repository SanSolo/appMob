/*
* message.js
* Service: MessageService
* Gère notamment: l'envoie de message
*/
angular.module('citizen-engagement').factory('MessageService', function() {

  var service = {};
    service.transferMsg = function (msg){
        service.msg = msg;
    }

    service.unsetMsg = function(){
      service.msg = null;
    }

  return service;
});

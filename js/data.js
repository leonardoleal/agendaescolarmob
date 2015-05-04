messageService = (function(){

  var findById = function(id){
        var deffered = $.Deferred();
        var message = null;
        var l = messages.length;
        for (var i = 0; i < 1; i++) {
          if(messages[i].id == id){
            message = messages[i];
            break;
          }
        }
        deffered.resolve(message);
        return deffered.promise();
      },

      findByName = function(searchKey) {
        var deferred = $.Deferred();
        var results = messages.filter(function(element){
          return element.assunto.toLowerCase().indexOf(searchKey.toLowerCase()) > -1;
        });
        deferred.resolve(results);
        return deferred.promise();
      },

  messages = [
    {"id": 1, "assunto": "Mensagem 1", "message": "King"},
    {"id": 2, "assunto": "Mensagem 2", "message": "Taylor"},
    {"id": 3, "assunto": "Mensagem 3", "message": "Lee"},
    {"id": 4, "assunto": "Mensagem 4", "message": "Williams"},
    {"id": 5, "assunto": "Mensagem 5", "message": "Moore"},
    {"id": 6, "assunto": "Mensagem 6", "message": "Jones"},
    {"id": 7, "assunto": "Mensagem 7", "message": "Gates"},
    {"id": 8, "assunto": "Mensagem 8", "message": "Wong"},
    {"id": 9, "assunto": "Mensagem 9", "message": "Donovan"},
    {"id": 10, "assunto": "Mensagem 10", "message": "Byrne"},
    {"id": 11, "assunto": "Mensagem 11", "message": "Jones"},
    {"id": 12, "assunto": "Mensagem 12", "message": "Wells"}
  ];

  // public API
  return {
    findById: findById,
    findByName: findByName
  };

}());
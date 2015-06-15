var db;

function deviceready(){
  db = window.openDatabase("agenda", "1.0", "agenda", 1000000);
  db.transaction(setupDatabase, errorHandler);
}

function setupDatabase(tx){
  //tx.executeSql('drop table if exists user;');
  //tx.executeSql('drop table if exists mensagens;');
  //tx.executeSql('drop table if exists respostas;');
  tx.executeSql('CREATE TABLE IF NOT EXISTS user (idUsuario INTEGER, usuario TEXT, senha TEXT, token TEXT, ultimoLogin TEXT);');
  //tx.executeSql('create table if not exists mensagens (idMensagem INTEGER PRIMARY KEY, idUsuario INTEGER, assunto TEXT, mensagem TEXT, dataEnvio DATE, horaEnvio TIME);');
  //sem primary key
  tx.executeSql('create table if not exists mensagens (idMensagem INTEGER, idUsuario INTEGER, assunto TEXT, mensagem TEXT, dataEnvio DATE, horaEnvio TIME, professor TEXT);');
  tx.executeSql('create table if not exists respostas (idMensagem INTEGER, idUsuario INTEGER, resposta TEXT, dataEnvio DATE, horaEnvio TIME);');
  getCurrentToken();
}

function hasToken(user){
  db.transaction(function(tx){
    tx.executeSql("SELECT * FROM user WHERE idUsuario = ?;", [user.idPessoa],
      function(tx, res){
        //alert("Registros: " + res.rows.length);
        if (res.rows.length > 0) {
          updateUser(user.token, new Date().getTime(), user.idPessoa);
        }else{
          insertUser(user);
        }
      });
  }, errorHandler);
}

function getCurrentToken(){
  var token;
  db.transaction(function(tx){
    tx.executeSql("SELECT * FROM user ORDER BY ultimoLogin DESC", [],
      function(tx, res){
        if (res.rows.length > 0) {
          token = res.rows.item(0).token;
        }else{
          //alert("nenhum usuario");
        }
        try {
          if (token) {
            window.token = token;
            $.mobile.changePage("#pageone");
            $('#footer').find("a[data-icon='power']").attr('id',res.rows.item(0).idUsuario);
            getDataFromDB(res.rows.item(0).idUsuario);
            sendToken(token, res.rows.item(0).idUsuario);
            cleanSchedule();
            scheduleRequest(token, res.rows.item(0).idUsuario);
          }else{
            $.mobile.changePage("#pagelogin");
          }
        } catch (exception) {

        } finally {
            //$.mobile.initializePage();
        }
      });
  }, errorHandler);
}

function getDataFromDB(idUsuario){
  this.idUsuario = idUsuario;
  messages = [];
  db.transaction(function(tx){
      tx.executeSql("SELECT * FROM mensagens WHERE idUsuario = ?;", [idUsuario],
        function(tx, results){
          if (results.rows.length > 0) {
            for (var i = 0; i < results.rows.length; i++) {
              messages.push(results.rows.item(i));
            };
            setMsgToHtml(messages);
          }
        });
    }, errorHandler);
}

function getDataFromDBForCalendar(idUsuario){
  $('#calendar').fullCalendar('removeEvents');
  db.transaction(function(tx){
      tx.executeSql("SELECT * FROM mensagens WHERE idUsuario = ?;", [idUsuario],
        function(tx, results){
          if (results.rows.length > 0) {
            for (var i = 0; i < results.rows.length; i++) {
              msg = results.rows.item(i);
              addCalendarEvent(msg.idMensagem, new Date(msg.dataEnvio), msg.assunto);
            };
          }
        });
    }, errorHandler);
}

function getRepliesFromDB(idMensagem){
  replies = [];
  db.transaction(function(tx){
      tx.executeSql("SELECT * FROM respostas WHERE idMensagem = ?;", [idMensagem],
        function(tx, results){
          if (results.rows.length > 0) {
            for (var i = 0; i < results.rows.length; i++) {
              replies.push(results.rows.item(i));
            };
            setReplyToHtml(replies);
          }
        });
    }, errorHandler);
}

function saveMessage(msg, idUsuario){
  db.transaction(function(tx){
    tx.executeSql("insert into mensagens(idMensagem, assunto, mensagem, idUsuario, professor, dataEnvio) values(?,?,?,?,?,?)",
      [msg.idMensagem, msg.assunto, msg.mensagem, idUsuario, msg.professor, msg.dataEnvio]);
  }, errorHandler);
}

function updateUser(token, date, id){
  db.transaction(function(tx){
    tx.executeSql("UPDATE user SET token = ?, ultimoLogin = ? WHERE idUsuario = ?;",
      [token, date, id], function(){return false}, errorHandler);
  }, errorHandler);
}

function insertUser(user){
  db.transaction(function(tx){
    tx.executeSql("INSERT INTO user (idUsuario, usuario, senha, token, ultimoLogin) VALUES (?,?,?,?,?);",
      [user.idPessoa, user.usuario, user.senha, user.token, new Date().getTime()], nullHandler, errorHandler);
  });
}

function insertReply(reply){
  db.transaction(function(tx){
    tx.executeSql("INSERT INTO respostas (idMensagem, idUsuario, resposta, dataEnvio) VALUES (?,?,?,?);",
      [reply.idMensagem, reply.idUsuario, reply.resposta, new Date().getTime()], nullHandler, errorHandler);
  });
}

function showMessage(idMensagem){
  db.transaction(function(tx){
    tx.executeSql("SELECT * FROM mensagens WHERE idMensagem = ?;", [idMensagem],
      function(tx, results){
        if (results.rows.length > 0) {
          $('#msg #cabecalho_mensagem li').remove().listview().listview('refresh');
          $('#msg #cabecalho_mensagem').append("<li>Professor(a): "+results.rows.item(0).professor+"</li>").listview().listview('refresh');
          $('#msg #cabecalho_mensagem').append("<li>Data: "+formattedDate(results.rows.item(0).dataEnvio)+"</li>").listview().listview('refresh');
          $('#msg #assunto').text(results.rows.item(0).assunto);
          $('#msg #assunto').attr('idmensagem', idMensagem);
          $('#msg #assunto').attr('token', window.token);
          $('#msg #assunto').attr('idpessoa', results.rows.item(0).idUsuario);
          $('#msg p').text(results.rows.item(0).mensagem);
        }
      }, errorHandler);
    }, errorHandler);
}

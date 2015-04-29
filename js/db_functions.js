var db;

function deviceready(){
  db = window.openDatabase("agenda", "1.0", "agenda", 1000000);
  db.transaction(setupDatabase, errorHandler);
}

function setupDatabase(tx){
  //tx.executeSql('drop table if exists user;');
  //tx.executeSql('drop table if exists mensagens;');
  tx.executeSql('CREATE TABLE IF NOT EXISTS user (idUsuario INTEGER, usuario TEXT, senha TEXT, token TEXT, ultimoLogin TEXT);');
  //tx.executeSql('create table if not exists mensagens (idMensagem INTEGER PRIMARY KEY, idUsuario INTEGER, assunto TEXT, mensagem TEXT, dataEnvio DATE, horaEnvio TIME);');
  //sem primary key
  tx.executeSql('create table if not exists mensagens (idMensagem INTEGER, idUsuario INTEGER, assunto TEXT, mensagem TEXT, dataEnvio DATE, horaEnvio TIME, professor TEXT);');
  getCurrentToken();
}

function hasToken(user){
  db.transaction(function(tx){
    tx.executeSql("SELECT * FROM user WHERE idUsuario = ?;", [user.idPessoa], 
      function(tx, res){
        //alert("Registros: " + res.rows.length);
        if (res.rows.length > 0) {
          for (var i = 0; i < res.rows.length; i++) {
            updateUser(res.rows.item(i));
          }
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
            $.mobile.changePage("#pageone");
            //document.location.hash = "#pageone";
            getDataFromDB(res.rows.item(0).idUsuario);
            sendToken(token, res.rows.item(0).idUsuario);
            //cleanSchedule();
            //scheduleRequest(token, res.rows.item(0).idUsuario);
          }else{
            $.mobile.changePage("#pagelogin");
            //document.location.hash = "#pagelogin";
          }
        } catch (exception) {

        } finally {
            //$.mobile.initializePage();
        }
      });
  }, errorHandler);
}

function getDataFromDB(idUsuario){
  messages = [];
  db.transaction(function(tx){
      tx.executeSql("SELECT * FROM mensagens WHERE idUsuario = ?;", [idUsuario], 
        function(tx, results){
          if (results.rows.length > 0) {
            for (var i = 0; i < results.rows.length; i++) {
              //setMsgToHtml(results.rows.item(i));
              messages.push(results.rows.item(i));
            };
            setMsgToHtml(messages);
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

function updateUser(user){
  db.transaction(function(tx){
    tx.executeSql("UPDATE user SET token = ?, ultimoLogin = ? WHERE idUsuario = ?;",
      [user.token, new Date().getTime(), user.idUsuario], function(){return false}, errorHandler);
  }, errorHandler);
}

function insertUser(user){
  db.transaction(function(tx){
    tx.executeSql("INSERT INTO user (idUsuario, usuario, senha, token, ultimoLogin) VALUES (?,?,?,?,?);",
      [user.idPessoa, user.usuario, user.senha, user.token, new Date().getTime()], nullHandler, errorHandler);
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
            //for (var i = 0; i < results.rows.length; i++) {
              $('#msg #assunto').text(results.rows.item(0).assunto);
              $('#msg p').text(results.rows.item(0).mensagem);
            //};
          }
        }, errorHandler);
    }, errorHandler);
}
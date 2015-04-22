function init(){
  document.addEventListener('deviceready', deviceready, true);
}

var db;

function deviceready(){
  db = window.openDatabase("agenda", "1.0", "agenda", 1000000);
  db.transaction(setupDatabase, errorHandler);
}

function setupDatabase(tx){
  //tx.executeSql('drop table if exists usuario;');
  tx.executeSql('CREATE TABLE IF NOT EXISTS user (idUsuario INTEGER, usuario TEXT, senha TEXT, token TEXT);');
  tx.executeSql('create table if not exists mensagens (idMensagem INTEGER PRIMARY KEY, assunto TEXT, mensagem TEXT, dataEnvio DATE, horaEnvio TIME);');
  getCurrentToken();
}

$('#login').submit(function(e){
  e.preventDefault();
  $.mobile.loading('show');
  $.ajax({
    url: "http://agendaescolar.lealweb.com.br/servicoSessao/validarUsuario",
    type: 'POST',
    dataType: 'text',
    contentType: 'application/x-www-form-urlencoded',
    data: $(this).serialize(),
    success: function(data){
      console.log(data);
      try{
        var data_obj = JSON.parse(data);
      }catch(err){
        var data_obj = data;
      }
      if (data_obj.hasOwnProperty('token')) {
        hasToken(data_obj);
        $.mobile.loading('hide');
        $.mobile.changePage("#pageone");
        sendToken(data_obj.token);
      }else{
        $.mobile.loading('hide');
        $.mobile.changePage('#erroLogin', 'pop', true, true);
      };
    },
    error: function(xhr, status, error){
      $.mobile.loading('hide');
      console.log(error.message);
    }
  });
});

function hasToken(user){
  db.transaction(function(tx){
    tx.executeSql("SELECT * FROM user WHERE idUsuario = ?;", [user.idPessoa], 
      function(tx, res){
        //alert("Registros: " + res.rows.length);
        if (res.rows.length > 0) {
          for (var i = 0; i < res.rows.length; i++) {
            alert(res.rows.item(i).token);
            updateUser(res.rows.item(i));
          }
        }else{
          insertUser(user);
        }
      }, errorHandler);
  }, errorHandler);
}

function getCurrentToken(){
  var token;
  db.transaction(function(tx){
    tx.executeSql("SELECT * FROM user LIMIT 1", [], 
      function(tx, res){
        if (res.rows.length > 0) {
          token = res.rows.item(0).token;
        }else{
          //alert("nadinha");
        }
        if (token) {
          $.mobile.changePage("#pageone");
          //sendToken(token);
          getDataFromDB();
        }else{
          $.mobile.changePage("#pagelogin");
        };
      }, errorHandler);
  }, errorHandler);
  return token;
}

function sendToken(token){
  $.ajax("http://agendaescolar.lealweb.com.br/servicoMensagem/consultaPorResponsavel/"+token)
    .done(function(data){
      try{
        var data_obj = JSON.parse(data);
      }catch(err){
        var data_obj = data;
      }
      if (data_obj.hasOwnProperty('msg')) {
        alert('token invalido');
      }else{
        $.each(data_obj, function(i, msg){
          insertData(msg);
        });
        getDataFromDB();
      }
    });
}

function getDataFromDB(){
	db.transaction(function(tx){
      tx.executeSql("SELECT * FROM mensagens;", [], 
        function(tx, results){
          if (results.rows.length > 0) {
            for (var i = 0; i < results.rows.length; i++) {
              setMsgToHtml(results.rows.item(i));
            };
          }
        }, errorHandler);
    }, errorHandler);
}

function setMsgToHtml(mensagem){
  $('#mensagens').append(
    $('<li>').append(
      $("<a href='#msg_1' data-transition='slide'>").append(
        $("<img src='css/images/icons-png/book-icon.png' class='ui-li-icon'> "+
          "<h2>"+mensagem.assunto+"</h2>"+
          "<p>"+mensagem.mensagem+"</p>"
        )
      )
    )
  ).listview().listview('refresh');
}

function insertData(msg){
	db.transaction(function(tx){
		tx.executeSql("insert into mensagens(idMensagem, assunto, mensagem) values(?,?,?)", [msg.idMensagem, msg.assunto,msg.mensagem]);
	}, errorHandler);
}

function updateUser(user){
  db.transaction(function(tx){
    tx.executeSql("UPDATE user SET token = ? WHERE idUsuario = ?;",
      [user.token, user.idPessoa], errorHandler, function() { alert('row updated');});
  }, errorHandler);
}

function insertUser(user){
  db.transaction(function(tx){
    tx.executeSql("INSERT INTO user (idUsuario, usuario, senha, token) VALUES (?,?,?,?);",
      [user.idPessoa, user.usuario, user.senha, user.token], nullHandler, errorHandler);
  });
}

function errorHandler(tx, e){
  alert(e.message);
}

function nullHandler(){};
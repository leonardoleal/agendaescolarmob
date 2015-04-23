function init(){
  document.addEventListener('deviceready', deviceready, true);
}

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
  tx.executeSql('create table if not exists mensagens (idMensagem INTEGER, idUsuario INTEGER, assunto TEXT, mensagem TEXT, dataEnvio DATE, horaEnvio TIME);');
  getCurrentToken();
}

$('#login').submit(function(e){
  e.preventDefault();
  cleanList();
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
        sendToken(data_obj.token, data_obj.idPessoa);
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
    tx.executeSql("SELECT * FROM user ORDER BY ultimoLogin DESC", [], 
      function(tx, res){
        if (res.rows.length > 0) {
          token = res.rows.item(0).token;
        }else{
          //alert("nadinha");
        }
        try {
          if (token) {
            $.mobile.changePage("#pageone");
            //document.location.hash = "#pageone";
            sendToken(token, res.rows.item(0).idUsuario);
            getDataFromDB(res.rows.item(0).idUsuario);
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
  //return token;
}

function sendToken(token, idUsuario){
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
          //console.log(msg);
          insertData(msg, idUsuario);
        });
        getDataFromDB(idUsuario);
      }
    });
}

function getDataFromDB(idUsuario){
  db.transaction(function(tx){
      tx.executeSql("SELECT * FROM mensagens WHERE idUsuario = ?;", [idUsuario], 
        function(tx, results){
          if (results.rows.length > 0) {
            for (var i = 0; i < results.rows.length; i++) {
              setMsgToHtml(results.rows.item(i));
            };
          }else{
            alert("nenhuma msg para este id");
          }
        }, errorHandler);
    }, errorHandler);
}

function setMsgToHtml(mensagem){
  $('#mensagens').append(
    $('<li>').append(
      $("<a href='#msg' data-transition='slide' id="+mensagem.idMensagem+">").append(
        $("<img src='css/images/icons-png/book-icon.png' class='ui-li-icon'> "+
          "<h2>"+mensagem.assunto+"</h2>"+
          "<p style='tex-align: left !important;'>"+mensagem.mensagem+"</p>"
        )
      )
    )
  ).listview().listview('refresh');
}

function insertData(msg, idUsuario){
  console.log(idUsuario);
  console.log(msg);
  db.transaction(function(tx){
    tx.executeSql("insert into mensagens(idMensagem, assunto, mensagem, idUsuario) values(?,?,?,?)", [msg.idMensagem, msg.assunto, msg.mensagem, idUsuario]);
  }, errorHandler);
}

function updateUser(user){
  db.transaction(function(tx){
    tx.executeSql("UPDATE user SET token = ?, ultimoLogin = ? WHERE idUsuario = ?;",
      [user.token, new Date().getTime(), user.idPessoa], errorHandler, function() { alert('row updated');});
  }, errorHandler);
}

function insertUser(user){
  db.transaction(function(tx){
    tx.executeSql("INSERT INTO user (idUsuario, usuario, senha, token, ultimoLogin) VALUES (?,?,?,?,?);",
      [user.idPessoa, user.usuario, user.senha, user.token, new Date().getTime()], nullHandler, errorHandler);
  });
}

function errorHandler(e){
  alert(e.message);
}

function nullHandler(){};

function cleanList () {
  $('#mensagens .ui-li-has-icon').remove().listview().listview('refresh');
}

$('#mensagens').on( "click", "a", function() {
  var idMensagem = $(this).attr('id');
  showMessage(idMensagem);
});

function showMessage(idMensagem){
  db.transaction(function(tx){
      tx.executeSql("SELECT * FROM mensagens WHERE idMensagem = ?;", [idMensagem], 
        function(tx, results){
          if (results.rows.length > 0) {
            $('#msg #cabecalho_mensagem li').remove().listview().listview('refresh');
            $('#msg #cabecalho_mensagem').append("<li>Professora: Helena</li>").listview().listview('refresh');
            $('#msg #cabecalho_mensagem').append("<li>Data: 01/01/2015</li>").listview().listview('refresh');
            for (var i = 0; i < results.rows.length; i++) {
              $('#msg #assunto').text(results.rows.item(i).assunto);
              $('#msg p').text(results.rows.item(i).mensagem);
            };
          }else{
            alert("nenhuma msg para este id");
          }
        }, errorHandler);
    }, errorHandler);
}
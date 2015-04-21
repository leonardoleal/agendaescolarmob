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
      $.mobile.loading('hide');
      if (data_obj.hasOwnProperty('token')) {
        $.mobile.changePage("#pageone");
      }else{
        $.mobile.changePage('#erroLogin', 'pop', true, true);
      };
    },
    error: function(xhr, status, error){
      $.mobile.loading('hide');
      console.log(error.message);
    }
  });
});

function init(){
  document.addEventListener('deviceready', deviceready, true);
}

var db;

function deviceready(){
  db = window.openDatabase("agenda", "1.0", "agenda", 1000000);
  db.transaction(setupDatabase, errorHandler, getDataFromUrl());
}

function setupDatabase(tx){
  tx.executeSql('create table if not exists usuario ' +
    '(idUsuario INTEGER, usuario TEXT, senha TEXT, token TEXT)');
  tx.executeSql('create table if not exists mensagens ' +
      '(idMensagem INTEGER PRIMARY KEY, assunto TEXT, mensagem TEXT, dataEnvio DATE, horaEnvio TIME)');
}

function login(){
  $.ajax({
    url: "",
    type: 'POST'
  });
}

function sendToken(token){
  $.ajax({
    url: "",
    type: 'POST'
  });
}

function errorHandler(e){
  alert(e.message);
}

function getDataFromUrl(){
  $.ajax("http://agendaescolar.lealweb.com.br/index.php?file=mensagem")
  .done(function(data){
    $.each(data, function(i, mensagem){
      getDataFromDB(mensagem);
    });
  });
}

function getDataFromDB(msg){
	db.transaction(function(tx){
      tx.executeSql("select * from mensagens where idMensagem = ?;", [msg.idMensagem], 
        function(tx, results){
          if (results.rows.length > 0) {
            setMsgToHtml(results.rows.item(0));
          }else{
            insertData(msg);
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
  );
  $('#mensagens').listview().listview('refresh');
}

function insertData(msg){
	db.transaction(function(tx){
		tx.executeSql("insert into mensagens(idMensagem, assunto, mensagem) "+
			"values(?,?,?)", [msg.idMensagem, msg.assunto,msg.mensagem]);
	}, errorHandler);
  setMsgToHtml(msg);
}
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
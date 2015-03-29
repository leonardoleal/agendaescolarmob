function init(){
  document.addEventListener('deviceready', deviceready, true);
}

var db;

function deviceready(){
  db = window.openDatabase("agenda", "1.0", "agenda", 1000000);
  db.transaction(setup, errorHandler, dbReady);
}

function setup(tx){
  tx.executeSql('create table if not exists mensagem ' +
      '(id INTEGER PRIMARY KEY, assunto TEXT, mensagem TEXT, dataEnvio DATE, horaEnvio TIME)');
}

function errorHandler(e){
  alert(e.message);
}

function dbReady(){

}
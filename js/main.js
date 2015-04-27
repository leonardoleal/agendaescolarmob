function init(){
  document.addEventListener('deviceready', deviceready, true);
}

function setMsgToHtml(mensagem){
  $('#mensagens').append(
    $('<li>').append(
      $("<a href='#msg' data-transition='slide' id="+mensagem.idMensagem+">").append(
        $("<img src='css/images/icons-png/book-icon.png' class='ui-li-icon'> "+
          "<h2>"+mensagem.assunto+"</h2>"
        )
      )
    )
  ).listview().listview('refresh');
}

function cleanList () {
  $('#mensagens .ui-li-has-icon').remove().listview().listview('refresh');
}

$('#mensagens').on( "click", "a", function() {
  var idMensagem = $(this).attr('id');
  showMessage(idMensagem);
});

function scheduleRequest(token, idUsuario){
  window.clearInterval(1);
  setInterval(function(){
    console.log("buscando novas mensagens");
    sendToken(token, idUsuario);
  }, 50000);
}

//DB callback functions
function errorHandler(e){
  alert(e.message);
}

function nullHandler(){};
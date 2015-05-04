function init(){
  document.addEventListener('deviceready', deviceready, true);
}

function setMsgToHtml(messages){
  $.each(messages, function(i, msg){
    $('#mensagens').append(
      $('<li>').append(
        $("<a href='#msg' data-transition='slide' id="+msg.idMensagem+">").append(
          $("<img src='css/images/icons-png/book-icon.png' class='ui-li-icon'> "+
            "<h2>"+msg.assunto+"</h2>"
          )
        )
      )
    ).listview().listview('refresh');
  });
}

function setIndividualMsgToHtml(message){
  $('#mensagens li:nth-child(1)').after(
    $('<li>').append(
      $("<a href='#msg' data-transition='slide' id="+message.idMensagem+">").append(
        $("<img src='css/images/icons-png/book-icon.png' class='ui-li-icon'> "+
          "<h2>"+message.assunto+"</h2>"
        )
      )
    )
  );
  $('#mensagens').listview('refresh');
}

function setReplyToHtml(replies){
  $.each(replies, function(i, reply){
    $('#respostas_enviadas').append(
      $('<li>').append("<p><i><b>Enviada em "+formattedDate(reply.dataEnvio)+": </b></i>"+reply.resposta+"</p>")
    );
  });
  $('#resposta').val('');
}

function cleanList () {
  $('#mensagens .ui-li-has-icon').remove().listview().listview('refresh');
}

function cleanRepliesList(){
  $('#respostas_enviadas li').remove().listview().listview('refresh');
}

$('#mensagens').on( "click", "a", function() {
  var idMensagem = $(this).attr('id');
  cleanRepliesList();
  showMessage(idMensagem);
  getRepliesFromDB(idMensagem);
});

$('#footer').find("a[data-icon='power']").click(function(){
  var id = $(this).attr('id');
  updateUser(null, null, id);
  window.token = null;
  cleanSchedule();
});

$('#login').submit(function(e){
  e.preventDefault();
  cleanList();
  login($(this).serialize());
});

$('#form_resposta').submit(function(e){
  e.preventDefault();
  var token = $("#assunto").attr('token');
  var idMensagem = $("#assunto").attr('idmensagem');
  var idPessoa = $("#assunto").attr('idPessoa');
  var reply = $('#resposta').val();
  sendReply(token, idMensagem, idPessoa, reply);
});

function formattedDate(d){
    var data = new Date(d);
    var dia = data.getDate();
    if (dia.toString().length == 1)
      dia = "0"+dia;
    var mes = data.getMonth()+1;
    if (mes.toString().length == 1)
      mes = "0"+mes;
    var ano = data.getFullYear();
    return dia+"/"+mes+"/"+ano;
}

function cleanSchedule(){
  if(window.intervalId)
  {
    clearInterval(window.intervalId);
    window.intervalId = null;
  }
}

function scheduleRequest(token, idUsuario){
  window.intervalId = setInterval(function(){
    console.log("buscando novas mensagens");
    sendToken(token, idUsuario);
  }, 300000);
}

//DB callback functions
function errorHandler(e){
  alert(e.message);
}

function nullHandler(){};

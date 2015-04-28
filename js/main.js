window.timer = [];

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

function cleanList () {
  $('#mensagens .ui-li-has-icon').remove().listview().listview('refresh');
}

$('#mensagens').on( "click", "a", function() {
  var idMensagem = $(this).attr('id');
  showMessage(idMensagem);
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
  /*while(window.timer.length > 0)
  {
      window.clearInterval(window.timer.pop());
  }*/
}

function scheduleRequest(token, idUsuario){
  /*timer.push(window.setInterval(function(){
    console.log("buscando novas mensagens");
    sendToken(token, idUsuario);
  }, 50000));*/
}

//DB callback functions
function errorHandler(e){
  alert(e.message);
}

function nullHandler(){};
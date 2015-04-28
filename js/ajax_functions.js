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
        $('#login #usuario').val('');
        $('#login #senha').val('');
        sendToken(data_obj.token, data_obj.idPessoa);
        cleanSchedule();
        scheduleRequest(data_obj.token, data_obj.idPessoa);
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

function sendReceivedMessages(token, messages){
  $.ajax({
    url: "http://agendaescolar.lealweb.com.br/servicoMensagem/alterarStatusMensagem/" + token,
    type: 'POST',
    dataType: 'text',
    contentType: 'application/x-www-form-urlencoded',
    data: { idMensagem: messages, status: 'recebido' },
    success: function(data){
      console.log(data);
    },
    error: function(xhr, status, error){
      console.log(error.message);
    }
  });
}

function sendToken(token, idUsuario){
  var messages = [];
  $.ajax({
    url: "http://agendaescolar.lealweb.com.br/servicoMensagem/consultaPorResponsavel/"+token,
    dataType: 'html'
  }).done(function(data){
    try{
      var data_obj = JSON.parse(data);
    }catch(err){
      var data_obj = data;
    }
    if (typeof(data_obj) != "string") {
      $.each(data_obj, function(i, msg){
        console.log(msg);
        saveMessage(msg, idUsuario);
        messages.push(msg.idMensagem);
      });
    }
    cleanList();
    getDataFromDB(idUsuario);
    if(messages.length > 0){
      sendReceivedMessages(token, messages);
    }
  });
}
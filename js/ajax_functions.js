function login(loginData){
  $.mobile.loading('show');
  $.ajax({
    url: "http://agendaescolar.lealweb.com.br/servicoSessao/validarUsuario",
    type: 'POST',
    dataType: 'text',
    contentType: 'application/x-www-form-urlencoded',
    data: loginData,
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
        $('#footer').find("a[data-icon='power']").attr('id',data_obj.idPessoa);
        getDataFromDB(data_obj.idPessoa);
        sendToken(data_obj.token, data_obj.idPessoa);
        window.token = data_obj.token;
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
}

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
        setIndividualMsgToHtml(msg);
        messages.push(msg.idMensagem);
      });
    }
    if(messages.length > 0){
      sendReceivedMessages(token, messages);
    }
  });
}

function sendReply(token, idMensagem, idPessoa, reply){
  $.ajax({
    url: "http://agendaescolar.lealweb.com.br/servicoMensagem/respostaResponsavel/" + token,
    type: 'POST',
    dataType: 'text',
    contentType: 'application/x-www-form-urlencoded',
    data: { idMensagem: idMensagem, idPessoa: idPessoa, mensagem: reply },
    success: function(data){
      console.log(data);
      if (typeof(data) == "string") {
        reply = { resposta: reply, idMensagem: idMensagem, idUsuario: idPessoa, dataEnvio: new Date().getTime() }
        setReplyToHtml([reply]);
        insertReply(reply);
      };
    },
    error: function(xhr, status, error){
      console.log(error.message);
    }
  });
}

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
          saveMessage(msg, idUsuario);
        });
        getDataFromDB(idUsuario);
      }
    });
}
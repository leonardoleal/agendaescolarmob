var Header = React.createClass({
  render: function(){
    return (
      <header className="bar bar-nav">
        <a href="#" className={"icon icon-left-nav pull-left" + (this.props.back==="true"?"":" hidden")}></a>
        <h1 className="title">{this.props.text}</h1>
      </header>
    );
  }
});

var SearchBar = React.createClass({
  searchHandler: function() {
    this.props.searchHandler(this.refs.searchKey.getDOMNode().value);
  },
  render: function () {
    return (
      <div className="bar bar-standard bar-header-secondary">
        <input type="search" ref="searchKey" onChange={this.searchHandler} value={this.props.searchKey}/>
      </div>
    );
  }
});

var MessageListItem = React.createClass({
  render: function(){
    return (
      <li className="table-view-cell media">
        <a href={"#messages/" + this.props.message.id}>
          {this.props.message.assunto}
          <p>{this.props.message.message}</p>
        </a>
      </li>
    );
  }
});

var MessageList = React.createClass({
  render: function(){
    var items = this.props.messages.map(function(message){
      return (
        <MessageListItem key={message.id} message={message} />
      );
    });
    return (
      <ul  className="table-view">
       {items}
      </ul>
    );
  }
});

var HomePage = React.createClass({
  render: function(){
    return (
      <div>
        <Header text="Agenda Escolar" back="false"/>
        <SearchBar searchKey={this.props.searchKey} searchHandler={this.props.searchHandler}/>
        <div className="content">
          <MessageList messages={this.props.messages}/>
        </div>
      </div>
    );
  }
});

var LoginPage = React.createClass({
  handleUsernameChange: function(e){
    this.setState({usuario: e.target.value});
  },
  handlePasswordChange: function(e){
    this.setState({senha: e.target.value});
  },
  handleSubmit: function(e){
    e.preventDefault();
    $.ajax({
      url: "http://agendaescolar.lealweb.com.br/servicoSessao/validarUsuario",
      type: 'POST',
      dataType: 'text',
      contentType: 'application/x-www-form-urlencoded',
      data: {usuario: this.state.usuario, senha: this.state.senha},
      success: function(data){
        console.log(data);
        try{
          var data_obj = JSON.parse(data);
          router.load('messages/');
        }catch(err){
          var data_obj = data;
        }      
      },
      error: function(xhr, status, error){
        $.mobile.loading('hide');
        console.log(error.message);
      }
    });
  },
  render: function(){
    return (
      <div>
        <Header text="Agenda Escolar" back="false" />
        <div className="content">
          <form method="POST" onSubmit={this.handleSubmit}>
            <input type="text" name="usuario" placeholder="Usuário" onChange={this.handleUsernameChange}/>
            <input type="password" name="senha"  placeholder="Senha" onChange={this.handlePasswordChange} />
            <button className="btn btn-positive btn-block">Login</button>
          </form>
        </div>
      </div>
    );
  }
});

var MessagePage = React.createClass({
  getInitialState: function() {
      return {message: {}};
  },
  componentDidMount: function() {
      this.props.service.findById(this.props.messageId).done(function(result) {
        this.setState({message: result});
      }.bind(this));
  },
  render: function () {
    return (
      <div>
        <Header text="Mensagem" back="true"/>
        <div className="card">
          <ul className="table-view">
            <li className="table-view-cell media">
              <h1>{this.state.message.assunto}</h1>
              <p>{this.state.message.message}</p>
            </li>
          </ul>
        </div>
      </div>
    );
  }
});

var App = React.createClass({
  getInitialState: function(){
    return {
      searchKey: '',
      messages: [],
      page: null
    }
  },
  searchHandler: function(searchKey){
    messageService.findByName(searchKey).done(function(messages){
      this.setState({searchKey:searchKey, messages: messages, page: <HomePage searchKey={searchKey} searchHandler={this.searchHandler} messages={messages} />});
    }.bind(this));
  },
  componentDidMount: function(){
    router.addRoute('', function() {
      this.setState({page: <LoginPage />});
    }.bind(this));
    router.addRoute('messages/', function() {
      this.setState({page: <HomePage searchKey={this.state.searchKey} searchHandler={this.searchHandler} messages={this.state.messages} />});
    }.bind(this));
    router.addRoute('messages/:id', function(id) {
      this.setState({page: <MessagePage messageId={id} service={messageService}/>});
    }.bind(this));
    router.start();
  },
  render: function(){
    return this.state.page;
  }
});

$(function() {
  document.addEventListener("deviceready", onDeviceReady, true);
});

function onDeviceReady(){
  React.render(<App />, document.body);
}
var Header = React.createClass({
  render: function(){
    return (
      <h1 className="title">{this.props.text}</h1>    
    );
  }
});

var SearchBar = React.createClass({
  searchHandler: function(){
    this.props.searchHandler(this.refs.searchKey.getDOMNode().value);
  },
  render: function(){
    return (
      <input type="search" ref="searchKey" onChange={this.searchHandler} />
    );
  }
});

var MessageListItem = React.createClass({
  render: function(){
    return (
      <li>
        <a href={"#messages/" + this.props.message.id}>
          {this.props.message.assunto}
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
      <ul>
        {items}
      </ul>
    );
  }
});

var HomePage = React.createClass({
  getInitialState: function(){
    return {messages: []}
  },
  searchHandler: function(key){
    this.props.service.findByName(key).done(function(result){
      this.setState({searchKey: key, messages: result});
    }.bind(this));
  },
  render: function(){
    return (
      <div>
        <Header text="Agenda Escolar" />
        <SearchBar searchHandler={this.searchHandler} />
        <MessageList messages={this.state.messages}/>
      </div>
    );
  }
});

var MessagePage = React.createClass({
  getInitialState: function(){
    return {message:  {}};
  },
  componentDidMount: function(){
    this.props.service.findById(this.props.messageId).done(function(result){
      this.setState({message: result});
    }.bind(this));
  },
  render: function(){
    return (
      <div>
        <Header text="Detalhes Mensagem" />
        <h3>{this.state.message.assunto}</h3>
        {this.state.message.message}
      </div>
    );
  }
});

router.addRoute('', function() {
    React.render(
        <HomePage service={messageService}/>,
        document.body
    );
});

router.addRoute('employees/:id', function(id) {
    React.render(
        <MessagePage messageId={id} service={messageService}/>,
        document.body
    );
});

React.render(<HomePage service={messageService} />, document.body);
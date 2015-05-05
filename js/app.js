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
        <input type="search" ref="searchKey" onChange={this.searchHandler}/>
      </div>
    );
  }
});;

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
                //<img className="media-object big pull-left" src={"pics/" + this.state.employee.firstName + "_" + this.state.employee.lastName + ".jpg" }/>
                <h1>{this.state.message.assunto}</h1>
                <p>{this.state.message.message}</p>
              </li>
              /*<li className="table-view-cell media">
                <a href={"tel:" + this.state.employee.officePhone} className="push-right">
                  <span className="media-object pull-left icon icon-call"></span>
                  <div className="media-body">
                  Call Office
                      <p>{this.state.employee.officePhone}</p>
                  </div>
                </a>
              </li>
              <li className="table-view-cell media">
                <a href={"tel:" + this.state.employee.mobilePhone} className="push-right">
                  <span className="media-object pull-left icon icon-call"></span>
                  <div className="media-body">
                  Call Mobile
                    <p>{this.state.employee.mobilePhone}</p>
                  </div>
                </a>
              </li>
              <li className="table-view-cell media">
                <a href={"sms:" + this.state.employee.mobilePhone} className="push-right">
                  <span className="media-object pull-left icon icon-sms"></span>
                  <div className="media-body">
                  SMS
                      <p>{this.state.employee.mobilePhone}</p>
                  </div>
                </a>
              </li>
              <li className="table-view-cell media">
                <a href={"mailto:" + this.state.employee.email} className="push-right">
                  <span className="media-object pull-left icon icon-email"></span>
                  <div className="media-body">
                  Email
                      <p>{this.state.employee.email}</p>
                  </div>
                </a>
              </li>*/
          </ul>
        </div>
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

router.addRoute('messages/:id', function(id) {
    React.render(
        <MessagePage messageId={id} service={messageService}/>,
        document.body
    );
});
router.start();

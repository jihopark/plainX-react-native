'use strict';

var React = require('react-native');
var update = require('react-addons-update');
var LoadingView = require('../LoadingView.js');
var ParameterUtils = require('../utils/ParameterUtils.js');
var AlertUtils = require('../utils/AlertUtils.js');
var RestKit = require('react-native-rest-kit');
var TimerMixin = require('react-native-timer-mixin')
var PlainListView = require('../PlainListView.js');

var SessionActions = require('../../actions/SessionActions');
var PlainActions = require('../../actions/PlainActions');

var PlainLog = require('../../PlainLog.js');
var P = new PlainLog("BaseScreen");

var MixpanelTracker = require('../../MixpanelTracker.js');

var {
  View,
  AsyncStorage,
  StyleSheet,
  Platform,
  InteractionManager,
  DeviceEventEmitter,
} = React;

class BaseScreen extends React.Component {
  constructor() {
    super();
    this.screenCommonStyle = StyleSheet.create({
      container: {
        paddingTop: 45,
        flex: 1,
      }
    });
    this.state = {
      data: null,
      transitionDone: false,
      isRefreshing: false,
    };

    this.pushScreenDataToStore = this.pushScreenDataToStore.bind(this);
    this.createListView = this.createListView.bind(this);
    this.createListViewPagination = this.createListViewPagination.bind(this);
    this.createListViewPaginationConversation = this.createListViewPaginationConversation.bind(this);

    this.handleClick = this.handleClick.bind(this);

    this.componentDidMount = this.componentDidMount.bind(this);
    this.componentWillUnmount = this.componentWillUnmount.bind(this);
    this.loadMore = this.loadMore.bind(this);
    this.loadScreen = this.loadScreen.bind(this);
    this.checkEndPointInParams = this.checkEndPointInParams.bind(this);
    this.fetchData = this.fetchData.bind(this);
    this.onPressErrorDialog = this.onPressErrorDialog.bind(this);
    this.handleInitialRequest = this.handleInitialRequest.bind(this);
    this.handleAddMoreRequest = this.handleAddMoreRequest.bind(this);
    this.sendFeedBack = this.sendFeedBack.bind(this);
    this.handleFeedbackRequest = this.handleFeedbackRequest.bind(this);

    this.updateKeyboardSpace = this.updateKeyboardSpace.bind(this);
    this.resetKeyboardSpace = this.resetKeyboardSpace.bind(this);

    this.refreshScreen = this.refreshScreen.bind(this);
  }

  loadMore() {
    if (this.state.data["HasNext"]) {
      console.log("Fetch Data " + (this.state.data["Page"]+1));
      this.fetchData(this.props.loginToken, (this.state.data["Page"]+1));
    }
  }

  componentDidMount() {
    this.loadScreen();
    this.props.updateMessageCount();
    DeviceEventEmitter.addListener('keyboardWillShow', this.updateKeyboardSpace);
    DeviceEventEmitter.addListener('keyboardWillHide', this.resetKeyboardSpace);
    DeviceEventEmitter.addListener('keyboardDidShow', this.updateKeyboardSpace);
    DeviceEventEmitter.addListener('keyboardDidHide', this.resetKeyboardSpace);

    MixpanelTracker.trackScreenEvent(this.trackName, ParameterUtils.getStringToParams(this.props.params));
    InteractionManager.runAfterInteractions(() => {
      this.setState({transitionDone: true});
    });
  }

  componentWillUnmount() {
    this.props.updateMessageCount();
    DeviceEventEmitter.removeAllListeners('keyboardWillShow');
    DeviceEventEmitter.removeAllListeners('keyboardWillHide');
    DeviceEventEmitter.removeAllListeners('keyboardDidShow');
    DeviceEventEmitter.removeAllListeners('keyboardDidHide');
    if (this.state.data && this.state.data["Cards"]){
      P.log("componentWillUnmount", "Remove Cards");
      PlainActions.removeCards.defer(this.state.data["Cards"]);
    }
  }

  createListView(){
    return this.createListViewPagination(false);
  }

  createListViewPagination(pagination){
    return this.createListViewPaginationConversation(pagination, false)
  }

  refreshScreen(){
    this.setState({data:null, isRefreshing: true});
    this.loadScreen();
  }

  createListViewPaginationConversation(pagination, isConversation) {
    var props = {
      refreshScreen: this.refreshScreen,
      isRefreshing: this.state.isRefreshing,
      isRefreshingEnabled: this.endPoint != undefined,
      getCard: this.props.getCard,
      getOffer: this.props.getOffer,
      getConversation: this.props.getConversation,
      handleClick: this.handleClick,
      user: this.props.user,
      onEndReached: (pagination ? this.loadMore : null),
      cards: this.state.data["Cards"],
    }
    if (isConversation){
      props.hasBackgroundColor = true;
      props.invertList = true;
    }

    return (<PlainListView {...props} />);
  }

  handleClick(cardName, data){
    P.log("handleClick", cardName);
    TimerMixin.requestAnimationFrame(() => {
      switch(cardName){
        case "Offer":
          this.props.pushScreen({uri: this.props.routes.addRoute('offerDetail?'+ParameterUtils.getParamsToString({"Id": data["OfferId"]}))});
          break;
        case "CurrencySelect":
          this.props.pushScreen({uri: this.props.routes.addRoute('offerlist?'+ParameterUtils.getParamsToString(data))});
          break;
        case "UserConversationItem":
          this.props.pushScreen({uri: this.props.routes.addRoute('conversationRoom?'+ParameterUtils.getParamsToString({"Id": data["ConversationId"]}))});
          break;
        case "Feedback":
          this.sendFeedBack(data);
          break;
      }
    });
  }

  sendFeedBack(data){
    const url = this.props.api_domain + "conversation/feedback?Id="+this.getConversationId();
    P.log("sendFeedBack", url);
    P.log("sendFeedBack", data);

    var request = {
      method: 'post',
      headers: {
        'X-Session': this.props.loginToken,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    };
    this.props.setNetworkActivityIndicator(true);
    RestKit.send(url, request, this.handleFeedbackRequest);
  }

  handleFeedbackRequest(error, json) {
    this.props.setNetworkActivityIndicator(false);
    if (error) {
      P.log("handleFeedbackRequest/error", error);
      return ;
    }
    P.log("handleFeedbackRequest/success", json);
  }

  loadScreen() {
    var enablePagination = this.props.enablePagination;
    P.log("loadScreen", "Load Screen with Token " + this.props.loginToken);
    this.fetchData(this.props.loginToken, this.props.enablePagination ? 1 : 0);
  }

  render() {
    if (this.state.data && this.state.transitionDone) {
      return this.renderScreen();
    }
    else {
      return (<LoadingView />);
    }
  }

  checkEndPointInParams() {
    var params = ParameterUtils.getStringToParams(this.props.params);
    if (params["endPoint"])
      return params["endPoint"];
    return null;
  }

  fetchData(token, page) {
    var endPoint = this.endPoint || this.checkEndPointInParams();
    if (endPoint){
      this.props.setNetworkActivityIndicator(true);
      var url = this.props.api_domain + endPoint + "?" + this.props.params + "&Page=" + page;
      P.log("fetchScreen", url);

      var request = token ?
      {
        method: 'get',
        headers:{ 'X-Session': token, }
      } : { method: 'get' };

      RestKit.send(url, request, page <= 1 ? this.handleInitialRequest : this.handleAddMoreRequest);
    }
    else{
      P.log("fetchData", "Set State");
      this.setState({data: 1}); //no need to set data
    }
  }

  onPressErrorDialog() {
    this.props.popScreen();
  }

  handleInitialRequest(error, json){
    this.props.setNetworkActivityIndicator(false);

    if (error) {
      var statusCode = error.status;
      if (statusCode >= 500 || statusCode == 400 || statusCode == 404) {

        if (this.props.routes.getDepth() > 1) {
          var message = JSON.parse(error.body)["Error"];
          P.log("handleInitialRequest", message);
          AlertUtils.showCustomAlert("", message, "" ,"", this.onPressErrorDialog, this.onPressErrorDialog);
          return ;
        }
        var errorCard = {"UUID": "-999", "Name": "Error"};
        this.setState({data: {"Page":0, "HasNext": false,
                         "Cards": [errorCard]}});
      }
      else if (error.status == 401){
        if (this.props.loginToken)
          SessionActions.logOut(this.props.loginToken, this.props.deviceToken);
        this.props.replaceScreen({uri:this.props.routes.addRoute('login')});
      }
      return ;
    }
    if (json){
      P.log("handleInitialRequest", "200");
      this.pushScreenDataToStore(json);
      this.setState({data: json, isRefreshing: false});
    }
  }

  handleAddMoreRequest(error, json){
    this.props.setNetworkActivityIndicator(false);
    if (error) {
      console.log(error);
      if (error.status == 500) {
      //  this.setState({data: {"Page":0, "HasNext": false,
      //                   "Cards": [{"UUID": "1", "Name": "Error", "Merged": ""}]}});
      }
      else if (error.status == 401){
        if (this.props.loginToken)
          SessionActions.logOut(this.props.loginToken, this.props.deviceToken);
          this.props.replaceScreen({uri:this.props.routes.addRoute('login')});
      }
      return ;
    }
    // if normal response 200
    if (json == undefined)
      return ;
    if (this.state.data != null && this.state.data["Page"] < json["Page"]) {
      var data = update(this.state.data, {"Cards": {$push : json["Cards"] }})
      data = update(data, {"HasNext": {$set : json["HasNext"] }})
      data = update(data, {"Page": {$set : json["Page"] }})

      this.pushScreenDataToStore(json);
      this.setState({
        data: data
      });
    }
  }

  pushScreenDataToStore(data){
    PlainActions.updateScreenData(
      data["Offers"], data["Conversations"], data["Cards"]);
  }

  //KeyboardEvent
  updateKeyboardSpace() {
    this.setState({keyboardSpace: 1});
  }

  resetKeyboardSpace() {
    this.setState({keyboardSpace: 0});
  }
}

module.exports = BaseScreen;

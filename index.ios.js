'use strict';

var React = require('react-native');
var {
  AppRegistry,
  PushNotificationIOS,
  AppStateIOS,
  Navigator,
  AsyncStorage,
} = React;

var PlainNavigator = require('./components/PlainNavigator.js');

var API_DOMAIN = 'https://plainexchange.herokuapp.com/api/v1/';
var RestKit = require('react-native-rest-kit');

//var OffersList = require('./components/OffersList.js')

var body = React.createClass({
  getInitialState: function() {
    return {
      uri: 'main',
      messageCount: 0,
    };
  },
  async saveDeviceToken(token) {
    try {
      await AsyncStorage.setItem("DEVICE_TOKEN", token);
      console.log("SAVED");
    } catch (error) {
      console.log("ERROR" + error);
    }
  },
  async loadTokenIfAny(){
    if (this.loginToken) return this.loginToken;
    try {
      var value = await AsyncStorage.getItem("SESSION");
      console.log("User Is Logged In");
      this.loginToken = value;
      return value;
    } catch (error) {
      console.log("Error Retreving LoginToken");
      return null;
    }
  },
  onCheckPermission: function(permission) {
    console.log("Permission alert:" + permission.alert + " badge:" + permission.badge + " sound:" + permission.sound)
    if (!permission.alert) {
      console.log("Request Permission");
      PushNotificationIOS.requestPermissions();
      PushNotificationIOS.setApplicationIconBadgeNumber(0);
    }
    console.log("PushNotification add listener");
    PushNotificationIOS.addEventListener("notification", this.onNotification);
  },
  onNotification: function(event) {
    // TODO: Need to check whether it is message or not
    // TODO: Need to check if it is intended for logged in user
    var state = AppStateIOS.currentState;
    if (state!='active' && event["_data"]["uri"]){
      this.setState({uri: event["_data"]["uri"]});
    }
    else{
      this.loadTokenIfAny()
        .then((token) => {
          if (token == null) return ;
          this.updateMessageCount(token);
        })
        .done();
    }
  },
  onRegister: function(deviceToken) {
    console.log("DEVICETOKEN" + deviceToken);
    this.saveDeviceToken(deviceToken);
    var request = {
      method: 'post',
      headers:{
        'X-Session': "",
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({"Token": deviceToken}),
    };
    var url = API_DOMAIN + "user/token";
    RestKit.send(url, request, (error, json)=> {console.log(error); console.log(json); });
  },
  updateMessageCount: function(token) {
    var request = {
      method: 'get',
      headers:{ 'X-Session': token }
    };
    var unread_url = API_DOMAIN + "user/unreadmsgs";
    RestKit.send(unread_url, request, this.handleMessageCount);
  },
  handleMessageCount: function(error, json) {
    if (error) {
      console.log("Error loading MsgCount"+error)
      return ;
    }
    if (json) {
      var count = json["Count"];
      console.log("Message Count is " + count);
      if (this.state.messageCount != count) {
        console.log("Update Message Count!")
        this.setState({messageCount: count});
        PushNotificationIOS.setApplicationIconBadgeNumber(count);
      }
    }
  },
  componentDidMount: function() {
    PushNotificationIOS.checkPermissions(this.onCheckPermission);
    PushNotificationIOS.addEventListener("register", this.onRegister);
  },
  componentWillUnmount: function() {
    PushNotificationIOS.removeEventListener('notification', this.onNotification);
    PushNotificationIOS.removeEventListener("register", this.onRegister);
  },
  render: function() {
    return (
      <PlainNavigator
        API_DOMAIN={API_DOMAIN}
        messageCount={this.state.messageCount}
        uri={this.state.uri}
        updateMessageCount={this.updateMessageCount}
        />
    );
  }
});
AppRegistry.registerComponent('plainX', () => body);

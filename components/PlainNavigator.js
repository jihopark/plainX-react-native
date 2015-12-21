'use strict';

var React = require('react-native');
var {
  View,
  Navigator,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBarIOS,
  Platform,
  StyleSheet,
  Image,
  Animated,
} = React;

var Routes = require('./screens/Routes.js');
var Rx = require('rx')
var SideMenu = require('react-native-side-menu');

var PlainSideMenu = require('./PlainSideMenu.js');
var NavigationTextButton = require('./NavigationTextButton.js');
var RestKit = require('react-native-rest-kit');

class PlainNavigator extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      user: null,
      messageBounceValue: new Animated.Value(0),
      shouldBounceCount: true,
      isSideMenuOpen: false,
    };

    this.shouldComponentUpdate = this.shouldComponentUpdate.bind(this);
    this.componentDidUpdate = this.componentDidUpdate.bind(this);
    this.getInitialRouteStack = this.getInitialRouteStack.bind(this);
    this.setNetworkActivityIndicator = this.setNetworkActivityIndicator.bind(this);
    this.updateInfo = this.updateInfo.bind(this);
    this.updateUserInfo = this.updateUserInfo.bind(this);
    this.bounceMessage = this.bounceMessage.bind(this);
    this.setLogoutState = this.setLogoutState.bind(this);
    this.renderScene = this.renderScene.bind(this);
    this.getNavBarRouter = this.getNavBarRouter.bind(this);
    this.leftNavBarButtonSubject = new Rx.Subject();
    this.rightNavBarButtonSubject = new Rx.Subject();
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps["uri"] != this.props.uri) {
      this.shouldRerender = true;
    }
    if (nextProps["messageCount"]>0 && nextProps["messageCount"]!= this.props.messageCount)
      this.setState({shouldBounceCount: true});
    return true;
  }

  componentDidUpdate() {
    if (this.state.shouldBounceCount)
      this.bounceMessage();
  }

  //To Load all necessary screens from the uri
  getInitialRouteStack(uri){
    var initialRoutesStack = [];
    var routes = new Routes(uri);
    var length = routes.getDepth();
    for (var i=0;i<length;i++) {
      initialRoutesStack.push({uri: routes.getUri()});
      routes = routes.getPreviousRoutes();
    }
    return initialRoutesStack.reverse();
  }

  setNetworkActivityIndicator(value) {
    if (Platform.OS === 'ios')
      StatusBarIOS.setNetworkActivityIndicatorVisible(value);
  }

  getNavBarRouter() {
    return {
      Title: (route, navigator, index, navState) => {
        var routes = new Routes(route.uri);
        var screenNameParam = routes.getScreenNameInParamsIfAny();

        return routes.getCurrentRoute().title ?
        (<Text style={[styles.navBarText, styles.navBarTitleText]}>{screenNameParam ? screenNameParam : routes.getCurrentRoute().title}</Text>)
        :
        (<Image style={styles.navBarTitleImage} source={require('image!logo')} />);
      },
      LeftButton: (route, navigator, index, navState) => {
        var routes = new Routes(route.uri);
        if (routes.getDepth() == 1) {
          var button = (
            <Image style={styles.navBarIcon}
              source={require("image!menuicon")} /> );
          return (
            <TouchableOpacity
              onPress={() => navigator.props.leftNavBarButtonSubject.onNext(routes) }
              style={styles.navBarLeftButton}>
              {button}
            </TouchableOpacity>);
        }
        else {
          if (routes.hasBack()) {
            return (
              <TouchableOpacity
                style={styles.navBarLeftButton}
                onPress={() => navigator.pop()}>
                <Image style={styles.navBarIcon}
                  source={require('image!backicon')} />
              </TouchableOpacity>);
          }
        }
        return null;
      },
      RightButton: (route, navigator, index, navState) => {
        var routes = new Routes(route.uri);
        var routeName = routes.getCurrentRoute().name;
        var messageIconScreenBlackList = ["conversations", "conversationRoom", "login", "signup"];
        var shouldNotShowMsgIcon = messageIconScreenBlackList.indexOf(routeName) != -1;
        console.log(navigator.props.messageCount);
        return shouldNotShowMsgIcon ? null :
          (<TouchableOpacity
            style={styles.navBarRightButton}
            onPress={() => navigator.props.rightNavBarButtonSubject.onNext(routes)}>
              <Image style={[styles.navBarIcon, styles.messageIcon]}
                source={require("image!msgicon")} />
              {navigator.props.messageCount > 0 ?
                (<Animated.View style={[styles.messageCountContainer, {transform: [{scale: navigator.props.messageBounceValue}]}]}>
                  <Text style={styles.messageCount}>
                    {navigator.props.messageCount}
                  </Text>
                </Animated.View>) : null}
            </TouchableOpacity>);
      }
    };
  }


  updateInfo(token) {
    var request = {
      method: 'get',
      headers:{ 'X-Session': token, }
    };

    if (!this.state.user){
      console.log("UPDATE USER INFO");
      var url = this.props.API_DOMAIN + "user/me";
      RestKit.send(url, request, this.updateUserInfo);
    }
    this.props.updateMessageCount(token);
  }

  updateUserInfo(error, json) {
    if (error) {
      console.log("Error loading UserInfo")
      console.log(error);
      return ;
    }
    if (json) {
      console.log("Update User info " + json);
      this.setState({user: json});
    }
  }

  bounceMessage() {
    this.state.messageBounceValue.setValue(1.1);
    Animated.spring(
      this.state.messageBounceValue,
      {
        toValue: 0.8,
        friction: 0.5,
      }
    ).start();
    this.setState({shouldBounceCount: false});
  }

  setLogoutState() {
    this.setState({user:null});
  }

  renderScene(route, navigator) {
    var routes = new Routes(route.uri);
    if (this.shouldRerender && this.props.uri != route.uri) {
      this.shouldRerender = false;
      var newRouteStack = this.getInitialRouteStack(this.props.uri);
      navigator.immediatelyResetRouteStack(newRouteStack);
      return ;
    }
    if (routes!= null) {
      if (!navigator.props.sideMenuSubject.hasObservers()) {
        var changeState =
        navigator.props.sideMenuSubject.subscribe(function(event){
          switch (event.type) {
            case "pushScreen":
              navigator.push({uri: routes.addRoute(event.uri)});
              break;
            case "logout":
              navigator.props.setLogoutState();
              break;
          }
        });
      }

      var Screen = routes.getCurrentRoute().getComponent();
      return (
        <View
          style={styles.scene} keyboardShouldPersistTaps={false}>
          <Screen
            //subscribe to these subjects if need to receive left,right button events
            enablePagination={routes.getCurrentRoute().enablePagination}
            leftNavBarButtonSubject={this.leftNavBarButtonSubject}
            rightNavBarButtonSubject={this.rightNavBarButtonSubject}
            routes={routes}
            pushScreen={navigator.push}
            popScreen={navigator.pop}
            replaceScreen={navigator.replace}
            immediatelyResetRouteStack={navigator.immediatelyResetRouteStack}
            api_domain={this.props.API_DOMAIN}
            updateInfo={this.updateInfo}
            setNetworkActivityIndicator={this.setNetworkActivityIndicator}
            params={routes.getCurrentRouteParams()} />
        </View>
      );
    }
    return null;
  }

  render() {
    return (
      <SideMenu
          onChange={(isOpen) => this.setState({isSideMenuOpen: isOpen})}
          menu={
          <PlainSideMenu
            isOpen={this.state.isSideMenuOpen}
            sideMenuSubject={this.props.sideMenuSubject}
            user={this.state.user} />}
            touchToClose={true}>
        <Navigator
          setLogoutState={this.setLogoutState}
          sideMenuSubject={this.props.sideMenuSubject}
          leftNavBarButtonSubject={this.leftNavBarButtonSubject}
          rightNavBarButtonSubject={this.rightNavBarButtonSubject}
          initialRouteStack={this.getInitialRouteStack(this.props.uri)}
          renderScene={this.renderScene}
          messageCount={this.props.messageCount}
          messageBounceValue={this.state.messageBounceValue}
          style={styles.appContainer}
          navigationBar={
            <Navigator.NavigationBar
              style={styles.navBar}
              routeMapper={this.getNavBarRouter()}/>
          }
        />
      </SideMenu>
    );
  }
}

PlainNavigator.defaultProps = {
    sideMenuSubject: new Rx.Subject(),
};

var styles = StyleSheet.create({
  navBar: {
    backgroundColor: 'white',
  },
  navBarText: {
    fontSize: 16,
    marginVertical: 10,
  },
  navBarTitleText: {

  },
  navBarTitleImage: {
    width:59,
    height:25,
    marginVertical: 10,
    padding: 5,
  },
  navBarIcon: {
    width:20,
    height:20,
    resizeMode: 'stretch',
    alignSelf: 'center',
  },
  navBarLeftButton: {
    marginLeft: 10,
    marginTop: 12,
    padding: 3,
  },
  navBarRightButton: {
    marginRight: 10,
    marginTop: 12,
    padding: 3,
  },
  navBarButtonText: {
    color: '#33cc66',
  },
  scene: {
    flex: 1,
    paddingTop: 20,
    backgroundColor: '#EAEAEA', //should change to background image later
  },
  messageIcon: {
    position:'absolute',
    top:-2,
    left: -20,
    width: 30, height: 30
  },
  messageCountContainer: {
    backgroundColor:'#33cc66',
    width:20, height: 20,
    borderRadius: 10,
    overflow: 'hidden',
    justifyContent: 'center',
    flexDirection: 'row',
    position:'absolute',
    top:-2,
    left: -33,
  },
  messageCount: {
    color: 'white',
    textAlign: 'center',
    alignSelf: 'center',
  }
});

module.exports = PlainNavigator;

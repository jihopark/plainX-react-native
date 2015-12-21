'use strict';

var React = require('react-native');

var {
  View,
  StyleSheet,
} = React;

var PlainListView = require('../PlainListView.js');

var BaseScreen = require('./BaseScreen.js');
var ActionButton = require('../ActionButton.js');

class MyOffersScreen extends BaseScreen{
  constructor(props){
    super(props);
    this.endPoint = "user/offers";
    this.onPressMakeOffer = this.onPressMakeOffer.bind(this);
  }

  onPressMakeOffer() {
    this.props.pushScreen({uri: this.props.routes.addRoute('makeOffer?')});
  }

  renderScreen() {
    var cardObservers = { };
    cardObservers["Offer"] = this.offerCardonNext;

    return (
      <View style={this.screenCommonStyle.container}>
        <PlainListView
          cardObservers={cardObservers}
          cards={this.state.data["Cards"]}
          onEndReached={this.loadMore}
          />
        <ActionButton
          text={"ADD NEW OFFER"}
          onPress={this.onPressMakeOffer}
          enabled={true} />
      </View>
    );
  }
}

module.exports = MyOffersScreen;

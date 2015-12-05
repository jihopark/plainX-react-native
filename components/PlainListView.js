'use strict';

var React = require('react-native');
var Rx = require('rx');

var CardRouter = require('./cards/CardRouter.js');
var Divider = require('./Divider.js');

var {
  ListView,
  StyleSheet,
  View,
  PixelRatio,
  Image,
} = React;

var PlainListView = React.createClass({
  displayName: 'PlainListView',
  propType: {
    cards: React.PropTypes.array,
    cardObservers: React.PropTypes.array,
    loadMore: React.PropTypes.func
  },
  nameOfCardsTobeObserved: [],
  needsTobeObserved: function(cardName) {
    if (this.nameOfCardsTobeObserved.length == 0 && this.props.cardObservers
       && this.props.cardObservers.length!=0)
      this.nameOfCardsTobeObserved = Object.keys(this.props.cardObservers);

    for (var i=0, numCards = this.nameOfCardsTobeObserved.length; i<numCards; i++) {
      if (this.nameOfCardsTobeObserved[i] == cardName) return true;
    }
    return false;
  },
  getMarginStyle: function(merged) {
    switch(merged){
      case "":
        return styles.singleCard;
      case "Top":
        return styles.topCard;
      case "Mid":
        return styles.midCard;
      case "Bottom":
        return styles.bottomCard;
    }
  },
  renderCards: function(card) {
    var observer;
    //find if there is cardObserver to pass
    if (this.needsTobeObserved(card["Name"])) {
      observer = this.props.cardObservers[card["Name"]];
    }
    //find which card to render
    var CardComponent = CardRouter.getComponent(card["Name"]);
    if (CardComponent == null)
      return null;

    return (
      <View style={[styles.cardContainer, this.getMarginStyle(card["Merged"])]}>
        <CardComponent
          cardCommonStyles={cardCommonStyles}
          id={card["UUID"]}
          key={card["UUID"]}
          observer={observer}
          data={card["Data"]}/>
        {card["Merged"] == "Top" || card["Merged"] == "Mid" ?
          <Divider margin={styles.mergedCardDivider} /> : null}
      </View>
    );
  },
  render: function() {
    return (
      <View style={styles.listContainer}>
        <ListView
          dataSource={new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2}).cloneWithRows(this.props.cards)}
          renderRow={this.renderCards}
          onEndReached={this.props.onEndReached}
        />
      </View>
    );
  }

});

var styles = StyleSheet.create({
  singleCard: {
    marginTop: 2.5,
    marginBottom: 2.5,
    borderRadius: 2,
    padding: 10,
  },
  midCard:{
    paddingTop: 10,
    borderWidth: 0,
    borderColor: 'transparent',
  },
  topCard:{
    paddingTop: 10,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
    marginTop: 2.5,
    borderBottomColor: 'transparent',
  },
  bottomCard: {
    paddingTop: 10,
    paddingBottom: 10,
    marginBottom: 2.5,
    borderTopColor: 'transparent',
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
  },
  cardContainer: {
    marginLeft: 10,
    marginRight: 10,
    backgroundColor: 'white',
    shadowRadius: 0.3,
    shadowColor: 'grey',
    shadowOffset: {width: 0.5, height: 0.5},
    shadowOpacity: 0.8,
  },
  listContainer: {
    flex:1,
  },
  mergedCardDivider: {
    marginLeft: 16,
    marginRight: 16,
    marginTop: 10,
  },
});

var cardCommonStyles = StyleSheet.create({
  titles: {
    color: '#333333',
    fontSize: 40/2,
    textAlign: 'center',
    //font: 'SF UI Text Regular'
  },
  description: {
    color: '#333333',
    fontSize: 36/2,
    textAlign: 'center',
  },
  headings: {
    color: '#333333',
    fontSize: 36/2,
    fontWeight: 'bold',
    textAlign: 'center',
    //font: 'SF UI Text Semibold'
  },
  currency: {
    color: '#333333',
    fontSize: 40/2,
    marginRight: 10,
    //font: 'SF UI Text Regular'
  },
  finePrint: {
    color: '#333333',
    fontSize: 30/2,
  },
  inputAmountText:{
    fontSize: 60/2,
    textAlign: 'center',
    color: '#33cc66',
    //font: 'SF UI Text Regular'
  },
  urgentText: {
    fontSize: 30/2,
    color: '#006633',
    //font: 'SF UI Text Bold'
  },
  triangleIconStyle: {
    width: 11,
    height: 5.5,
    resizeMode: 'stretch',
    alignSelf: 'center',
  },
  offerTitle:{
    fontSize: 15,
    textAlign: 'center',
  },
  offerOptions:{
    fontSize: 18,
    fontWeight: 'bold',
    color: "#333",
  },
});

module.exports = PlainListView;

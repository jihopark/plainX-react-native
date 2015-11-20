'use strict';

var React = require('react-native');
var update = require('react-addons-update');

//This mixin is to define common functions for Screen Components.

var ScreenMixin =  {
  propTypes: {
    leftNavBarButton: React.PropTypes.object.isRequired,
    rightNavBarButton: React.PropTypes.object.isRequired,
    routes: React.PropTypes.object.isRequired,
    pushScreen: React.PropTypes.func.isRequired,
  },
  setCardDataState: function(id, key, value) {
    var cards = this.state.data["Cards"];
    for (var i=0, numCards = cards.length ; i<numCards; i++) {
      if (cards[i]["UUID"] == id) {
        this.setState({data: update(this.state.data, {"Cards": {[i]: {"Data": {[key]: {$set: value}}}}})});
      }
    }
  },
  getCardDataState: function(id) {
    var cards = this.state.data["Cards"];
    for (var i=0, numCards = cards.length ; i<numCards; i++) {
      if (cards[i]["UUID"] == id) {
        return cards[i]["UUID"];
      }
    }
  },
  componentDidMount: function() {
    this.fetchData();
  },
  fetchData: function() {
    if (this.endPoint){
      console.log(this.props.api_domain + this.endPoint + "?" + this.props.params);
      fetch(this.props.api_domain + this.endPoint + "?" + this.props.params)
        .then((response) => response.json())
          .then((responseData) => {
            console.log(responseData);
            this.setState({
              data: responseData,
            });
          })
          .done();
    }
  },
  getParamsToString: function(params) {
    var s = "";
    var keys = Object.keys(params);
    for (var i=0, length = keys.length ; i<length; i++)
      s += (keys[i] + "=" + params[keys[i]] + "&");
    return s;
  }
};

module.exports = ScreenMixin;

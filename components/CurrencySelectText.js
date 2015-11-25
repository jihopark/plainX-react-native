'use strict';

var React = require('react-native');

var {
  Text,
  StyleSheet,
} = React;

var CurrencySelectText = React.createClass({
  render: function() {
    return (
      <Text style={styles.currencySelectText}>
        {this.props.text}
      </Text>
    );
  }
});

var styles = StyleSheet.create({
  currencySelectText: {
    width: 80,
    padding: 5,
    fontSize: 60/3,
    textAlign: 'center',
    color: '#33cc66',
    borderWidth: 1,
    borderColor: '#33cc66',
    borderRadius: 2,
    //font: 'SF UI Text Light'
  },
});

module.exports = CurrencySelectText;

'use strict';

var React = require('react-native');
var Rx = require('rx')

var {
  Text,
  View,
  Image,
  StyleSheet,
} = React;

var CurrencyAmount = React.createClass({
  displayName: "CurrencyAmountCard",
  render: function() {
    return (
      <View style={styles.container}>
        <View style={styles.sideContainer}>
          <Text style={[this.props.cardCommonStyles.currency, styles.leftCurrency]}>
            {this.props.data["Sell"]+"\n"+this.props.data["AmountSell"]}</Text>
        </View>
        <View style={styles.centerContainer}>
          <Image style={styles.center} source={require('../../assets/plane.png')}/>
        </View>
        <View style={styles.sideContainer}>
          <Text style={[this.props.cardCommonStyles.currency, styles.rightCurrency]}>
            {this.props.data["Buy"]+"\n"+this.props.data["AmountBuy"]}</Text>
        </View>
      </View>
    );
  }
});

var styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    height: 40,
  },
  centerContainer: {
    flex: 2,
    flexDirection:'column',
    justifyContent:'center',
    alignItems: 'center',
    marginLeft: 5,
    marginRight: 5,

  },
  center: {
    marginTop: 3,
    width: 40,
    height: 24,
    resizeMode: 'stretch',
    alignSelf: 'center',
  },
  sideContainer: {
    flex: 4,
    justifyContent: 'center',
    flexDirection:'column',
  },
  leftCurrency: {
    textAlign: 'right',
    marginLeft: 0, marginRight: 0,
  },
  rightCurrency: {
    textAlign: 'left',
    marginLeft: 0, marginRight: 0,
  },
});


module.exports = CurrencyAmount;

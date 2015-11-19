'use strict';

var React = require('react-native');

var {
  View,
  StyleSheet,
  Platform,
} = React;

var PlainListView = require('../PlainListView.js');
var ScreenMixin = require('./componentMixins/ScreenMixin.js');
var CurrencyPickerMixin = require('./componentMixins/CurrencyPickerMixin.js');
var CurrencyAmountSelectCardMixin = require('./cardMixins/CurrencyAmountSelectCardMixin.js');
var LocationSelectCardMixin = require('./cardMixins/LocationSelectCardMixin.js');
var ExpiryDateSelectCardMixin = require('./cardMixins/ExpiryDateSelectCardMixin.js');
var OfferCardMixin = require('./cardMixins/OfferCardMixin.js');
var CurrencyPicker = (Platform.OS === 'ios') ? require('../CurrencyPicker.ios.js') : require('../CurrencyPicker.android.js');

var OffersScreen = React.createClass({
  mixins: [ScreenMixin, CurrencyPickerMixin, CurrencyAmountSelectCardMixin, ExpiryDateSelectCardMixin, LocationSelectCardMixin, OfferCardMixin],
  displayName: "OffersScreen",
  getInitialState: function() {
    return {
      showCurrencyPicker: false,
      currencyList: [],
      targetInput: null,
      currencySelectId: null,
      currentCurrency: null,
      data: {
        "Cards": [
          {
            "Name": "CurrencyAmountSelect",
            "UUID": 5,
            "Data": {
              "TitleText": "Step 1: How much do you wish to exchange?",
              "DescriptionText": "",
              "Sell":"USD",
              "Buy":"HKD",
              "AmountSell": "0",
              "AmountBuy": "0",
              "CurrencyList":[{"Country":"Afghanistan","Code":"AFN"},{"Country":"China","Code":"CNY"},{"Country":"Hong Kong","Code":"HKD"},{"Country":"United States","Code":"USD"}]
            }
          },
          {
            "Name": "LocationSelect",
            "UUID": 2,
            "Data": {
              "TitleText": "Step 2: Set your location",
              "DescriptionText": "Check all the loactions that you are willing to trade your currency at",
              "Locations":
                {
                  "HKUST":{"Selected":true},
                  "HKU":{"Selected":false},
                  "CUHK":{"Selected":false},
                  "POLYU":{"Selected":false},
                  "CITYU":{"Selected":false},
                  "BU":{"Selected":false}
                }
            }
          },
          {
            "Name": "ExpiryDateSelect",
            "UUID": 1,
            "Data": {
              "TitleText": "Step 3: Set the expiry date",
              "DescriptionText": "Your offer will be removed from the system after this date",
              "Date": "2015-11-18"
            }
          },
          {
            "UUID":"h2sn8fg8q4269VMRbninm6",
            "Name":"CurrencyAmount",
            "Data": {
              "AmountSell":500,
              "AmountBuy":600,
              "Sell":"HKD",
              "Buy":"CNY"
            }
          },
          {
            "UUID":"6MhrVHvTZ7pWG9XRgmQiRB",
            "Name":"Location",
            "Data":{
              "TitleText": "Here are the available locations",
              "Locations":
                {
                  "HKUST":{"Name":"HKUST"},
                  "HKU":{"Name":"HKU"},
                }
            }
          },
          {
            "UUID":"6MhrVH7pWG9XRgmQiRB",
            "Name":"OfferSummary",
            "Data":{
              "TitleText": "Offer Summary",
              "Details": "Blah Blah Blah \n asdfasdfdsfasdf heyhehy"
            }
          }
        ]
      }
    };
  },
  fetchData: function() {

  },
  render: function() {
    if (this.state.data) {
      var cardObservers = { };
      cardObservers["Offer"] = this.offerCardonNext;
      cardObservers["CurrencyAmountSelect"] = this.currencyAmountSelectCardOnNext;
      cardObservers["ExpiryDateSelect"] = this.expiryDateSelectCardonNext;
      cardObservers["LocationSelect"] = this.locationSelectonNext;

      var listView = (<PlainListView
        cardObservers={cardObservers}
        cards={this.state.data["Cards"]}/>);

      if (this.state.showCurrencyPicker) {
        var currencyPicker = (
          <CurrencyPicker
            currentCurrency={this.state.currentCurrency}
            currencyList={this.state.currencyList}
            onPickerValueChange={this.onPickerValueChange}
            dismissPicker={this.dismissPicker} />);

        return (
          <View style={styles.container}>
            {listView}
            {currencyPicker}
          </View>
        );
      }
      return (
        <View style={styles.container}>
          {listView}
        </View>
      );
    }
  }
});

var styles = StyleSheet.create({
  container: {
    paddingTop: 50,
  }
});



module.exports = OffersScreen;

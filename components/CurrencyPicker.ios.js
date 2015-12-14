'use strict';

var React = require('react-native');
var {
  PickerIOS,
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Image,
} = React;

var PickerItemIOS = PickerIOS.Item;

var CurrencyPicker = React.createClass({
  render: function() {
    return (
      <View style={styles.container}>
        <View style={styles.pickerContainer}>
          <PickerIOS
            style={{width: 320}}
            onValueChange={(value) => this.props.onPickerValueChange(value)}
            selectedValue={this.props.currentCurrency}>
              {
                this.props.currencyList.map(function(currency){
                  return (
                    <PickerItemIOS
                      key={currency["Code"]}
                      value={currency["Code"]}
                      label={currency["Code"] + " - " + currency["Country"]} />)
              }
            )}
            </PickerIOS>
        </View>
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={this.props.dismissPicker}>
            <Image source={require('image!cross')}
                    style={styles.icon}/>
            <Text style={styles.text} >Close</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={this.props.onPick}>
            <Image source={require('image!checkmark')}
                    style={styles.icon}/>
            <Text style={styles.text} >Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  },
});

var styles = StyleSheet.create({
  container: {
    marginTop: 10,
    flexDirection: 'column',
  },
  pickerContainer: {
    flex: 9,
    backgroundColor: 'transparent',
    alignSelf:'center',
  },
  buttonsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  button:{
    flexDirection:'row',
    alignItems: 'center',
  },
  icons: {
    width:14,
    height: 14,
  },
  text: {
    fontSize: 15,
    color: '#33cc66',
    fontWeight: 'bold',
  },
});

module.exports = CurrencyPicker;

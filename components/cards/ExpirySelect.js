'use strict';

var React = require('react-native');
var PlainActions = require('../../actions/PlainActions.js');

var {
  View,
  Text,
  Platform,
  Image,
  DatePickerIOS,
  StyleSheet,
  TouchableOpacity,
  NativeModules,
} = React;

var Divider = require('../Divider.js');
var moment = require('moment');

var DateFormat = React.createClass({
  displayName: "DateFormat",
  render: function() {
    var triangle = require('../../assets/triangle.png');
    return (
      <View style={styles.dateformatContainer}>
        <Image source={require('../../assets/calendar.png')}
          style={styles.calendarIcon} />
        <View style={[{width: 45}, styles.textContainer]}>
          <Text style={styles.dateformatText}>{(this.props.date.getMonth()+1)}</Text>
          <View style={{height:1, flex:1, backgroundColor: '#33cc66'}} />
        </View>
        <Image style={[this.props.triangleIconStyle, {marginRight: 5}]} source={triangle} />

        <View style={[{width: 45}, styles.textContainer]}>
          <Text style={styles.dateformatText}>{this.props.date.getDate()}</Text>
          <View style={{height:1, flex:1, backgroundColor: '#33cc66'}} />
        </View>
        <Image style={[this.props.triangleIconStyle, {marginRight: 5}]} source={triangle} />

        <View style={[{width: 90}, styles.textContainer]}>
          <Text style={styles.dateformatText}>{this.props.date.getFullYear()}</Text>
          <View style={{height:1, flex:1, backgroundColor: '#33cc66'}} />
        </View>
        <Image style={[this.props.triangleIconStyle, {marginRight: 5}]} source={triangle} />
      </View>
    );
  }
});

var styles = StyleSheet.create({
  dateformatContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  textContainer: {
    flexDirection: 'column',
  },
  dateformatText: {
    color: '#33cc66',
    fontSize: 60/2,
    textAlign: 'center',
  },
  calendarIcon: {
    width: 30,
    height: 30,
    marginRight: 5,
  },
  doneButtonIcon: {
    width:14,
    height: 14,
  },
  doneButtonText: {
    fontSize: 15,
    color: '#33cc66',
    fontWeight: 'bold',
  },
});

var ExpirySelect = React.createClass({
  displayName: "ExpirySelect",
  getInitialState: function() {
    return {
      isDatePickerShown: false
    };
  },
  showDatePicker: function() {
    if (Platform.OS == 'ios')
      this.setState({isDatePickerShown: true});
    else {
      var ms = this.props.data["Expiry"]*1000;
      NativeModules.DateAndroid.showDatepickerWithInitialDateInMilliseconds(
        ms.toString(),
        function() {}, //error callback
        this.onDateChangeAndroid //success callback
      );
    }
  },
  closeDatePicker: function() {
    this.setState({isDatePickerShown: false});
  },
  onDateChangeAndroid: function(year, month, day){
    var selectedDate = new Date(year, month, day);
    this.onDateChange(selectedDate);
  },
  onDateChange: function(selectedDate){
    if (selectedDate >= new Date()) { //No past dates
      PlainActions.updateCardData(this.props.id, "Expiry", selectedDate.getTime()/1000);
    }
  },
  render: function() {
    var id = this.props.id;
    var date = new Date(this.props.data["Expiry"]*1000);

    var datePicker = (
      <View style={{alignItems:'center', flexDirection:'column'}}>
        { Platform.OS === 'ios' ?
          (<DatePickerIOS
              style={{backgroundColor: 'transparent'}}
              date={date}
              mode="date"
              onDateChange={this.onDateChange}
            />)
            :
            null
        }
        <TouchableOpacity style={{alignSelf: 'flex-end', flexDirection: 'row', marginRight: 10,}} onPress={this.closeDatePicker}>
          <Image source={require('../../assets/checkmark.png')}
                  style={styles.doneButtonIcon}/>
          <Text style={styles.doneButtonText}>Close</Text>
        </TouchableOpacity>
      </View>
    );
    return (
      <View>
        <Text style={[this.props.cardCommonStyles.titles, {marginBottom: 5}]}>
          {this.props.data["TitleText"]}</Text>
        <Divider />
        <TouchableOpacity style={{flexDirection:'column', alignItems:'center'}} onPress={this.showDatePicker}>
          <DateFormat
            triangleIconStyle={this.props.cardCommonStyles.triangleIconStyle}
            date={date} />
        </TouchableOpacity>
        {this.state.isDatePickerShown ? datePicker : null}
        <Text style={this.props.cardCommonStyles.description}>
          {this.props.data["DescriptionText"]}</Text>
      </View>
    );
  }
});

module.exports = ExpirySelect;

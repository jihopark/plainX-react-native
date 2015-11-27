'use strict';

var React = require('react-native');
var Rx = require('rx');

var {
  View,
  Text,
  Platform,
  Image,
  DatePickerIOS,
  StyleSheet,
  TouchableOpacity,
} = React;

var Divider = require('../Divider.js');

var DateFormat = React.createClass({
  displayName: "DateFormat",
  render: function() {
    var triangle = require('../../assets/triangle.png');
    return (
      <View style={styles.dateformatContainer}>
        <View style={[{width: 25}, styles.textContainer]}>
          <Text style={styles.dateformatText}>{this.props.date.getDate()}</Text>
          <View style={{height:1, flex:1, backgroundColor: '#33cc66'}} />
        </View>
        <Image style={styles.triangle} source={triangle} />

        <View style={[{width: 25}, styles.textContainer]}>
          <Text style={styles.dateformatText}>{(this.props.date.getMonth()+1)}</Text>
          <View style={{height:1, flex:1, backgroundColor: '#33cc66'}} />
        </View>
        <Image style={styles.triangle} source={triangle} />

        <View style={[{width: 50}, styles.textContainer]}>
          <Text style={styles.dateformatText}>{this.props.date.getFullYear()}</Text>
          <View style={{height:1, flex:1, backgroundColor: '#33cc66'}} />
        </View>
        <Image style={styles.triangle} source={triangle} />
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
    fontSize: 60/3,
    textAlign: 'center',
  },
  triangle: {
    width: 11,
    height: 5.5,
    resizeMode: 'stretch',
    alignSelf: 'center',
    marginRight: 5,
  },
});

var ExpiryDateSelect = React.createClass({
  displayName: "ExpiryDateSelectCard",
  getInitialState: function() {
    return {
      isDatePickerShown: false
    };
  },
  showDatePicker: function() {
    this.setState({isDatePickerShown: true});
  },
  closeDatePicker: function() {
    this.setState({isDatePickerShown: false});
  },
  render: function() {
    var subject = new Rx.Subject();
    if (this.props.observer) {
      subject.subscribe(this.props.observer);
    }
    var next = {"id": this.props.id};
    var date = new Date(this.props.data["Date"]);

    var datePicker = Platform.OS === 'ios' ?
     (
      <View style={{alignItems:'center', flexDirection:'column'}}>
        <DatePickerIOS
            style={{backgroundColor: 'transparent'}}
            date={date}
            mode="date"
            onDateChange={function(selectedDate){
              if (selectedDate >= new Date()) { //No past dates
                next["Date"] = selectedDate.getTime();
                subject.onNext(next);
              }
            }}
          />
        <TouchableOpacity style={{alignSelf: 'flex-end'}} onPress={this.closeDatePicker}>
          <Text>Close</Text>
        </TouchableOpacity>
      </View>
    ) :
    null; //for android

    return (
      <View>
        <Text style={[this.props.cardCommonStyles.titles, {marginBottom: 5}]}>
          {this.props.data["TitleText"]}</Text>
        <Divider />
        <TouchableOpacity style={{flexDirection:'column', alignItems:'center'}} onPress={this.showDatePicker}>
          <DateFormat date={date} />
        </TouchableOpacity>
        {this.state.isDatePickerShown ? datePicker : null}
        <Text style={this.props.cardCommonStyles.description}>
          {this.props.data["DescriptionText"]}</Text>
      </View>
    );
  }
});

module.exports = ExpiryDateSelect;

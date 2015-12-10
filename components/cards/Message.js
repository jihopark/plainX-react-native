'use strict';

var React = require('react-native');
var Rx = require('rx')

var DateMixin = require('../screens/componentMixins/DateMixin.js');

var {
  Text,
  View,
  StyleSheet,
} = React;

var Message = React.createClass({
  displayName: "MessageCard",
  mixins: [DateMixin],
  render: function() {
    var isMessage = this.props.data["Type"] == 'message';
    var isSelf = this.props.data["IsSelf"];
    return (
      <View style={styles.container}>
        {isMessage ?
          (<View style={[{flexDirection:'column'}, (isSelf ? styles.rightContainer : styles.leftContainer)]}>
            <Text style={[styles.messageText,
                (isSelf ?
                  styles.selfText : styles.otherText)]}>
              {this.props.data["Text"]}
            </Text>
            <Text style={[styles.dateText, (isSelf ? styles.rightContainer : styles.leftContainer)]}>
              {this.getMessageTimestampFormat(this.props.data["Created"])}
            </Text>
          </View>)
        : null}

      </View>
    );
  }
});

var styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    marginTop: 5,
    marginBottom: 5,
  },
  rightContainer:{
    alignItems:'flex-end',
    alignSelf: 'flex-end',
    marginRight: 10,
  },
  leftContainer: {
    alignItems:'flex-start',
    alignSelf: 'flex-start',
    marginLeft: 10,
  },
  centerContainer: {
    alignSelf: 'center',
  },
  selfText: {
    backgroundColor:'#33cc66',
  },
  otherText: {
    backgroundColor:'#2a6033',
  },
  messageText: {
    color: 'white',
    fontSize: 16,
    paddingTop: 10, paddingBottom: 10,
    paddingLeft: 15, paddingRight: 15,
    borderRadius: 20,
    overflow: 'hidden',
    marginLeft: 5,
    marginRight: 5,
  },
  dateText: {
    color: '#333',
    fontSize: 10,
    marginLeft: 10,
    marginRight: 10,
  },
  userIcon:{
    width: 50,
    height: 50,
    alignSelf: 'center'
  },
});


module.exports = Message;

var alt = require('../alt');
var PlainActions = require('../actions/PlainActions.js');

var PlainLog = require('../PlainLog.js');
var P = new PlainLog("PlainDataStore");

function mergeArrayToMap(array, map){
  for (var i=0, l=array.length ;i<l; i++) {
    if (array[i]["Id"])
      map[array[i]["Id"]] = array[i];
    else if (array[i]["UUID"])
      map[array[i]["UUID"]] = array[i];
  }
  return map;
}

function removeArrayFromMap(array, map){
  for (var i=0, l=array.length ;i<l; i++) {
    if (array[i]["Id"] && map[array[i]["Id"]])
      delete map[array[i]["Id"]];
    else if (array[i]["UUID"] && map[array[i]["UUID"]])
      delete map[array[i]["UUID"]];
  }
  return map;
}

class PlainDataStore {
  constructor() {
    this.offers = {};
    this.cards = {};
    this.conversations = {};

    this.bindActions(PlainActions);
  }

  onUpdateScreenData(data){
    if (data["offers"]) {
      mergeArrayToMap(data["offers"], this.offers);
    }
    if (data["conversations"]){
      mergeArrayToMap(data["conversations"], this.conversations);
    }
    if (data["cards"]) {
      mergeArrayToMap(data["cards"], this.cards);
    }
    P.log("onUpdateScreenData", "#Cards:" + Object.keys(this.cards).length + " #Offers:" + Object.keys(this.offers).length + " #Conversations:" +Object.keys(this.conversations).length);
  }

  onUpdateCards(cards) {
    mergeArrayToMap(cards, this.cards);
  }

  onRemoveCards(cards) {
    if (cards && cards.length > 0) {
      removeArrayFromMap(cards, this.cards);
      P.log("onRemoveCards", "#Cards:" + Object.keys(this.cards).length + " #Offers:" + Object.keys(this.offers).length + " #Conversations:" +Object.keys(this.conversations).length);
    }
  }

  onUpdateOffer(offer) {
    this.offers[offer["Id"]] = offer;
  }

  onRemoveOffer(offerId) {
    if (this.offers[offerId])
      delete this.offers[offerId];
  }

  onUpdateConversations(conversations) {
    mergeArrayToMap(conversations, this.conversations);
  }

  removeConversations(conversations) {
    if (conversations && conversations.length > 0) {
      removeArrayFromMap(conversations, this.conversations);
      P.log("removeConversations", "#Cards:" + Object.keys(this.cards).length + " #Offers:" + Object.keys(this.offers).length + " #Conversations:" +Object.keys(this.conversations).length);
    }
  }
}

module.exports = alt.createStore(PlainDataStore, 'PlainDataStore');

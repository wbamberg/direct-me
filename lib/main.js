const notifications = require("notifications");
const geolocation = require("./geolocation");

var myLocation = [49.27232590000001, -123.0701292];
var selectionText = "";

var map = require("panel").Panel({
  width: 770,
  height: 770,
  contentURL: require("self").data.url("map.html")
});

map.on("hide", function() {
  map.port.emit("reset");
});

map.port.on("lookup-failure", function() {
  map.port.emit("reset");
  notifications.notify({text: "Couldn't recognize destination address"});
});

map.port.on("routing-failure", function() {
  map.port.emit("reset");
  notifications.notify({text: "Couldn't find a route to destination address"});
});

map.port.on("ready", function() {
  map.show();
});

var contextMenu = require("context-menu");

var menuItem = contextMenu.Item({
  label: "Direct Me!",
  context: contextMenu.SelectionContext(),
  contentScript: 'self.on("click", function () {' +
                 '  var text = window.getSelection().toString();' +
                 '  self.postMessage(text);' +
                 '});',
  onMessage: function (selection) {
    selectionText = selection.replace(/[\r\n]+/g, ' ');
    getLocationAndCreateMap();
  }
});

function getLocationAndCreateMap() {
  geolocation.getCurrentPosition(function(position) {
    if (position == geolocation.userDenied) {
      notifications.notify({title: "The user denied access to geolocation."});
    }
    else {
      map.port.emit("make-map", [[position.coords.latitude, position.coords.longitude], selectionText]);
    }
  });
}


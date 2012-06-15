
addon.port.on("make-map", makeMap);

addon.port.on("reset", resetMap);

function resetMap() {
  if (window.map) {
    window.map.dispose();
  }
}

function makeMap(startAndEnd) {
  resetMap();
  var start = startAndEnd[0];
  var endAddress = startAndEnd[1];

  $.ajax({
    url: 'http://open.mapquestapi.com/nominatim/v1/search',
    dataType: 'json',
    async: false,
    crossDomain: true,
    data: {
      q: endAddress,
      format: 'json'
    },

    success: function(data, textStatus, jqXHR) {
      if (data[0]) {
        var end = [];
        end.push(data[0].lat);
        end.push(data[0].lon);
        getMap(start, end);
      }
      else {
        addon.port.emit("lookup-failure");
      }
    }

  });
}

function addRouteCallback(param) {
  if (param.route.locations.length > 0) {
    addon.port.emit("ready", param.route);
  }
  else {
    addon.port.emit("routing-failure");
  }
}

function getMap(start, end) {

  var options={
    elt:document.getElementById('map'),
    zoom:13,
    latLng:{lat:start[0], lng:start[1]},
    mtype:'osm'
  };

  window.map = new MQA.TileMap(options);

  MQA.withModule('directions', function() {
    map.addRoute([
      {latLng: {lat:start[0], lng:start[1]}},
      {latLng: {lat:end[0], lng:end[1]}}
    ], [], addRouteCallback);
  });

  MQA.withModule('largezoom', function() {
    map.addControl(
      new MQA.LargeZoom(),
      new MQA.MapCornerPlacement(MQA.MapCorner.TOP_LEFT, new MQA.Size(5,5))
    );

  });
}


var map, insetMap;
var places = require('./places.js');
var tripDate = require('./dateConverter.js');
var dayNum = tripDate.number;

var circlePath;
var lineSymbol = {
  // path: 'M 0,-2.5 0,2.5', // dashed path
  path: 'M -.5,-.5 .5,-.5, .5,.5 -.5,.5', // dotted path
  strokeOpacity: 0.7,
  scale: 1
};
var lineSymbol_arrow;
var geodesicPoly_map, geodesicPoly_inset;
var offset = 0;

var markers = [];
var markers_okinawa = [];
var markers_takamatsu_islands = [];
var markers_nara = [];
var markers_hiroshima = [];

var tripPath = [];

var original_bounds, takamatsu_bounds, hiroshima_bounds, okinawa_bounds, kansai_bounds;
var gotOriginalBounds = false;



window.initMap = function() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: 35.279295927636994, lng: 136.10520967187495},
    zoom: 6,
    noClear: true,
    disableDefaultUI: true,
    styles: [{"featureType":"landscape","stylers":[{"saturation":-100},{"lightness":65},{"visibility":"on"}]},{"featureType":"poi","stylers":[{"saturation":-100},{"lightness":51},{"visibility":"simplified"}]},{"featureType":"road.highway","stylers":[{"saturation":-100},{"visibility":"simplified"}]},{"featureType":"road.arterial","stylers":[{"saturation":-100},{"lightness":30},{"visibility":"on"}]},{"featureType":"road.local","stylers":[{"saturation":-100},{"lightness":40},{"visibility":"on"}]},{"featureType":"transit","stylers":[{"saturation":-100},{"visibility":"simplified"}]},{"featureType":"administrative.province","stylers":[{"visibility":"off"}]},{"featureType":"water","elementType":"labels","stylers":[{"visibility":"on"},{"lightness":-25},{"saturation":-100}]},{"featureType":"water","elementType":"geometry","stylers":[{"hue":"#ffff00"},{"lightness":-25},{"saturation":-97}]}]

  });

  map.addListener('idle', function () {
    if (gotOriginalBounds == false) {
      original_bounds = map.getBounds();
      gotOriginalBounds = true;
    }
  });

  insetMap = new google.maps.Map(document.getElementById('insetMap'), {
    center: {lat: 24.340661000000008, lng: 124.02923722656246},
    zoom: 9,
    disableDefaultUI: true,
    styles: [{"featureType":"landscape","stylers":[{"saturation":-100},{"lightness":65},{"visibility":"on"}]},{"featureType":"poi","stylers":[{"saturation":-100},{"lightness":51},{"visibility":"simplified"}]},{"featureType":"road.highway","stylers":[{"saturation":-100},{"visibility":"simplified"}]},{"featureType":"road.arterial","stylers":[{"saturation":-100},{"lightness":30},{"visibility":"on"}]},{"featureType":"road.local","stylers":[{"saturation":-100},{"lightness":40},{"visibility":"on"}]},{"featureType":"transit","stylers":[{"saturation":-100},{"visibility":"simplified"}]},{"featureType":"administrative.province","stylers":[{"visibility":"off"}]},{"featureType":"water","elementType":"labels","stylers":[{"visibility":"on"},{"lightness":-25},{"saturation":-100}]},{"featureType":"water","elementType":"geometry","stylers":[{"hue":"#ffff00"},{"lightness":-25},{"saturation":-97}]}]
  });

  // needs to be defined in initMap()
  circlePath = google.maps.SymbolPath.CIRCLE;
  lineSymbol_arrow = {
            path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
            strokeColor: '#991e40',
            fillColor: '#991e40',
            fillOpacity: 1,
            strokeOpacity: 1,
            strokeWeight: 1.5,
            anchor:  new google.maps.Point(0, -3) // offseting the arrowhead so it doesn't get so obscured by the marker
          };
  // for platting the path on the main map.
  geodesicPoly_map = new google.maps.Polyline({
    strokeOpacity: 0.0,
    geodesic: true,
    icons: [{
      icon: lineSymbol,
      repeat: '10px'
    }, {
      icon: lineSymbol_arrow,
      offset: '100%'
    }],
    map: map
  });


  // for plotting the path in the inset map.
  geodesicPoly_inset = new google.maps.Polyline({
    //  strokeColor: '#545454',
    strokeOpacity: 0.0,
    //  strokeWeight: 3,
    geodesic: true,
    icons: [{
      icon: lineSymbol,
      offset: '0',
      repeat: '5px'
    }, {
      icon: lineSymbol_arrow,
      offset: '100%'
    }],
    map: insetMap
  });

  takamatsu_bounds = new google.maps.LatLngBounds();
  hiroshima_bounds = new google.maps.LatLngBounds();
  kansai_bounds = new google.maps.LatLngBounds();
  okinawa_bounds = new google.maps.LatLngBounds();

  addPlaces();
}

function plotMarker(key) {
  var circleImage = {
      url: 'public/img/Ellipse.png',
      size: new google.maps.Size(20, 20),
      origin: new google.maps.Point(0, 0),
      anchor: new google.maps.Point(10, 10)
    };

  var selectedCircle = {
    url: 'public/img/selectedCircle.png',
    // size: new google.maps.Size(20, 20),
    origin: new google.maps.Point(0, 0),
    anchor: new google.maps.Point(10, 10)

  }

  var marker = new google.maps.Marker({
    position: new google.maps.LatLng(places.places[key].coordinates[0], places.places[key].coordinates[1]),
    icon: circleImage,
    map: map
  });

  switch(places.places[key].description) {
    case 'Takamatsu':
    case 'Seto Inland': {
      markers_takamatsu_islands.push(marker);
      takamatsu_bounds.extend(marker.getPosition());
      break;
    }
    case 'Okinawa': {
      markers_okinawa.push(marker);
      okinawa_bounds.extend(marker.getPosition());
      marker = new google.maps.Marker({
        position: new google.maps.LatLng(places.places[key].coordinates[0], places.places[key].coordinates[1]),
        icon: circleImage,
        map: insetMap
      });
      break;
    }
    case 'Hiroshima': {
      markers_hiroshima.push(marker);
      hiroshima_bounds.extend(marker.getPosition());
      break;
    }
    case 'Kansai':
    {
      kansai_bounds.extend(marker.getPosition());
      break;
    }
    case 'Nara': {
      markers_nara.push(marker);
      kansai_bounds.extend(marker.getPosition());
      break;
    }
  }

}

function makeClusters() {
  var clusterStyle = {
      styles: [{
        url: 'public/img/Ellipse.png',
        height: 20,
        width: 20,
      }],
      minimumClusterSize: 2,
      gridSize: 15,
      averageCenter: false,
      imagePath: 'public/img'
  };

  var markerCluster_takamatsu = new MarkerClusterer(map, markers_takamatsu_islands, clusterStyle);
  var markerCluster_okinawa = new MarkerClusterer(map, markers_okinawa, clusterStyle);
  var MarkerCluster_nara = new MarkerClusterer(map, markers_nara, clusterStyle);
  var MarkerCluster_hiroshima = new MarkerClusterer(map, markers_hiroshima, clusterStyle);

}

function addPlaces() {
  Object.keys(places.places).forEach(plotMarker);
  makeClusters();
  showPath();
}


var path = [];
function showPath() {

  path.push([
    {lat: places.places['Seattle'].coordinates[0], lng: places.places['Seattle'].coordinates[1]},
    {lat: places.places['Tokyo'].coordinates[0], lng: places.places['Tokyo'].coordinates[1]}
  ]);

  path.push([
    {lat: places.places['Tokyo'].coordinates[0], lng: places.places['Tokyo'].coordinates[1]},
    {lat: places.places['Tokyo'].coordinates[0], lng: places.places['Tokyo'].coordinates[1]}
  ]);

  path.push([
    {lat: places.places['Tokyo'].coordinates[0], lng: places.places['Tokyo'].coordinates[1]},
    {lat: places.places['Takamatsu'].coordinates[0], lng: places.places['Takamatsu'].coordinates[1]}
  ]);

  path.push([
    {lat: places.places['Takamatsu'].coordinates[0], lng: places.places['Takamatsu'].coordinates[1]},
    {lat: places.places['Naoshima'].coordinates[0], lng: places.places['Naoshima'].coordinates[1]}
  ]);

  path.push([
    {lat: places.places['Takamatsu'].coordinates[0], lng: places.places['Takamatsu'].coordinates[1]},
    {lat: places.places['Teshima'].coordinates[0], lng: places.places['Teshima'].coordinates[1]}
  ]);

  path.push([
    {lat: places.places['Takamatsu'].coordinates[0], lng: places.places['Takamatsu'].coordinates[1]},
    {lat: places.places['Matsuyama'].coordinates[0], lng: places.places['Matsuyama'].coordinates[1]}
  ]);

  path.push([
    {lat: places.places['Matsuyama'].coordinates[0], lng: places.places['Matsuyama'].coordinates[1]},
    {lat: places.places['Hiroshima'].coordinates[0], lng: places.places['Hiroshima'].coordinates[1]}
  ]);

  path.push([
    {lat: places.places['Hiroshima'].coordinates[0], lng: places.places['Hiroshima'].coordinates[1]},
    {lat: places.places['Miyajima'].coordinates[0], lng: places.places['Miyajima'].coordinates[1]}
  ]);

  path.push([
    {lat: places.places['Hiroshima'].coordinates[0], lng: places.places['Hiroshima'].coordinates[1]},
    {lat: places.places['Osaka'].coordinates[0], lng: places.places['Osaka'].coordinates[1]}
  ]);

  path.push([
    {lat: places.places['Osaka'].coordinates[0], lng: places.places['Osaka'].coordinates[1]},
    {lat: places.places['Ishigaki'].coordinates[0], lng: places.places['Ishigaki'].coordinates[1]}
  ]);

  path.push([
    {lat: places.places['Ishigaki'].coordinates[0], lng: places.places['Ishigaki'].coordinates[1]},
    {lat: places.places['Ishigaki'].coordinates[0], lng: places.places['Ishigaki'].coordinates[1]}
  ]);

  path.push([
    {lat: places.places['Ishigaki'].coordinates[0], lng: places.places['Ishigaki'].coordinates[1]},
    {lat: places.places['Taketomi Island'].coordinates[0], lng: places.places['Taketomi Island'].coordinates[1]}
  ]);

  path.push([
    {lat: places.places['Ishigaki'].coordinates[0], lng: places.places['Ishigaki'].coordinates[1]},
    {lat: places.places['Iriomote-jima'].coordinates[0], lng: places.places['Iriomote-jima'].coordinates[1]}
  ]);

  path.push([
    {lat: places.places['Ishigaki'].coordinates[0], lng: places.places['Ishigaki'].coordinates[1]},
    {lat: places.places['Osaka'].coordinates[0], lng: places.places['Osaka'].coordinates[1]}
  ]);

  path.push([
    {lat: places.places['Osaka'].coordinates[0], lng: places.places['Osaka'].coordinates[1]},
    {lat: places.places['Himeji'].coordinates[0], lng: places.places['Himeji'].coordinates[1]}
  ]);

  path.push([
    {lat: places.places['Osaka'].coordinates[0], lng: places.places['Osaka'].coordinates[1]},
    {lat: places.places['Osaka'].coordinates[0], lng: places.places['Osaka'].coordinates[1]}
  ]);

  path.push([
    {lat: places.places['Osaka'].coordinates[0], lng: places.places['Osaka'].coordinates[1]},
    {lat: places.places['Takatori'].coordinates[0], lng: places.places['Takatori'].coordinates[1]}
  ]);

  path.push([
    {lat: places.places['Osaka'].coordinates[0], lng: places.places['Osaka'].coordinates[1]},
    {lat: places.places['Mount Yoshino'].coordinates[0], lng: places.places['Mount Yoshino'].coordinates[1]}
  ]);

  path.push([
    {lat: places.places['Osaka'].coordinates[0], lng: places.places['Osaka'].coordinates[1]},
    {lat: places.places['Tokyo'].coordinates[0], lng: places.places['Tokyo'].coordinates[1]}
  ]);

  path.push([
    {lat: places.places['Tokyo'].coordinates[0], lng: places.places['Tokyo'].coordinates[1]},
    {lat: places.places['Tokyo'].coordinates[0], lng: places.places['Tokyo'].coordinates[1]}
  ]);

  path.push([
    {lat: places.places['Tokyo'].coordinates[0], lng: places.places['Tokyo'].coordinates[1]},
    {lat: places.places['Kyoto'].coordinates[0], lng: places.places['Kyoto'].coordinates[1]}
  ]);

  path.push([
    {lat: places.places['Tokyo'].coordinates[0], lng: places.places['Tokyo'].coordinates[1]},
    {lat: places.places['Kyoto'].coordinates[0], lng: places.places['Kyoto'].coordinates[1]}
  ]);

  path.push([
    {lat: places.places['Kyoto'].coordinates[0], lng: places.places['Kyoto'].coordinates[1]},
    {lat: places.places['Kyoto'].coordinates[0], lng: places.places['Kyoto'].coordinates[1]}
  ]);

  path.push([
    {lat: places.places['Kyoto'].coordinates[0], lng: places.places['Kyoto'].coordinates[1]},
    {lat: places.places['Kyoto'].coordinates[0], lng: places.places['Kyoto'].coordinates[1]}
  ]);

  path.push([
    {lat: places.places['Kyoto'].coordinates[0], lng: places.places['Kyoto'].coordinates[1]},
    {lat: places.places['Kyoto'].coordinates[0], lng: places.places['Kyoto'].coordinates[1]}
  ]);

  path.push([
    {lat: places.places['Kyoto'].coordinates[0], lng: places.places['Kyoto'].coordinates[1]},
    {lat: places.places['Hakone'].coordinates[0], lng: places.places['Hakone'].coordinates[1]}
  ]);

  path.push([
    {lat: places.places['Hakone'].coordinates[0], lng: places.places['Hakone'].coordinates[1]},
    {lat: places.places['Tokyo'].coordinates[0], lng: places.places['Tokyo'].coordinates[1]}
  ]);

  path.push([
    {lat: places.places['Tokyo'].coordinates[0], lng: places.places['Tokyo'].coordinates[1]},
    {lat: places.places['Tokyo'].coordinates[0], lng: places.places['Tokyo'].coordinates[1]}
  ]);

  path.push([
    {lat: places.places['Tokyo'].coordinates[0], lng: places.places['Tokyo'].coordinates[1]},
    {lat: places.places['Tokyo'].coordinates[0], lng: places.places['Tokyo'].coordinates[1]}
  ]);

  path.push([
    {lat: places.places['Tokyo'].coordinates[0], lng: places.places['Tokyo'].coordinates[1]},
    {lat: places.places['Tokyo'].coordinates[0], lng: places.places['Tokyo'].coordinates[1]}
  ]);

  path.push([
    {lat: places.places['Tokyo'].coordinates[0], lng: places.places['Tokyo'].coordinates[1]},
    {lat: places.places['Seattle'].coordinates[0], lng: places.places['Seattle'].coordinates[1]}
  ]);

  if (dayNum > -1) {
    geodesicPoly_map.setPath(path[dayNum]);
  }

}

var path_inset = [];
var tripPathCounter = 0;
var isNextKey = false;

document.onkeyup = function (e) {
  if (e.which == 39) {
    isNextKey = false;
  }
  if (e.which == 27) {
    isNextKey = false;
  }
}
// left arrow key action = 37

// right arrow key action
document.onkeydown = function (e) {
if (e.which == 37 && dayNum >= 0) {
    dayNum--;
    isNextKey = true;
    geodesicPoly_map.setPath(path[dayNum]);
}
else if (e.which == 39 && dayNum < path.length - 1) {
  dayNum++;
  isNextKey = true;

  var coordinates = path[dayNum][1];

  function nameByCoords (key) {
    var checkLat = places.places[key].coordinates[0] == this['lat'];
    var checkLng = places.places[key].coordinates[1] == this['lng'];

    return checkLat && checkLng;
  }

  var name = Object.keys(places.places).find(nameByCoords, coordinates);

  if (name == 'Takamatsu')
  {
    map.fitBounds(takamatsu_bounds);
  }
  else if (name == 'Matsuyama' && !original_bounds.equals(map.getBounds())) {
    map.fitBounds(original_bounds);
    map.setZoom(6);
  }
  else if (name == 'Hiroshima') {
      map.fitBounds(hiroshima_bounds);
  }
  else if (name == 'Osaka') {
    // map.setZoom(6);
      map.fitBounds(kansai_bounds);
      document.getElementById('insetMap').style.display = 'initial';
  }
  else if (name == 'Ishigaki') {
    map.fitBounds(okinawa_bounds);
    document.getElementById('insetMap').style.display = 'none';
  }
  else if (name == 'Himeji') {
    map.fitBounds(kansai_bounds, dayNum);
  }
  else if (name == 'Tokyo' && !original_bounds.equals(map.getBounds())) {
    map.fitBounds(original_bounds);
    map.setZoom(6);
  }

  geodesicPoly_map.setPath(path[dayNum]);

  }
}

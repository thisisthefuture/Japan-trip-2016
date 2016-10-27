var fs = require('fs');

var places;


try {
  places = JSON.parse(fs.readFileSync('./Cities.json', 'utf8'));
} catch (e) {
  throw new Error('whoops, bad JSON file', e);
}

places = places.features.reduce((places, element) => {
  var coords = element.geometry.coordinates;
  places[element.properties.Name] = ({
    name: element.properties.Name,
    coordinates: {0: coords[1],
      1: coords[0]
    },
    description: element.properties.Description
  });
  return places;
}, []);
//
// Object.keys(places).forEach(function (key) {
//   console.log(places[key]);
// });


function getPlaces() {
  return places;
}

module.exports.getPlaces = getPlaces;
module.exports.places = places;

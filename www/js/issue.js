// angular.module('citizen-engagement').controller('MyCtrl', function(geolocation, $log) {
//   var myCtrl = this;
//   geolocation.getLocation().then(function(data){
//     myCtrl.latitude = data.coords.latitude;
//     myCtrl.longitude = data.coords.longitude;
//   }).catch(function(err) {
//     $log.error('Could not get location because: ' + err.message);
//   });
// });
angular.module('citizen-engagement').controller('MapCtrl', function(geolocation, $log, mapboxSecret) {
  var mapCtrl = this;

//dans le controller de new issue--> mettre le code suivant, mais il faut changer le nom et le center est pour centrer la carte à choisir si on le met ou pas
  geolocation.getLocation().then(function(data){
    mapCtrl.center.lat = data.coords.latitude;
    mapCtrl.center.lng = data.coords.longitude;


    mapCtrl.markers.push({
      lat: data.coords.latitude,
      lng: data.coords.longitude
    });


  }).catch(function(err) {
    $log.error('Could not get location because: ' + err.message);
  });

var mapboxMapId = 'mapbox.satellite';  // Use your favorite tileset here
var mapboxAccessToken = mapboxSecret;    // Use your access token here
// Build the tile layer URL
var mapboxTileLayerUrl = 'http://api.tiles.mapbox.com/v4/' + mapboxMapId;
mapboxTileLayerUrl = mapboxTileLayerUrl + '/{z}/{x}/{y}.png';
mapboxTileLayerUrl = mapboxTileLayerUrl + '?access_token=' + mapboxAccessToken;


  mapCtrl.defaults = {
      tileLayer: mapboxTileLayerUrl
  };
  mapCtrl.markers = [];
  mapCtrl.center = {
    lat: 51.48,
    lng: 0,
    zoom: 14
  };



});

angular.module('citizen-engagement').controller('MapCtrl', function(geolocation, $log, mapboxSecret, IssueService, $scope, leafletData, $state) {
  var mapCtrl = this;
  // Marker personnalisé, fonctionne pas sur mobile
  geolocation.getLocation().then(function(data){
    mapCtrl.center.lat = data.coords.latitude;
    mapCtrl.center.lng = data.coords.longitude;
    mapCtrl.icones = {
    iconUrl: '../img/marker-person.png',
    iconSize:     [45, 45],
    iconAnchor:   [22.5, 5]
  }

    mapCtrl.markers.push({
      lat: data.coords.latitude,
      lng: data.coords.longitude,
    });
    var page = 1;
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

  // A chaque fois que la map est drag
  $scope.$on('leafletDirectiveMap.dragend', function(event, map){
    console.log('Map was dragged');
    console.log(map);
    leafletData.getMap().then(function(carte){

      // Récupère la distance du centre aux deux extrémités de la map
      var mapBoundNorthEast = carte.getBounds().getNorthEast();
      var mapBoundNorthWest = carte.getBounds().getNorthWest();
      // Calcule la distance d'une extrémité à l'autre
      mapDistance = mapBoundNorthWest.distanceTo(mapBoundNorthEast);
      // Divise la distance par deux pour avoir uniquement le rayon
      mapDistance = mapDistance / 2;
      // Transformation du résultat en KM
      mapDistance = mapDistance / 1000;

      console.log(mapDistance);
      // retourne la distance convertie en de KM en radian
      return mapDistance / 6378.1;
    }).then(function(radius){
      // Recherche les issues se trouvant à cette position et contenu dans le rayon calculé
      IssueService.retriveIssuesLocation(mapCtrl.center, radius).then(function(res){
        console.log(res.data);
        createMarkers(res.data);
      })
    })

  });
  // Crée et ajotue les markers à la map
  function createMarkers (issues) {
    console.log(issues);
      mapCtrl.markers = [];
      for(var i=0; i<issues.length; i++){
        mapCtrl.markers.push({
          lat: issues[i].location.coordinates[1],
          lng: issues[i].location.coordinates[0],
          issue: issues[i],
          message: '<p>'+ issues[i].issueType.name + '</p><p> ' + issues[i].issueType.description +'</p>'
        });
      }
    }
  // Quand on clique sur un marker
  $scope.$on('leafletDirectiveMarker.click', function(event, marker) {
    // Si le marker est le marker d'une issue et non notre position actuelle
    if(marker.model.issue){
      $state.go('tab.issueDetailsMap', {issueId: marker.model.issue.id});
    }
  });
});

/*
* issues.js
* Controllers: ListCtrl, NewIssueCtrl, issueDetailCtrl
* Services: CameraService, IssueService
* Gère notamment: Listing des issues, l'ajout d'une issue, le listing des détails d'une issue
*/

/*
* Service - CameraService
* isSupported() - Permet controler que le device est équipé d'une camera
* getPicture() - Permet de prendre une photo
*/
angular.module('citizen-engagement').factory('CameraService', function($q) {
  var service = {
    isSupported: function() {
      return navigator.camera !== undefined;
    },
    getPicture: function() {
      var deferred = $q.defer();
      var options = { // Return the raw base64 PNG data
        destinationType: navigator.camera.DestinationType.DATA_URL,
        correctOrientation: true
      };
      navigator.camera.getPicture(function(result) {
        deferred.resolve(result);
      }, function(err) {
        deferred.reject(err);
      }, options);
      return deferred.promise;
    }
  };
  return service;
});

/*
* Service - IssueService
* retrieveIssuesPage() - retourne une liste d'issues paginée
* retriveIssuesLocation() - retourne une liste d'issues en fonction d'une localisation
*/
angular.module('citizen-engagement').factory('IssueService', function($http, apiUrl) {
  var service = {};
  /*
  * Retournes liste d'issues
  * page - le numéro de la page à retourner
  * state - l'état des issues à retourner
  * search - la recherche dans les descriptions des issues à retourner
  * nbItems - le nombre d'issue à retourner
  */
  service.retrieveIssuesPage = function(page, state, search, nbItems) {
    page = page || 1; // Start from page 1
    nbItems = nbItems || 20;
    var requestData = {};

    if (state) {
      requestData.state = state;
    }
    if (search) {
      requestData.description = {$regex:search};
      //requestData.state = {$in:search}
    }

  // GET the current page
    return $http({
      method: 'POST',
      url: apiUrl + '/issues/searches?include=creator&include=issueType',
      params: {
        page: page,
        pageSize: nbItems,
        sort:'-createdAt'
      },
      data: requestData
    })
  };
  /*
  * Retourne liste d'issues
  * location - Objet contenant la latitute et longitute du centre de recherche
  * radius - Le rayon en radian de recherche autour du centre
  */
  service.retriveIssuesLocation = function (location, radius){
    console.log(location);
    var page =1;
    var pageSize = 50;
    return $http({
      method: 'POST',
      url: apiUrl + '/issues/searches?include=creator&include=issueType',
      params: {
        page: page,
        pageSize: pageSize
      },
      headers: {
        'Content-Type': 'application/json'
      },
      data: {
        "location": {
            "$geoWithin": {
            "$centerSphere" : [
              [ location.lng , location.lat],
              radius
            ]
          }
        }
      }
    });
  };

  return service;

});

/*
* ListCtrl - Gère le listing des issues
*/
angular.module('citizen-engagement').controller('ListCtrl', function(AuthService, $scope, $http, $state, apiUrl, IssueService, MessageService, $timeout) {
  var listCtrl = this;
  var page = 1;
  listCtrl.issues = [];
  // Cherche les isssues de la page suivante et les ajoute à la liste actuelle
  listCtrl.showMore = function() {
    page = page + 1;
    IssueService.retrieveIssuesPage(page,listCtrl.state,listCtrl.search, listCtrl.nbItems).then(function(res) {
      listCtrl.issues = listCtrl.issues.concat(res.data);
    });
  }
  // Filtre les issues en fonction de leur état
  listCtrl.listFilter = function(){
      listCtrl.issues = [];
      page = 0;
      listCtrl.showMore();
  }
  // A chaque fois que la view est ouverte, on recherche les issues
  $scope.$on('$ionicView.enter', function() {
      IssueService.retrieveIssuesPage(page,listCtrl.state,listCtrl.search, listCtrl.nbItems).then(function(res) {

        listCtrl.issues = res.data;
        // Si message de succès présent
        if(MessageService.msg){
          listCtrl.success = MessageService.msg;
          $timeout(function(){
            listCtrl.success = null;
            MessageService.unsetMsg();
          }, 4500);
        }
      });
   })
});

/*
* IssueDetailCtrl - Gère l'affichage des informations des détails d'une issue
*/
angular.module('citizen-engagement').controller('IssueDetailCtrl', function ($scope, $state, $http, apiUrl, $stateParams, CommentsService) {
  var issueDetailCtrl = this;

  $scope.$on('$ionicView.enter', function(){
    var issueId = $stateParams.issueId;
    $http({
      method: 'GET',
      url: apiUrl + '/issues/'+issueId+"?include=creator&include=issueType"
    }).then(function(res){
      console.log(res.data);
      issueDetailCtrl.issue = res.data;
    });
  })
});

/*
* NewIssueCtrl - Gère la création d'une issue
*/
angular.module('citizen-engagement').controller('NewIssueCtrl', function (qimgUrl, qimgSecret, $q, $ionicPopup, $scope, $http, apiUrl, geolocation, $state, $log, $ionicLoading, CameraService, MessageService){
  var newIssueCtrl = this;
  newIssueCtrl.messages = [];
  $scope.$on('$ionicView.enter', function(){
    $http({
      method: 'GET',
      url: apiUrl + '/issueTypes'
    }).then(function(res){
      newIssueCtrl.issueTypes = res.data;
      console.log(newIssueCtrl.issueTypes);
    });
  });
  // Gère la prise de photo avec la camera
  newIssueCtrl.takePicture = function() {
    var isOK = CameraService.isSupported();
    if (isOK == true) {
      CameraService.getPicture().then(function(result) {
        $log.debug('Picture taken!');
        return newIssueCtrl.pictureData = result;
      }).catch(function(err) {
        $log.error('Could not get picture because: ' + err.message);
      });
    }
    else {
      return $ionicPopup.alert({
        title: 'Not supported',
        template: 'You cannot use the camera on this platform'
      });
    }
  };

  newIssueCtrl.create = function () {
    return $q.when().then(postImage).then(postIssue).catch(function(err) {

    });
    console.log(postIssue);
  };
  // Héberge l'image auprès de l'API qimg
  function postImage() {
    $ionicLoading.show({
      template: 'Creating issue...',
    });
    if (!newIssueCtrl.pictureData) {
      // If no image was taken, return a promise resolved with "null"
      return $q.when(null);
    }
    newIssueCtrl.messages.push("Picture found");
    // Upload the image to the qimg API
    return $http({
      method: 'POST',
      url: qimgUrl + '/images',
      headers: {
        Authorization: 'Bearer ' + qimgSecret
      },
      data: {
        data: newIssueCtrl.pictureData
      }
    });
  }
  // Enregistre l'issue
  function postIssue(imageRes) {
   // Use the image URL from the qimg API response (if any)
   if (imageRes) {
     newIssueCtrl.issue.imageUrl = imageRes.data.url;
   }
   else{
     newIssueCtrl.issue.imageUrl = "http://souelni.ma/wp-content/themes/qaengine%206/img/default-thumbnail.jpg";
   }

   // Create the issue
   var tags = newIssueCtrl.issue.tags.split(',');
   return geolocation.getLocation().then(function(data){
    newIssueCtrl.latitude = data.coords.latitude;
    newIssueCtrl.longitude = data.coords.longitude;
    return $http({
      method: 'POST',
      url: apiUrl + '/issues',
      headers: {
        'Content-Type': 'application/json'
      },
      data:  {
        "description":newIssueCtrl.issue.description,
        "tags": tags,
        "imageUrl": newIssueCtrl.issue.imageUrl,
        "location": {
          "coordinates": [
            newIssueCtrl.longitude,
            newIssueCtrl.latitude,
          ],
          "type": "Point"
        },
        "issueTypeHref": newIssueCtrl.issue.issueType.href

      }
    }).then(function(res){
      $ionicLoading.hide();
      console.log(res);
      var issueCreated = res.data;
      MessageService.transferMsg('Issue créée avec succès !');
      $state.go('tab.issueList');
    }).catch(function(err){
        $log.error('Could not create the issue because ' + err.message);
        throw err;
    });
  }).catch(function(err) {
    $log.error('Could not get location because: ' + err.message);
    throw err;
  });

 }
});

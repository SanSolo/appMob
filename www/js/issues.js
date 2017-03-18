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

angular.module('citizen-engagement').factory('IssueService', function($http, apiUrl) {
  var service = {};

  //Get all issues
  service.getIssues = function(page, items) {
    page = page || 1; // Start from page 1
    items = items || [];
    // GET the current page
    return $http({
      method: 'GET',
      url: apiUrl + '/issues?include=creator&include=issueType',
      params: {
        page: page
      }
    }).then(function(res) {
      if (res.data.length) {
        // If there are any items, add them
        // and recursively fetch the next page
        items = items.concat(res.data);
        return service.getIssues(page + 1, items);
      }
      return items;
    });
  };

  return service;

});
angular.module('citizen-engagement').controller('ListCtrl', function(AuthService, $scope, $http, $state, apiUrl, IssueService) {
  var listCtrl = this;
  $scope.$on('$ionicView.enter', function() {
      // Code you want executed every time view is opened
      IssueService.getIssues().then(function(issues) {
        console.log(issues);
        listCtrl.issues = issues;
      })
   })
});

angular.module('citizen-engagement').controller('IssueDetailCtrl', function ($scope, $http, apiUrl, $stateParams) {
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

angular.module('citizen-engagement').controller('NewIssueCtrl', function ($scope, $http, apiUrl, geolocation, $state, $log, $ionicLoading, CameraService){
  var newIssueCtrl = this;
  $scope.$on('$ionicView.enter', function(){
    $http({
      method: 'GET',
      url: apiUrl + '/issueTypes'
    }).then(function(res){
      newIssueCtrl.issueTypes = res.data;
      console.log(newIssueCtrl.issueTypes);
    });
  });

  newIssueCtrl.takePicture = function() {
    var isOK = CameraService.isSupported();
    if (isOK == true) {
      CameraService.getPicture().then(function(result) {
        $log.debug('Picture taken!');
        myCtrl.pictureData = result;
      }).catch(function(err) {
        $log.error('Could not get picture because: ' + err.message);
      });
    }
    else {
      $log.error('Your device has no camera');
    }
  };

  newIssueCtrl.create = function () {
    // Show a loading message if the request takes too long.
    $ionicLoading.show({
      template: 'Creating the issue...'
    });
    newIssueCtrl.issue.createdAt = Date.now();
    newIssueCtrl.issue.issueTypeHref = '/api/issueTypes/58c55a0af2dc592bf95e5d86';
    var tags = newIssueCtrl.issue.tags.split(',');
    geolocation.getLocation().then(function(data){
      newIssueCtrl.latitude = data.coords.latitude;
      newIssueCtrl.longitude = data.coords.longitude;
      $http({
        method: 'POST',
        url: apiUrl + '/issues',
        headers: {
          'Content-Type': 'application/json'
        },
        data:  {
          "description":newIssueCtrl.issue.description,
          "tags": tags,
          "imageUrl": "https://comem-citizen-engagement-2017g.herokuapp.com/images/graffiti-1.jpg",
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
        $state.go('tab.issueDetails', {issueId: res.data.id});
      }).catch(function(err){
          $log.error('Could not create the issue because ' + err.message);
      });
    }).catch(function(err) {
      $log.error('Could not get location because: ' + err.message);
    });

  };
});

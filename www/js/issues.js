angular.module('citizen-engagement').controller('ListCtrl', function(AuthService, $scope, $http, $state, apiUrl) {
  var listCtrl = this;
  $scope.$on('$ionicView.enter', function() {
      // Code you want executed every time view is opened
      console.log('Opened!')
      $http({
        method: 'GET',
        url: apiUrl + '/issues'
      }).then(function(res) {
          console.log(res.data);
          console.log('coucou');
          listCtrl.issues = res.data;
      });
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

angular.module('citizen-engagement').controller('NewIssueCtrl', function ($scope, $http, apiUrl, geolocation, $state, $log){
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

  newIssueCtrl.create = function () {
    newIssueCtrl.issue.createdAt = Date.now();
    newIssueCtrl.issue.issueTypeHref = '/api/issueTypes/58c55a0af2dc592bf95e5d86';
    var tags = newIssueCtrl.issue.tags.split(',');
    geolocation.getLocation().then(function(data){
      newIssueCtrl.latitude = data.coords.latitude;
      newIssueCtrl.longitude = data.coords.longitude;
      console.log(newIssueCtrl.longitude);

      $http({
        method: 'POST',
        url: apiUrl + '/issues',
        headers: {
          'Content-Type': 'application/json'
        },
        data:  {
          "description":newIssueCtrl.issue.description,
          "tags": tags,
          "imageUrl": "http://example.com/image.png",
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
        console.log(res);
        var issueCreated = res.data;
        $state.go('tab.issueDetails', {issueId: res.data.id});
      }).catch(function(){

      });




    }).catch(function(err) {
      $log.error('Could not get location because: ' + err.message);
    });

  };
});

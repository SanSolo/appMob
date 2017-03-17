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

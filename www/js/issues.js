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

angular.module('citizen-engagement').controller('NewIssueCtrl', function ($scope, $http, apiUrl){
  var newIssueCtrl = this;
  $scope.$on('$ionicView.enter', function(){
    $http({
      method: 'GET',
      url: apiUrl + '/issueTypes'
    }).then(function(res){
      newIssueCtrl.issueTypes = res.data;
      console.log(newIssueCtrl.issueTypes);
      console.log(newIssueCtrl.issue_type);
      console.log(newIssueCtrl.issue);
    });
  });

  newIssueCtrl.create = function () {
    newIssueCtrl.issue.createdAt = Date.now();
    newIssueCtrl.issue.issueTypeHref = '/api/issueTypes/58c55a0af2dc592bf95e5d86';
    newIssueCtrl.issue.location.type = "Point";
    $http({
      method: 'POST',
      url: apiUrl + '/issues',
      data:newIssueCtrl.issue
    }).then(function(res){

    }).catch(function(){

    });
  };
});

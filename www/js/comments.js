angular.module('citizen-engagement').factory('CommentsService', function(apiUrl, $q, $http) {
  var service = {};
  service.getComments = function (issueId){
    return $http ({
      method: 'GET',
      url: apiUrl + '/issues/'+issueId+"/comments?include=author"
    }).then(function(res){
        return res.data;
    });
  }
  return service;
});

angular.module('citizen-engagement').controller('CommentsCtrl', function(AuthService, $scope, $http, $state, $stateParams, apiUrl, CommentsService) {
  var commentsCtrl = this;
  $scope.$on('$ionicView.enter', function() {
      // Code you want executed every time view is opened
      CommentsService.getComments($stateParams.issueId).then(function(comments) {
        console.log(comments);
        commentsCtrl.comments = comments;
      })
   })
});

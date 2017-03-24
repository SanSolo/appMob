var nbComments;
angular.module('citizen-engagement').factory('CommentsService', function(apiUrl, $q, $http) {
  var service = {};
  service.getComments = function (issueId, page){
    page = page || 1; // Start from page 1
    return $http ({
      method: 'GET',
      url: apiUrl + '/issues/'+issueId+"/comments?include=author",
      params:{
        page: page
      }
    }).success(function(res, satus, headers, config){
      console.log(headers('Pagination-Total'));
      nbComments = headers('Pagination-Total');
        return res.data;
    });
  }
  return service;
});

angular.module('citizen-engagement').controller('CommentsCtrl', function(AuthService, $scope, $http, $state, $stateParams, apiUrl, CommentsService) {
  var commentsCtrl = this;
  var page = 1;
  $scope.$on('$ionicView.enter', function() {
      // Code you want executed every time view is opened
      CommentsService.getComments($stateParams.issueId, page).then(function(comments) {
        console.log(comments.data);
        commentsCtrl.comments = comments.data;
        commentsCtrl.nbComments = nbComments;
      })
   })
   commentsCtrl.create = function (){
     console.log('new comm');
     issueId = $stateParams.issueId;
     console.log(issueId);
     $http ({
       method:'POST',
       url: apiUrl + '/issues/' + issueId + '/comments',
       headers: {
         'Content-Type': 'application/json'
       },
       data: {
         "text": commentsCtrl.text
       }
     }).then(function(res){

        console.log(res.data);
         $state.go($state.current, {}, {reload: true});
     });
   }
   commentsCtrl.showMore = function (){
     page = page + 1;
     CommentsService.getComments($stateParams.issueId, page).then(function(comments){
       console.log(comments);
       commentsCtrl.comments = commentsCtrl.comments.concat(comments);
     })
   }

});

angular.module('citizen-engagement').controller('NewCommentCtrl', function ($http, apiUrl, $stateParams, $state){
  var newCommentCtrl = this;

});

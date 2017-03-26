/*
* comments.js
* Controllers: CommentsCtrl
* Gère notamment: Le listing des commentaires par issue, la création de commentaires
*/

// Initialise la variable contenant le nombre de commentaires postés pour une issue
var nbComments;

/*
* CommentsService - getComments()
*/
angular.module('citizen-engagement').factory('CommentsService', function(apiUrl, $q, $http) {
  var service = {};
  service.getComments = function (issueId, page){
    page = page || 1; // Start from page 1
    // GET la liste des commentaires d'une issue
    return $http ({
      method: 'GET',
      url: apiUrl + '/issues/'+issueId+"/comments?include=author",
      params:{
        page: page
      }
    }).success(function(res, satus, headers, config){
      console.log(headers('Pagination-Total'));
      // On stock le nombre de commentaires contenus dans le header de la réponse
      nbComments = headers('Pagination-Total');
        return res.data;
    });
  }
  return service;
});

/*
* CommentsCtrl - create(), showMore()
*/
angular.module('citizen-engagement').controller('CommentsCtrl', function(AuthService, $scope, $http, $state, $stateParams, apiUrl, CommentsService) {
  var commentsCtrl = this;
  var page = 1;
  // Liste les commentaires à l'entrée de la vue
  $scope.$on('$ionicView.enter', function() {
      // Code you want executed every time view is opened
      CommentsService.getComments($stateParams.issueId, page).then(function(comments) {
        console.log(comments.data);
        commentsCtrl.comments = comments.data;
        commentsCtrl.nbComments = nbComments;
      })
   })
   // Gère l'ajout de commentaires
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
   // Ajoute les commentaires de la page suivant à la liste actuelle
   commentsCtrl.showMore = function (){
     page = page + 1;
     CommentsService.getComments($stateParams.issueId, page).then(function(comments){
       console.log(comments.data);
       commentsCtrl.comments = commentsCtrl.comments.concat(comments.data);
     })
   }

});

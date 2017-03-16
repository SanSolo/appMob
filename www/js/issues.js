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

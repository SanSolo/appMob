
/*
* Auth.js
* Controllers: LoginCtrl, LogoutCtrl
* Gère notamment: La connexion, Le déconnexion et l'inscription
*/

// Login Controller
angular.module('citizen-engagement').controller('LoginCtrl', function(apiUrl, MessageService, AuthService, $http, $ionicHistory, $ionicLoading, $scope, $state) {
  var loginCtrl = this;

  // The $ionicView.beforeEnter event happens every time the screen is displayed.
  $scope.$on('$ionicView.beforeEnter', function() {
    // Re-initialize the user object every time the screen is displayed.
    // The first name and last name will be automatically filled from the form thanks to AngularJS's two-way binding.
    loginCtrl.user = {};
    // Si un message de création de compte est envoyé. L'afficher.
    if(MessageService.msg){
      loginCtrl.message = MessageService.msg;
    }
  });

  // Add the login function to the scope.
  loginCtrl.logIn = function() {

    // Forget the previous error (if any).
    delete loginCtrl.error;

    // Show a loading message if the request takes too long.
    $ionicLoading.show({
      template: 'Logging in...',
      delay: 750
    });

    // Make the request to retrieve or create the user.
      $http({
        method: 'POST',
        url: apiUrl + '/auth',
        data: loginCtrl.user
      }).then(function(res) {

      // If successful, give the token to the authentication service.
      AuthService.setAuthToken(res.data.token);

      // Hide the loading message.
      $ionicLoading.hide();

      // Set the next view as the root of the history.
      // Otherwise, the next screen will have a "back" arrow pointing back to the login screen.
      $ionicHistory.nextViewOptions({
        disableBack: true,
        historyRoot: true
      });

      // Go to the issue creation tab.
      $state.go('tab.newIssue');

    }).catch(function() {

      // If an error occurs, hide the loading message and show an error message.
      $ionicLoading.hide();
      loginCtrl.error = 'Could not log in.';
    });
  };
  // Add the register function to the scope
  loginCtrl.register = function () {

      loginCtrl.user.roles = ['citizen'];
      console.log(loginCtrl.user);
      $http({
        method: 'POST',
        url: apiUrl + '/users',
        data: loginCtrl.user
      }).then(function(res) {

      // Hide the loading message.
      $ionicLoading.hide();

      // Set the next view as the root of the history.
      // Otherwise, the next screen will have a "back" arrow pointing back to the login screen.
      $ionicHistory.nextViewOptions({
          disableBack: true,
          historyRoot: true
      });
        // Envoie d'un message de succès
        MessageService.transferMsg('Compte créé. Vous pouvez vous connecter avec les identifiants renseignés');
        // Go to the login tab.
        $state.go('login');
  }).catch(function() {

    // If an error occurs, hide the loading message and show an error message.
    $ionicLoading.hide();
    loginCtrl.error = 'Could not register';
  });
};
});

/* Service - AuthService
* Permet de fournir le token d'identification sur chaque requête HTTP
*/
angular.module('citizen-engagement').factory('AuthInterceptor', function(AuthService) {
  return {

    // The request function will be called before all requests.
    // In it, you can modify the request configuration object.
    request: function(config) {

      // If the user is logged in, add the X-User-Id header.
      if (AuthService.authToken && !config.headers.Authorization) {
        config.headers.Authorization = 'Bearer ' + AuthService.authToken;
      }

      return config;
    }
  };
});

/*
* LogoutCtrl - Gère la déconnexion
*/
angular.module('citizen-engagement').controller('LogoutCtrl', function(AuthService, $state) {
  var logoutCtrl = this;

  logoutCtrl.logOut = function() {
    AuthService.unsetAuthToken();
    $state.go('login');
  };
});

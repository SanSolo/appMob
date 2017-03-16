angular.module('citizen-engagement').factory('AuthService', function() {

  var service = {
    authToken: null,

    setAuthToken: function(token) {
      service.authToken = token;
    },

    unsetAuthToken: function() {
      service.authToken = null;
    }
  };

  return service;
});

angular.module('citizen-engagement').controller('LoginCtrl', function(apiUrl, AuthService, $http, $ionicHistory, $ionicLoading, $scope, $state) {
  var loginCtrl = this;

  // The $ionicView.beforeEnter event happens every time the screen is displayed.
  $scope.$on('$ionicView.beforeEnter', function() {
    // Re-initialize the user object every time the screen is displayed.
    // The first name and last name will be automatically filled from the form thanks to AngularJS's two-way binding.
    loginCtrl.user = {};
  });

  // Add the register function to the scope.
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
        // Go to the login creation tab.
        $state.go('login');
  }).catch(function() {

    // If an error occurs, hide the loading message and show an error message.
    $ionicLoading.hide();
    loginCtrl.error = 'Could not register';
  });
};
});

angular.module('citizen-engagement').controller('LogoutCtrl', function(AuthService, $state) {
  var logoutCtrl = this;

  logoutCtrl.logOut = function() {
    AuthService.unsetAuthToken();
    $state.go('login');
  };
});

angular.module('citizen-engagement').factory('AuthInterceptor', function(AuthService) {
  return {

    // The request function will be called before all requests.
    // In it, you can modify the request configuration object.
    request: function(config) {

      // If the user is logged in, add the X-User-Id header.
      if (AuthService.authToken) {
        config.headers.Authorization = 'Bearer ' + AuthService.authToken;
      }

      return config;
    }
  };
});


angular.module('citizen-engagement').controller('LogoutCtrl', function(AuthService, $state) {
  var logoutCtrl = this;

  logoutCtrl.logOut = function() {
    AuthService.unsetAuthToken();
    $state.go('login');
  };
});

angular.module('citizen-engagement').factory('AuthInterceptor', function(AuthService) {
  return {

    // The request function will be called before all requests.
    // In it, you can modify the request configuration object.
    request: function(config) {

      // If the user is logged in, add the X-User-Id header.
      if (AuthService.authToken) {
        config.headers.Authorization = 'Bearer ' + AuthService.authToken;
      }

      return config;
    }
  };
});

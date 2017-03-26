// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('citizen-engagement', ['ionic', 'angular-storage', 'geolocation', 'leaflet-directive'])

.config(function($logProvider) {
     $logProvider.debugEnabled(false);
})

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})
angular.module('citizen-engagement').config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

    // This is the abstract state for the tabs directive.
    .state('tab', {
      url: '/tab',
      abstract: true,
      templateUrl: 'templates/tabs.html'
    })

    // The three next states are for each of the three tabs.
    // The state names start with "tab.", indicating that they are children of the "tab" state.
    .state('tab.newIssue', {
      // The URL (here "/newIssue") is used only internally with Ionic; you never see it displayed anywhere.
      // In an Angular website, it would be the URL you need to go to with your browser to enter this state.
      url: '/newIssue',
      views: {
        // The "tab-newIssue" view corresponds to the <ion-nav-view name="tab-newIssue"> directive used in the tabs.html template.
        'tab-newIssue': {
          // This defines the template that will be inserted into the directive.
          templateUrl: 'templates/newIssue.html',
          controller: 'NewIssueCtrl',
          controllerAs: 'newIssueCtrl'
        }
      }
    })
    // Tab - Map
    .state('tab.issueMap', {
      url: '/issueMap',
      views: {
        'tab-issueMap': {
          controller: 'MapCtrl',
          controllerAs: 'mapCtrl',
          templateUrl: 'templates/issueMap.html'
        }
      }
    })
    // Liste d'issue
    .state('tab.issueList', {
      url: '/issueList',
      views: {
        'tab-issueList': {
          templateUrl: 'templates/issueList.html',
          controller: 'ListCtrl',
          controllerAs: 'listCtrl'
        }
      }
    })
    // Tab - Les commentaires d'une issue
    .state('tab.comment', {
      url: '/issueDetails/:issueId/comments',
      views: {
        'tab-issueList': {
          templateUrl: 'templates/comment.html',
          controller: 'CommentsCtrl',
          controllerAs: 'commentsCtrl'
        }
      }
    })

    // This is the issue details state.
    .state('tab.issueDetails', {
      // We use a parameterized route for this state.
      // That way we'll know which issue to display the details of.
      url: '/issueDetails/:issueId',
      views: {
        // Here we use the same "tab-issueList" view as the previous state.
        // This means that the issue details template will be displayed in the same tab as the issue list.
        'tab-issueList': {
          templateUrl: 'templates/issueDetails.html',
          controller: 'IssueDetailCtrl',
          controllerAs: 'issueDetailCtrl'
        }
      }
    })
    // Tab - Détails d'une issue en venant de la map
    .state('tab.issueDetailsMap', {
      // We use a parameterized route for this state.
      // That way we'll know which issue to display the details of.
      url: '/issueDetailsMap/:issueId',
      views: {
        'tab-issueMap': {
                controller: 'IssueDetailCtrl',
                controllerAs: 'issueDetailCtrl',

        // Here we use the same "tab-issueList" view as the previous state.
        // This means that the issue details template will be displayed in the same tab as the issue list.

                templateUrl: 'templates/issueDetails.html'
              }}

    })
    // Formulaire d'inscription
    .state('signin', {
      url: '/signin',
      controller: 'LoginCtrl',
      controllerAs:'loginCtrl',
      templateUrl: 'templates/signin.html'
    })

    // Formulaire de connexion
    .state('login', {
      url: '/login',
      controller: 'LoginCtrl',
      controllerAs:'loginCtrl',
      templateUrl: 'templates/login.html'
    })
  ;



  // Define the default state (i.e. the first screen displayed when the app opens).
  $urlRouterProvider.otherwise(function($injector) {
    $injector.get('$state').go('tab.newIssue'); // Go to the new issue tab by default.
  });
});

angular.module('citizen-engagement').factory('AuthService', function(store) {

  var service = {
    authToken: store.get('authToken'),

    setAuthToken: function(token) {
      service.authToken = token;
      store.set('authToken', token);
    },

    unsetAuthToken: function() {
      service.authToken = null;
      store.remove('authToken');
    }
  };

  return service;
});

angular.module('citizen-engagement').config(function($httpProvider) {
  $httpProvider.interceptors.push('AuthInterceptor');
});
angular.module('citizen-engagement').run(function(AuthService, $rootScope, $state) {

  // Listen for the $stateChangeStart event of AngularUI Router.
  // This event indicates that we are transitioning to a new state.
  // We have the possibility to cancel the transition in the callback function.
  $rootScope.$on('$stateChangeStart', function(event, toState) {

    // If the user is not logged in and is trying to access another state than "login"...
    if (!AuthService.authToken && !(toState.name == 'login' || toState.name == 'signin')) {

      // ... then cancel the transition and go to the "login" state instead.
      event.preventDefault();
      $state.go('login');
    }
  });
});

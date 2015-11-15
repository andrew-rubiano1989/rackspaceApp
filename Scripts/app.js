var app = angular.module('rackspace', ['ngRoute', 'ngCookies', 'directives', 'controllers', 'apiService', 'authService']);
app.config(['$routeProvider', function($routeProvider){
    $routeProvider.when('/login', {templateUrl: 'Views/login.html'})
    .when('/home', {templateUrl: 'Views/home.html'})
    .otherwise({redirectTo: '/home'});
}])
.run(['$rootScope', '$location', '$cookies', 'authService', function($rootScope, $location, $cookies, authService){
    $rootScope.$on('$locationChangeStart', function(event, next, current){
        if(!$cookies.get('token'))
            $location.path('/login');
        else{
            authService.validate(function(res, status){
                console.log(res);
                if(res !== 'true'){
                    //token is no longer valid
                    $cookies.remove('username');
                    $cookies.remove('token');
                    $location.path('login');
                }
            });
        }
    });
}]);
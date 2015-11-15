var controller = angular.module('controllers', []);
controller.controller('mainController', ['$location', '$scope', '$cookies', function($location, $scope, $cookies){
    $scope.user = $cookies.get('username');
    
    this.logout = function(){
        $cookies.remove('token');
        $cookies.remove('username');
        $location.path('/login');
    }
}]);
var auth = angular.module('authService', []);
auth.factory('authService', ['apiMethods', '$cookies', function(apiMethods, $cookies){
    var service = {};
    
    service.auth = function(user, callback){
        apiMethods.authenticate(user, callback, callback);
    }
    
    service.validate = function(callback){
        apiMethods.isAuthenticated({'token': $cookies.get('token')}, callback, callback);
    }
    
    service.validateOrAuth = function(user, callback){
        if(!$cookies.get('token'))
            return service.auth(user, callback);
        else
            return service.validate(callback);
    }
    
    service.createAccount = function(user, callback){
        apiMethods.createAccount(user, callback);
    }
    
    return service;
}]);
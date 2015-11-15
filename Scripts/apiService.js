//Need to add auth to this section
var api = angular.module('apiService', []);

api.constant('apiRoute', {
    authenticate: '/authenticate',
    isAuthenticated: '/is-authenticated',
    createAccount: '/create-account'
});

api.factory('apiMethods', ['$http', 'apiRoute', function($http, apiRoute){
    var methods = {};
    
    methods.get = function($http, address, successCallback, failureCallback){
        $http.get(address)
            .success(function(data, status, headers, config){
                if(successCallback)
                    successCallback(data, status);
            }).error(function(data, status, headers, config){
                if(failureCallback)
                    failureCallback(data, status);
            });
    }

    methods.post = function($http, data, address, successCallback, failureCallback){
        $http.post(address, data)
            .success(function(data, status, headers, config){
                if(successCallback)
                    successCallback(data, status);
            }).error(function(data, status, headers, config){
                if(failureCallback)
                    failureCallback(data, status);
            });
    }
    
    methods.createAccount = function(data, successCallback, failureCallback){
        methods.post($http, data, apiRoute.createAccount, successCallback, failureCallback);
    }
    
    methods.authenticate = function(data, successCallback, failureCallback){
        methods.post($http, data, apiRoute.authenticate, successCallback, failureCallback);
    }
    
    methods.isAuthenticated = function(data, successCallback, failureCallback){
        methods.post($http, data, apiRoute.isAuthenticated, successCallback, failureCallback);
    }
    
    return methods;
}]);
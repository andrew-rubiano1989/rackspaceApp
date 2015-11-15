var directives = angular.module('directives', []);
directives.directive('login', function(){
    return {
        restrict: 'E',
        templateUrl: 'Views/loginForm.html',
        controller: ['$scope', '$location', '$cookies', 'authService', function($scope, $location, $cookies, authService){
            $scope.action = 'login';
            $scope.user = {};
            $scope.message = null;
            
            $cookies.get('token') ? $scope.token = $cookies.get('token') : $scope.token = '';
            $cookies.get('email') ? $scope.user.email = $cookies.get('email') : $scope.user.email = '';
            $cookies.get('password') ? $scope.user.password = $cookies.get('password') : $scope.user.password = '';
            $cookies.get('username') ? $scope.user.username = $cookies.get('username') : $scope.user.username = '';
            $cookies.get('rememberMe') ? $scope.user.rememberMe = $cookies.get('rememberMe') : $scope.user.rememberMe = false;
            
            this.enableLoginButton = function(){
                if($scope.user.email === '' || $scope.user.password === '')
                    return false;
                else if($scope.action === 'signup' && $scope.user.username === '')
                    return false;
                else
                    return true;
            }
            
            this.select = function(action){
                $scope.action = action;
                if(action === 'login')
                    $scope.user.username = '';
                if(action === 'forgot'){
                    $scope.user.password = '';
                    $scope.user.username = '';
                }
            }
            
            this.auth = function(){
                $scope.message = null;
                if($scope.action === 'signup'){
                    var user = {
                        'email': $scope.user.email,
                        'password': window.btoa($scope.user.password),
                        'username': $scope.user.username
                    };
                    authService.createAccount(user, function(res, status){
                        var result = res.split(':')[1];
                        console.log(result);
                        switch(+result){
                            case 600:
                                $scope.message = 'Verification email sent. Follow instructions in email prior to loggin in.';
                                $scope.action = 'login';
                                break;
                            case 601:
                                $scope.message = 'Username already in use';
                                break;
                            case 602:
                                $scope.message = 'Email already in use';
                                break;
                            case 603:
                                $scope.message = 'Username & Email already in use. Come on, try to be original!';
                                break;
                            case 604:
                                $scope.message = 'Send verification email failed. Check to make sure the email is correct';
                                break;
                        }
                    }, function(res, status){
                         $scope.message = status + ': ' + res;
                    });
                }
                else if($scope.action === 'login'){
                    var user = {
                        'email': $scope.user.email,
                        'password': window.btoa($scope.user.password)
                    };
                    authService.validateOrAuth(user, function(res, status){
                        if(status !== 200)
                            $scope.message = status + ': ' + res;
                        else{
                            $scope.user.rememberMe === true ? $cookies.put('rememberMe', true) : $cookies.put('rememberMe', false);
                            if($scope.user.rememberMe === true){
                                $cookies.put('email', $scope.user.email);
                            }
                            else{
                                $cookies.remove('email');
                            }
                            $cookies.put('token', res.token);
                            $cookies.put('username', res.username);
                            $location.path('/home');
                        }
                    });
                }
            }
            
            this.doesMessageContainError = function(){
                if($scope.message.indexOf('Verification email sent') !== -1)
                    return true;
                return false;
            }
            
            /*$cookies.remove('token');
            $cookies.remove('email');
            $cookies.remove('password');
            $cookies.remove('username');
            $cookies.remove('rememberMe');*/
        }],
        controllerAs: 'loginController'
    };
});
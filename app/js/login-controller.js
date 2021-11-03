/**
 * @license TRIP - Trip Recording and Itinerary Planning application.
 * (c) 2016-2018 Frank Dean <frank@fdsd.co.uk>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
'use strict';

angular.module('myApp.login.controller', ['ngCookies'])

  .controller(
    'LoginCtrl',
    ['$scope',
     '$rootScope',
     '$log',
     '$location',
     'Storage',
     'Login',
     'jwtHelper',
     'StateService',
     function($scope, $rootScope, $log, $location, Storage, Login, jwtHelper, StateService) {
       $rootScope.pageTitle = null;
       var token;
       $scope.data = {};
       $scope.ajaxRequestError = {error: false};
       $scope.doLogin = function(parms) {
         StateService.reset();
         Login.save({},
                    {email: $scope.data.email,
                     password: $scope.data.password},
                    function(value) {
                      // success
                      if (value.resourceToken != null) {
                        Storage.setItem('id_token_maptile', value.resourceToken);
                      }
                      if (value.token !== undefined) {
                        Storage.setItem('id_token', value.token);
                        $location.path('/tracks');
                        try {
                          token = jwtHelper.decodeToken(value.token);
                        } catch (e) {
                          $log.error('Failure decoding token');
                        }
                        $rootScope.admin = token.uk_co_fdsd_trip_admin;
                        // try {
                        //   $log.debug('Token expires:', jwtHelper.getTokenExpirationDate(value.token));
                        // } catch (e) {
                        //   $log.error('Failure extracting expiration date from token');
                        // }
                      }
                    }, function(response) {
                      Storage.removeItem('id_token');
                      if (response.status === 400) {
                        $log.warn('Invalid login request: ', response.statusText);
                        $scope.ajaxRequestError = {unauthorized: true};
                      } else if (response.status === 401) {
                        $scope.ajaxRequestError = {unauthorized: true};
                        $log.warn('Login failed: ', response.statusText);
                      } else {
                        $log.warn('Error during login REST call: ', response.status, response.statusText);
                        $scope.ajaxRequestError = {
                          error: true,
                          status: response.status
                        };
                      }
                    });
       };
     }])

  .controller(
    'LogoutCtrl',
    ['$location', '$log', '$scope', '$rootScope', 'Storage', '$cookies',
     function($location, $log, $scope, $rootScope, Storage, $cookies) {
       Storage.removeItem('id_token');
       Storage.removeItem('id_token_maptile');
       $cookies.remove('TRIP-XSRF-TOKEN', {path: '/'});
       $rootScope.admin = undefined;
       $rootScope.tracks = undefined;
       $scope.admin = undefined;
       $location.path('/login');
     }])

  .controller(
    'AccountCtrl',
    ['$log', '$scope', '$location', 'StateService', 'TripLoggerSettingsUploadService',
     function($log, $scope, $location, StateService, UploadService) {
       var message = StateService.getMessage();
       if (message != null) {
         $scope.messages = {
           message: message
         };
         StateService.setMessage(null);
       }
       $scope.upload = function() {
         $scope.messages = {};
         UploadService.save({},
                            $scope.formData
                           ).$promise.then(function(value) {
                             $scope.messages.message = 'Upload succeeded';
                           }).catch(function(response) {
                             $log.error('Upload failed', response.status);
                             if (response.status === 401) {
                               $location.path('/login');
                             } else if (response.status === 400) {
                               $scope.messages.badRequest = {error: true};
                             } else if (response.status === 413) {
                               $scope.messages.fileTooBigError = {error: true};
                             } else {
                               $scope.messages = {error: true, status: response.status};
                             }
                           });
       };
     }])

  .controller(
    'ChangePasswordCtrl',
    ['$log', '$scope', '$location', 'UserPasswordChangeService', 'StateService',
     function($log, $scope, $location, UserPasswordChangeService, StateService) {
       $scope.changePassword = function() {
         if ($scope.form && $scope.form.$valid) {
           $scope.ajaxRequestError = {};
           UserPasswordChangeService.update(
             {
               current: $scope.data.current,
               password: $scope.data.password2
             }
           ).$promise.then(function() {
             // success
             StateService.setMessage('Password changed successfully');
             $location.path('/account');
             $location.search('');
           }).catch(function(response) {
             if (response.status === 401) {
               $location.path('/login');
               $location.search('');
             } else if (response.status === 400) {
               $scope.ajaxRequestError = {
                 error: false,
                 badRequest: true
               };
             } else {
               $scope.ajaxRequestError = {
                 error: true,
                 status: response.status
               };
             }
           });
         }
       };
       $scope.cancelEdit = function(form) {
         $location.path('/account');
         $location.search('');
       };
     }])

  .directive(
    'passwordStrength',
    ['zxcvbn', '$log', 'Storage', 'jwtHelper', '$q',
     function(zxcvbn, $log, Storage, jwtHelper, $q) {
       var token = jwtHelper.decodeToken(Storage.getItem('id_token'));
       var userId = token.sub;
       return {

         restrict: 'AC',

         require: 'ngModel',

         link: function($scope, $element, $attrs, ngModelCtrl) {
           $element.on('change blur paste keyup', function(event) {
             var result, len, pwd = $element.val();
             result = pwd && pwd.length > 0 ? (zxcvbn.analyze(pwd, [userId, 'trip', 'fdsd']) || 0) : null;
             if (result) {
               $scope.passwordStrength = result.score;
               $scope.crackTime = result.crack_times_seconds.online_no_throttling_10_per_second;
               $scope.crackTimeText = result.crack_times_display.online_no_throttling_10_per_second;
               $scope.feedback = result.feedback;
               $scope.percent = $scope.passwordStrength ? Math.round(80 / 4 * $scope.passwordStrength) : null;
               if (pwd && pwd.length > 0) {
                 len = pwd.length > 9 ? 9 : pwd.length;
                 $scope.percent += Math.round(20 / 9 * len);
               }
             } else {
               $scope.passwordStrength = null;
               $scope.crackTimeText = null;
               $scope.crackTime = null;
               $scope.feedback = null;
               $scope.percent = null;
             }
             ngModelCtrl.$setValidity('passwordStrength', $scope.passwordStrength >= 2);
             $scope.$apply();
           });
         }
       };
     }]);

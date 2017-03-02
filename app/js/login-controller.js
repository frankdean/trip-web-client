/**
 * @license TRIP - Trip Recording and Itinerary Planning application.
 * (c) 2016, 2017 Frank Dean <frank@fdsd.co.uk>
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

angular.module('myApp.login.controller', [])

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
       $scope.data = {};
       $scope.ajaxRequestError = {error: false};
       $scope.doLogin = function(parms) {
         StateService.reset();
         Login.save({},
                    {email: $scope.data.email,
                     password: $scope.data.password},
                    function(value) {
                      // success
                      if (value.token !== undefined) {
                        Storage.setItem('id_token', value.token);
                        $location.path('/tracks');
                        var token = jwtHelper.decodeToken(value.token);
                        $rootScope.admin = token.admin;
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
    ['$location', '$log', '$scope', '$rootScope', 'Storage',
     function($location, $log, $scope, $rootScope, Storage) {
       Storage.removeItem('id_token');
       $rootScope.admin = undefined;
       $rootScope.tracks = undefined;
       $scope.admin = undefined;
       $location.path('/login');
     }]);


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

angular.module('myApp.admin.password.reset.controller', [])

  .controller(
    'AdminPasswordResetCtrl',
    ['$scope',
     '$location',
     '$routeParams',
     'UserService',
     'PasswordService',
     '$log',
     function($scope, $location, $routeParams, UserService, PasswordService, $log) {
       $scope.data = {};
       $scope.master = {};
       var id = $routeParams !== undefined ? decodeURIComponent($routeParams.id) : undefined;
       if (id) {
         UserService.get({},
                         {id: $routeParams.id})
           .$promise.then(function(user) {
             $scope.data.id = user.id;
             $scope.data.nickname = user.nickname;
             $scope.data.email = user.email;
             $scope.data.firstname = user.firstname;
             $scope.data.lastname = user.lastname;
             $scope.master = angular.copy($scope.data);
           }).catch(function(response) {
             if (response.status === 401) {
               $location.path('/login');
             } else {
               $scope.ajaxRequestError = {
                 error: true,
                 status: response.status
               };
               $log.warn('Error fetching user:', response.status, response.statusText);
             }
           });
       }
       $scope.resetPassword = function(form) {
         if ($scope.form && $scope.form.$valid) {
           PasswordService.resetPassword({},
                                         {id: $scope.data.id,
                                          password: $scope.data.password,
                                          email: $scope.data.email
                                         }).$promise.then(function(value) {
                                           // success
                                           $location.path('/users');
                                           $location.search('');
                                         }).catch(function(response) {
                                           $scope.ajaxRequestError = {
                                             error: true,
                                             status: response.status
                                           };
                                           if (response.status === 401) {
                                             $location.path('/login');
                                           }
                                         });
         }
       };
       $scope.cancelEdit = function(form) {
         $location.path('/users');
         $location.search('');
       };
     }]);

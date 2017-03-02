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

angular.module('myApp.user.edit.controller', [])

  .controller(
    'UserEditCtrl',
    ['$scope',
     '$location',
     '$routeParams',
     'modalDialog',
     'UserService',
     '$log',
     function($scope, $location, $routeParams, modalDialog, UserService, $log) {
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
             $scope.data.admin = user.admin;
             $scope.master = angular.copy($scope.data);
           }).catch(function(response) {
             if (response.status === 401) {
               $location.path('/login');
             } else {
               $log.warn('Error fetching user:', response.status, response.statusText);
               $scope.ajaxRequestError = {
                 error: true,
                 status: response.status
               };
             }
           });
       }
       $scope.saveUser = function(form) {
         $scope.ajaxRequestError = {error: false};
         if ($scope.form && $scope.form.$valid) {
           UserService.save({},
                            {id: $scope.data.id,
                             nickname: $scope.data.nickname,
                             username: $scope.data.email,
                             firstname: $scope.data.firstname,
                             lastname: $scope.data.lastname,
                             admin: $scope.data.admin
                            }).$promise.then(function(value) {
                              // success
                              $location.path('/users');
                              $location.search('');
                            }).catch(function(response) {
                              if (response.status === 401) {
                                $location.path('/login');
                              } else {
                                $scope.ajaxRequestError = {
                                  error: true,
                                  status:response.status
                                };
                              }
                            });
         }
       };
       $scope.cancelEdit = function(form) {
         $scope.ajaxRequestError = {error: false};
         if (!form.$dirty || modalDialog.confirm('Cancel?') === true) {
           $location.path('/users');
           $location.search('');
         }
       };
       $scope.reset = function(form) {
         $scope.ajaxRequestError = {error: false};
         if (form && form.$dirty && modalDialog.confirm('Reset changes?')) {
           form.$setPristine();
           form.$setUntouched();
           $scope.data = angular.copy($scope.master);
         }
       };
     }]);

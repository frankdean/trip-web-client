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

angular.module('myApp.user.controller', [])

  .controller(
    'UserCtrl',
    ['$scope',
     '$log',
     '$location',
     'UserService',
     'PasswordResetService',
     function($scope, $log, $location, UserService, PasswordResetService) {
       $scope.data = {};
       $scope.master = {};
       $scope.search = {};
       $scope.criteria = {};
       $scope.state = {};
       $scope.criteria.field = 'nickname';
       $scope.criteria.type = 'exact';
       $scope.state.new = true;
       $scope.state.edit = false;
       $scope.state.passwordOnly = false;
       $scope.pageSize = 10;
       $scope.offset = 0;
       $scope.totalCount = 0;
       $scope.listUsers = function() {
         $scope.ajaxRequestError = {error: false};
         UserService.query(
           {page_size: $scope.pageSize,
            offset: $scope.offset,
            nickname: $scope.criteria.field === 'nickname' ? $scope.search.nickname : null,
            email: $scope.criteria.field === 'email' ? $scope.search.email : null,
            searchType: $scope.criteria.type
           }).$promise.then(function(users) {
             $scope.users = users;
             $scope.totalCount = $scope.users.count;
             if (users.payload.length === 0) {
               $scope.ajaxRequestError = {noresults: true};
             }
           }).catch(function(response) {
             $scope.users = undefined;
             if (response.status === 401) {
               $location.path('/login');
             } else {
               $log.warn('Error fetching itineraries:', response.status, response.statusText);
               $scope.ajaxRequestError = {
                 error: true,
                 status: response.status
               };
             }
           });
       };
       $scope.doPagingAction = function(text, page, pageSize, total) {
         $scope.formError = {editOnlyOne: false};
         $scope.ajaxRequestError = {error: false};
         $scope.offset = pageSize * (page - 1);
         $scope.listUsers();
       };
       $scope.clearForm = function() {
         $scope.ajaxRequestError = {error: false};
         $scope.ajaxRequestError = {error: false};
         $scope.data.id = undefined;
         $scope.data.nickname = undefined;
         $scope.data.username = undefined;
         $scope.data.password = undefined;
         $scope.data.password2 = undefined;
         $scope.data.firstname = undefined;
         $scope.data.lastname = undefined;
         $scope.master = angular.copy($scope.data);
       };
       $scope.showNewUserForm = function() {
         $scope.ajaxRequestError = {error: false};
         $scope.ajaxRequestError = {error: false};
         $scope.formError = {editOnlyOne: false};
         $scope.state.new = true;
         $scope.state.edit = true;
         $scope.state.passwordOnly = false;
       };
       $scope.searchUsers = function(search) {
         $scope.ajaxRequestError = {error: false};
         $scope.ajaxRequestError = {error: false};
         $scope.formError = {editOnlyOne: false};
         $scope.offset = 0;
         $scope.listUsers();
       };
       $scope.saveUser = function(form) {
         $scope.ajaxRequestError = {error: false};
         $scope.formError = {editOnlyOne: false};
         if ($scope.form && $scope.form.$valid) {
           if ($scope.state.passwordOnly) {
             PasswordResetService.save({},
                                       {
                                         email: $scope.data.username,
                                         password: $scope.data.password
                                       })
               .$promise.then(function() {
               }).catch(function(response) {
                 $log.error('Error resetting password');
                 $scope.ajaxRequestError = {
                   error: true,
                   status: response.status
                 };
               });
           } else {
             UserService.save({},
                              {id: $scope.data.id,
                               nickname: $scope.data.nickname,
                               username: $scope.data.username,
                               password: $scope.data.password,
                               firstname: $scope.data.firstname,
                               lastname: $scope.data.lastname
                              }).$promise.then(function(value) {
                                // success
                                $scope.clearForm();
                                $scope.state.edit = false;
                                if (form) {
                                  form.$setPristine();
                                  form.$setUntouched();
                                }
                              }).catch(function(response) {
                                if (response.status === 401) {
                                  $location.path('/login');
                                } else if (response.status === 400) {
                                  $scope.ajaxRequestError = {
                                    badRequest: true
                                  };
                                } else {
                                  $scope.ajaxRequestError = {
                                    error: true,
                                    status:response.status
                                  };
                                }
                              });
           }
         }
       };
       var getSelectedUser = function(form) {
         var selectedItem, count = 0;
         $scope.formError = {editOnlyOne: false};
         $scope.users.payload.forEach(function(item, index, array) {
           if (item.selected) {
             selectedItem = item;
             count++;
           }
         });
         if (count > 1) {
           $scope.formError = {editOnlyOne: true};
           return null;
         }
         return selectedItem;
       };
       $scope.delete = function(form) {
         $scope.ajaxRequestError = {error: false};
         var selectedItem = getSelectedUser(form);
         if (selectedItem) {
           UserService.delete({}, {id: selectedItem.id}).$promise.then(function() {
             $scope.listUsers();
           }).catch(function(response) {
             $log.warn('Delete user failed');
             $scope.ajaxRequestError = {
               error: true,
               status:response.status
             };
           });
         }
       };
       $scope.edit = function(form) {
         $scope.ajaxRequestError = {error: false};
         var selectedItem = getSelectedUser(form);
         if (selectedItem) {
           $location.path('/edit-user');
           $location.search({id: encodeURIComponent(selectedItem.id)});
         }
       };
       $scope.editPassword = function(form) {
         $scope.ajaxRequestError = {error: false};
         var selectedItem = getSelectedUser(form);
         if (selectedItem) {
           $location.path('/admin-password-reset');
           $location.search({id: encodeURIComponent(selectedItem.id)});
         }
       };
       $scope.cancelEdit = function(form) {
         $scope.ajaxRequestError = {error: false};
         $scope.formError = {editOnlyOne: false};
         $scope.state.edit = false;
         $scope.clearForm();
         if (form) {
           form.$setPristine();
           form.$setUntouched();
         }
       };
       $scope.reset = function(form) {
         $scope.ajaxRequestError = {error: false};
         $scope.formError = {editOnlyOne: false};
         form.$setPristine();
         form.$setUntouched();
         $scope.data = angular.copy($scope.master);
       };
     }]);

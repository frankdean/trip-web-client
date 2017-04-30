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

angular.module('myApp.shares.controller', [])

  .controller(
    'SharesCtrl',
    ['$scope',
     '$log',
     '$location',
     'SharesService',
     function($scope, $log, $location, SharesService) {
       $scope.data = {};
       $scope.master = {};
       $scope.selectAllCheckbox = false;
       $scope.pageSize = 10;
       $scope.offset = 0;
       $scope.totalCount = 0;
       $scope.data.state = {new: true};
       $scope.master = angular.copy($scope.data);
       $scope.listShares = function() {
         $scope.ajaxRequestError = {error: false};
         $scope.shares = SharesService.query(
           {page_size: $scope.pageSize,
            offset: $scope.offset},
           function(data) {
             // success
             $scope.selectAllCheckbox = false;
             $scope.totalCount = $scope.shares.count;
             $scope.ajaxRequestError = {error: false};
           },
           function(response) {
             $scope.ajaxRequestError = {
               error: true,
               status: response.status
             };
             if (response.status === 401) {
               $location.path('/login');
             } else if (response.status === 400) {
               $log.warn('Invalid request fetching shares:', response.statusText);
             } else {
               $log.warn('Error fetching shares:', response.status, response.statusText);
             }
           }
         );
       };
       $scope.listShares();
       $scope.reset = function(form) {
         $scope.ajaxRequestError = {error: false};
         if (form) {
           form.$setPristine();
           form.$setUntouched();
         }
         $scope.data = angular.copy($scope.master);
       };
       $scope.new = function(form) {
         $scope.ajaxRequestError = {error: false};
         $scope.data = {state: {new: true}};
         $scope.master = angular.copy($scope.data);
         if (form) {
           form.$setPristine();
           form.$setUntouched();
         }
       };
       $scope.DoPagingAction = function(text, page, pageSize, total) {
         $scope.offset = pageSize * (page - 1);
         $scope.listShares();
       };
       $scope.saveShares = function(type) {
         $scope.ajaxRequestError = {error: false};
         SharesService.update({},
                              {updateType: type,
                               shares: $scope.shares.payload},
                              function() {
                                $scope.listShares();
                              },
                              function(response) {
                                $log.warn('save shares failed for action:', type);
                                if (response.status === 401) {
                                  $location.path('/login');
                                } else if (response.status === 400) {
                                  $scope.ajaxRequestError = {invalidNickname: true};
                                } else {
                                  $scope.ajaxRequestError = {
                                    error: true,
                                    status: response.status
                                  };
                                }
                              });
       };
       $scope.delete = function() {
         var dirty = false;
         $scope.ajaxRequestError = {error: false};
         $scope.shares.payload.forEach(function(item, index, array) {
           if (item.selected) {
             item.deleted = true;
             dirty = true;
           }
         });
         if (dirty) {
           $scope.saveShares('delete');
         }
       };
       $scope.activate = function() {
         var dirty = false;
         $scope.ajaxRequestError = {error: false};
         $scope.shares.payload.forEach(function(item, index, array) {
           if (item.selected && !item.active) {
             item.active = true;
             dirty = true;
           }
         });
         if (dirty) {
           $scope.saveShares('activeStateChange');
         }
       };
       $scope.deactivate = function() {
         var dirty = false;
         $scope.ajaxRequestError = {error: false};
         $scope.shares.payload.forEach(function(item, index, array) {
           if (item.selected && item.active) {
             item.active = false;
             dirty = true;
           }
         });
         if (dirty) {
           $scope.saveShares('activeStateChange');
         }
       };
       $scope.markAllShares = function() {
         $scope.ajaxRequestError = {error: false};
         $scope.shares.payload.forEach(function(item, index, array) {
           item.selected = $scope.selectAllCheckbox;
         });
       };
       $scope.clearSelectAllCheckbox = function() {
         $scope.ajaxRequestError = {error: false};
         $scope.selectAllCheckbox = false;
       };
       $scope.save = function() {
         $scope.ajaxRequestError = {error: false};
         SharesService.save(
           {},
           {nickname: $scope.data.nickname,
            recentDays: $scope.data.recentDays,
            recentHours: $scope.data.recentHours,
            recentMinutes: $scope.data.recentMinutes,
            maximumDays: $scope.data.maxDays,
            maximumHours: $scope.data.maxHours,
            maximumMinutes: $scope.data.maxMinutes,
            active: $scope.data.active
           },
           function() {
             $scope.master = angular.copy($scope.data);
             $scope.listShares();
           },
           function(response) {
             $log.warn('Save shares failed');
             if (response.status === 401) {
               $location.path('/login');
             } else if (response.status === 400) {
               $scope.ajaxRequestError = {invalidNickname: true};
             } else {
               $scope.ajaxRequestError = {
                 error: true,
                 status: response.status
               };
             }
           });
       };
       $scope.edit = function(form) {
         var selectedItem, count = 0;
         $scope.ajaxRequestError = {error: false};
         $scope.formError = {editOnlyOne: false};
         $scope.shares.payload.forEach(function(item, index, array) {
           if (item.selected) {
             selectedItem = item;
             count++;
           }
         });
         if (count > 1) {
           $scope.formError = {editOnlyOne: true};
           return;
         }
         if (selectedItem) {
           $scope.data.state.new = false;
           $scope.data.nickname = selectedItem.nickname;
           $scope.data.recentDays = selectedItem.recentDays;
           $scope.data.recentHours = selectedItem.recentHours;
           $scope.data.recentMinutes = selectedItem.recentMinutes;
           $scope.data.maxDays = selectedItem.maximumDays;
           $scope.data.maxHours = selectedItem.maximumHours;
           $scope.data.maxMinutes = selectedItem.maximumMinutes;
           $scope.data.active = selectedItem.active;
           $scope.master = angular.copy($scope.data);
           if (form) {
             form.$setPristine();
             form.$setUntouched();
           }
         }
       };
     }]);

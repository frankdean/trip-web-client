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

angular.module('myApp.itinerary.sharing.controller', [])

  .controller(
    'ItinerarySharingCtrl',
    ['$scope',
     '$routeParams',
     '$log',
     '$location',
     'modalDialog',
     'ItinerarySharingService',
     function($scope, $routeParams, $log, $location, modalDialog, ItinerarySharingService) {
       $scope.itineraryId = $routeParams.id !== undefined ? decodeURIComponent($routeParams.id) : undefined;
       $scope.routing = $routeParams.routing !== undefined ? decodeURIComponent($routeParams.routing) : undefined;
       $scope.data = {};
       $scope.master = {};
       $scope.selectAllCheckbox = false;
       $scope.pageSize = 10;
       $scope.offset = 0;
       $scope.totalCount = 0;
       $scope.data.state = {new: undefined};
       $scope.master = angular.copy($scope.data);
       $scope.ajaxRequestError = {error: false};
       $scope.listItineraryShares = function() {
         $scope.ajaxRequestError = {error: false};
         $scope.shares = ItinerarySharingService.query(
           {id: $scope.itineraryId,
            page_size: $scope.pageSize,
            offset: $scope.offset},
           function(data) {
             $scope.totalCount = $scope.shares.count;
           }).$promise.then(function(itineraryShares) {
             $scope.selectAllCheckbox = false;
             $scope.shares = itineraryShares;
             $scope.totalCount = itineraryShares.count;
             if (itineraryShares.count === '0') {
               $scope.data.state = {new: true};
             }
           }).catch(function(response) {
             $scope.ajaxRequestError = {
               error: true,
               status: response.status
             };
             if (response.status === 401) {
               $location.path('/login');
             } else if (response.status === 400) {
               $log.warn('Invalid request fetching itinerary shares', response.statusText);
             } else {
               $log.warn('Error fetching itinerary shares:', response.status, response.statusText);
             }
           });
       };
       $scope.listItineraryShares();
       $scope.cancel = function(form) {
         if ($scope.routing === 'itinerary-sharing-report') {
           $location.path('/itinerary-sharing-report');
           $location.search('');
         } else {
           $location.path('/itinerary');
           $location.search({id: encodeURIComponent($scope.itineraryId)});
         }
       };
       $scope.showItinerary = function(form) {
         $location.path('/itinerary');
         $location.search({id: encodeURIComponent($scope.itineraryId)});
       };
       $scope.cancelEdit = function(form) {
         $scope.ajaxRequestError = {error: false};
         if (!form.$dirty || modalDialog.confirm('Cancel?') === true) {
           form.$setPristine();
           form.$setUntouched();
           if ($scope.data.state.new && ($scope.shares === undefined || $scope.shares.count === '0')) {
             // There is nothing to display, so close the form.
             $scope.cancel();
           } else {
             $scope.clearForm();
           }
         }
       };
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
         $scope.formError = {editOnlyOne: false};
         if (form) {
           form.$setPristine();
           form.$setUntouched();
         }
       };
       $scope.doPagingAction = function(text, page, pageSize, total) {
         $scope.offset = pageSize * (page - 1);
         $scope.listItineraryShares();
       };
       $scope.clearForm = function() {
         $scope.data.nickname = undefined;
         $scope.data.active = undefined;
         $scope.data.state.new = undefined;
       };
       $scope.save = function(form) {
         $scope.ajaxRequestError = {error: false};
         if ($scope.form && $scope.form.$valid) {
           ItinerarySharingService.save({},
                                        {id: $scope.itineraryId,
                                         nickname: $scope.data.nickname,
                                         active: $scope.data.active
                                        }).$promise.then(function(value) {
                                          $scope.clearForm();
                                          if (form) {
                                            form.$setPristine();
                                            form.$setUntouched();
                                          }
                                          $scope.ajaxRequestError = {error: false};
                                          $scope.listItineraryShares();
                                        }).catch(function(response) {
                                          if (response.status === 401) {
                                            $location.path('/login');
                                          } else if (response.status === 400) {
                                            $scope.ajaxRequestError = {
                                              saveFailed: true,
                                              status: response.status
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
       $scope.saveShares = function(type) {
         $scope.ajaxRequestError = {error: false};
         ItinerarySharingService.update(
           {},
           {updateType: type,
            id: $scope.itineraryId,
            shares: $scope.shares.payload
           }).$promise.then(
             function() {
               $scope.listItineraryShares();
             }).catch(
               function(response) {
                 $log.warn('save itinerary shares failed for action:', type);
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
         $scope.formError = {editOnlyOne: false};
         if (modalDialog.confirm('Delete the selected itinerary shares?') === true) {
           $scope.shares.payload.forEach(function(item, index, array) {
             if (item.selected) {
               item.deleted = true;
               dirty = true;
             }
           });
           if (dirty) {
             $scope.saveShares('delete');
           }
         }
       };
       $scope.activate = function() {
         var dirty = false;
         $scope.ajaxRequestError = {error: false};
         $scope.formError = {editOnlyOne: false};
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
         $scope.formError = {editOnlyOne: false};
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
           $scope.data.active = selectedItem.active;
           $scope.master = angular.copy($scope.data);
           if (form) {
             form.$setPristine();
             form.$setUntouched();
           }
         }
       };
     }]);


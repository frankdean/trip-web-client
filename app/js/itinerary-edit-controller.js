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

angular.module('myApp.itinerary.edit.controller', [])

  .controller(
    'ItineraryEditCtrl',
    ['$scope',
     '$routeParams',
     '$log',
     '$location',
     '$window',
     'ItineraryService',
     'UtilsService',
     function ($scope,
               $routeParams,
               $log,
               $location,
               $window,
               ItineraryService,
               UtilsService) {
       $scope.data = {};
       $scope.master = {};
       $scope.markdownHelp = function() {
         $window.open("http://daringfireball.net/projects/markdown/syntax", "_blank");
       };
       $scope.state = {new: true, edit: true};
       $scope.formError = {editOnlyOne: false};
       $scope.itineraryId = $routeParams.id !== undefined ? decodeURIComponent($routeParams.id) : undefined;
       if ($scope.itineraryId) {
         $scope.state = {new: false, edit: false};
         ItineraryService.get({id: $scope.itineraryId})
           .$promise.then(function(itinerary) {
             $scope.data.id = itinerary.id;
             $scope.data.owned_by_nickname = itinerary.owned_by_nickname;
             $scope.data.shared_to_nickname = itinerary.shared_to_nickname;
             $scope.data.start = itinerary.start ? new Date(itinerary.start) : null;
             $scope.data.finish = itinerary.finish ? new Date(itinerary.finish) : null;
             $scope.data.title = itinerary.title;
             $scope.data.description = itinerary.description;
             $scope.master = angular.copy($scope.data);
             $scope.form.$setPristine();
             $scope.form.$setUntouched();
           }).catch(function(response) {
             $scope.ajaxRequestError = {
               error: true,
               status: response.status
             };
             if (response.status === 401) {
               $location.path('/login');
             } else {
               $log.warn('Error fetching itinerary:', response.status, response.statusText);
             }
           });
       }
       $scope.cancel = function(form) {
         // It we're creating a new itinerary, return to the itineraries list page
         if (!$scope.itineraryId) {
           $location.path('/itineraries');
           $location.search('');
         } else {
           $location.path('/itinerary');
           $location.search({id: encodeURIComponent($scope.data.id)});
         }
       };
       $scope.reset = function(form) {
         if (form) {
           form.$setPristine();
           form.$setUntouched();
         }
         $scope.data = angular.copy($scope.master);
         $scope.formError = {editOnlyOne: false};
       };
       $scope.saveItinerary = function(data) {
         $scope.ajaxRequestError = {error: false};
         $scope.formError = {editOnlyOne: false};
         if ($scope.form && $scope.form.$valid) {
           ItineraryService.save({},
                                 {
                                   id: data.id,
                                   start: data.start,
                                   finish: data.finish,
                                   title: data.title,
                                   description: data.description
                                 }).$promise.then(function(value) {
                                   // success
                                   if (data.id === undefined && value.id) {
                                     $scope.data.id = value.id;
                                   }
                                   $scope.master = angular.copy($scope.data);
                                   if ($scope.form) {
                                     $scope.form.$setPristine();
                                     $scope.form.$setUntouched();
                                   }
                                   $location.path('/itinerary');
                                   $location.search({id: encodeURIComponent($scope.data.id)});
                                 }).catch(function(response) {
                                   // failure
                                   $log.warn('Failed to create itinerary');
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
       $scope.delete = function(data) {
         $scope.formError = {editOnlyOne: false};
         ItineraryService.delete({}, {id: data.id}).$promise.then(function() {
           // success;
           $location.path('/itineraries');
           $location.search('');
         }).catch(function(response) {
           $log.warn('Delete failed');
         });
       };
     }]);

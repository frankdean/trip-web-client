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

angular.module('myApp.itinerary.track.name.controller', [])

  .controller(
    'ItineraryTrackNameCtrl',
    ['$rootScope', '$scope',
     '$routeParams',
     '$location',
     'ItineraryTrackNameService',
     'PathColorService',
     '$log',
     function($rootScope, $scope,
              $routeParams,
              $location,
              ItineraryTrackNameService,
              PathColorService,
              $log) {
       $rootScope.pageTitle = null;
       $scope.data = {};
       $scope.master = {};
       $scope.itineraryId = $routeParams.itineraryId !== undefined ? decodeURIComponent($routeParams.itineraryId) : undefined;
       $scope.trackId = $routeParams.trackId !== undefined ? decodeURIComponent($routeParams.trackId) : undefined;
       PathColorService.query()
         .$promise.then(function(colors) {
           $scope.colors = colors;
         }).catch(function(response) {
           $log.warn('Error fetching track colors', response.status, response.statusText);
           $scope.ajaxRequestError = {
             error: true,
             status: response.status
           };
         });
       if ($scope.trackId) {
         ItineraryTrackNameService.get({itineraryId: $scope.itineraryId, trackId: $scope.trackId})
           .$promise.then(function(track) {
             angular.extend($scope.data, track);
             $scope.master = angular.copy($scope.data);
           }).catch(function(response) {
             if (response.status === 401) {
               $location.path('/login');
             } else {
               $log.warn('Error fetching itinerary track:', response.status, response.statusText);
               $scope.ajaxRequestError = {
                 error: true,
                 status: response.status
               };
             }
           });
       } else {
         $log.warn('Warning - no track ID passed to request');
       }
       $scope.save = function(form) {
         if (form && form.$valid) {
           ItineraryTrackNameService.save({},
                                          {itineraryId: $scope.itineraryId,
                                           trackId: $scope.trackId,
                                           name: $scope.data.name,
                                           color: $scope.data.color
                                          })
             .$promise.then(function(value) {
               $location.path('/itinerary');
               $location.search({id: encodeURIComponent($scope.itineraryId)});
             }).catch(function(response) {
               $log.warn('Save itinerary track name failed');
               if (response.status === 401) {
                 $location.path('/login');
               } else {
                 $scope.ajaxRequestError = {
                   error: true,
                   status: response.status
                 };
               }
             });
         }
       };
       $scope.cancel = function(form) {
         $location.path('/itinerary');
         $location.search({id: encodeURIComponent($scope.itineraryId)});
       };
       $scope.reset = function(form) {
         $scope.ajaxRequestError = {error: false};
         form.$setPristine();
         form.$setUntouched();
         $scope.data = angular.copy($scope.master);
       };
     }]);

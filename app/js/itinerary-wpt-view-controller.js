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

angular.module('myApp.itinerary.wpt.view.controller', [])

  .controller(
    'ItineraryWaypointViewCtrl',
    ['$scope',
     '$routeParams',
     '$location',
     '$log',
     'UserPreferencesService',
     'WaypointSymbolService',
     'GeorefFormatService',
     'ItineraryWaypointService',
     function ($scope, $routeParams, $location, $log, UserPreferencesService,
               WaypointSymbolService, GeorefFormatService,
               itineraryWaypointService) {
       $scope.data = {};
       $scope.coordFormat = UserPreferencesService.getCoordFormat();
       $scope.positionFormat = UserPreferencesService.getPositionFormat();
       $scope.itineraryId = $routeParams.itineraryId !== undefined ? decodeURIComponent($routeParams.itineraryId) : undefined;
       $scope.wptId = $routeParams.waypointId !== undefined ? decodeURIComponent($routeParams.waypointId) : undefined;
       WaypointSymbolService.query()
         .$promise.then(function(symbols) {
           $scope.symbols = symbols;
         }).catch(function(response) {
           $log.warn('Error fetching waypoint symbols', response.status, response.statusText);
           $scope.ajaxRequestError = {
             error: true,
             status: response.status
           };
         });
       GeorefFormatService.query()
         .$promise.then(function(georefFormats) {
           $scope.georefFormats = georefFormats;
         }).catch(function(response) {
           $log.warn('Error fetching Georef Formats', response.status, response.statusText);
           $scope.ajaxRequestError = {
             error: true,
             status: response.status
           };
         });
       if ($scope.wptId) {
         itineraryWaypointService.get({id: $scope.itineraryId, wptId: $scope.wptId})
           .$promise.then(function(wpt) {
             var time = wpt.time ? new Date(wpt.time) : undefined;
             angular.extend($scope.data, wpt, {position: wpt.lat + ',' + wpt.lng}, {time: time});
           }).catch(function(response) {
             if (response.status === 401) {
               $location.path('/login');
             } else {
               $log.warn('Error fetching itinerary waypoint:', response.status, response.statusText);
               $scope.ajaxRequestError = {
                 error: true,
                 status: response.status
               };
             }
           });
       }
       $scope.close = function(form) {
         $location.path('/itinerary');
         $location.search({id: encodeURIComponent($scope.itineraryId)});
       };
       $scope.$on('TL_COORD_FORMAT_CHANGED', function(e, data) {
         if (data) {
           UserPreferencesService.setCoordFormat(data);
         }
       });
       $scope.$on('TL_POSITION_FORMAT_CHANGED', function(e, data) {
         if (data) {
           UserPreferencesService.setPositionFormat(data);
         }
       });
     }]);

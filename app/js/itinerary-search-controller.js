/**
 * @license TRIP - Trip Recording and Itinerary Planning application.
 * (c) 2016-2019 Frank Dean <frank@fdsd.co.uk>
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

angular.module('myApp.itinerary.search.controller', [])

  .controller(
    'ItinerarySearchCtrl',
    ['$scope',
     '$log',
     '$location',
     'UserPreferencesService', 
     'GeorefFormatService',
     'CopyAndPasteService',
     'ItineraryWaypointService',
     'StateService',
     function($scope,
              $log,
              $location,
              UserPreferencesService,
              GeorefFormatService,
              CopyAndPasteService,
              ItineraryWaypointService,
              StateService
             ) {
       $scope.data = {};
       $scope.coordFormat = UserPreferencesService.getCoordFormat();
       $scope.positionFormat = UserPreferencesService.getPositionFormat();
       GeorefFormatService.query()
         .$promise.then(function(georefFormats) {
           $scope.georefFormats = georefFormats;
         }).catch(function(response) {
           if (response.status === 401) {
             $location.path('/login');
             $location.search('');
           } else {
            $log.warn('Error fetching Georef Formats', response.status, response.statusText);
             $scope.ajaxRequestError = {
               error: true,
               status: response.status
             };
           }
         });
       $scope.canPaste = CopyAndPasteService.type == 'itinerary-features' || CopyAndPasteService.type == 'current-position';
       $scope.search = function(form) {
         if (form && form.$valid) {
           StateService.saveItinerarySearchResultsPage(1);
           $location.path('/itinerary-search-result');
           $location.search({lat: $scope.data.lat, lng: $scope.data.lng, distance: $scope.data.distance * 1000});
         }
       };
       $scope.pasteWaypoint = function() {
         var options = CopyAndPasteService.paste();
         if (CopyAndPasteService.type == 'itinerary-features') {
           if (options.waypoints && options.waypoints.length > 0) {
             ItineraryWaypointService.getSpecifiedWaypoints(
               {id: options.itineraryId,
                waypoints: options.waypoints})
               .$promise.then(function(waypoints) {
                 if (waypoints.length > 0) {
                   $scope.data.position = waypoints[0].lat.toFixed(6) + ',' + waypoints[0].lng.toFixed(6);
                 }
               }).catch(function(response) {
                 $log.error('Fetch waypoints failed');
                 $scope.ajaxRequestError = {
                   error: true,
                   status: response.status
                 };
                 if (response.status === 401) {
                   $location.path('/login');
                 } else if (response.status === 400) {
                   $log.warn('Invalid request for pasting itinerary waypoints: ', response.statusText);
                 } else {
                   $log.warn('Error fetching itinerary waypoints for paste: ', response.status, response.statusText);
                 }
               });
           }
         } else if (CopyAndPasteService.type == 'current-position') {
           options = CopyAndPasteService.paste();
           $scope.data.position = options.latitude.toFixed(6) + ',' + options.longitude.toFixed(6);
         } else {
           $log.debug('Unexpected paste request for ', CopyAndPasteService.type, ' type and options of ', CopyAndPasteService.paste());
         }
       };
     }]);

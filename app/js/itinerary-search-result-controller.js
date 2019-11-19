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

angular.module('myApp.itinerary.search.result.controller', [])

  .controller(
    'ItinerarySearchResultCtrl',
    ['$rootScope', '$scope',
     '$log',
     '$location',
     '$routeParams',
     'StateService',
     'ItinerarySearchService',
     function($rootScope, $scope,
              $log,
              $location,
              $routeParams,
              StateService,
              ItinerarySearchService
             ) {
       $rootScope.pageTitle = null;
       var searchState, lat, lng, distance;
       $log.debug('Itinerary search results', $routeParams);
       lat = $routeParams.lat === undefined ? undefined : decodeURIComponent($routeParams.lat);
       lng = $routeParams.lng === undefined ? undefined : decodeURIComponent($routeParams.lng);
       distance = $routeParams.distance === undefined ? undefined : decodeURIComponent($routeParams.distance);
       if (lat !== undefined && lng !== undefined && distance !== undefined) {
         StateService.saveItinerarySearch({lat: lat, lng: lng, distance: distance});
       } else {
         searchState = StateService.getItinerarySearch();
         if (searchState !== undefined) {
           lat = searchState.lat;
           lng = searchState.lng;
           distance = searchState.distance;
         }
       }
       $scope.page = StateService.getItinerarySearchResultsPage();
       $scope.pageSize = 10;
       $scope.offset = $scope.page ? $scope.pageSize * ($scope.page -1) : 0;
       $scope.totalCount = 0;
       $scope.listItineraries = function () {
         ItinerarySearchService.query(
           {
             lat: lat,
             lng: lng,
             distance: distance,
             offset: $scope.offset,
             page_size: $scope.pageSize
           })
           .$promise.then(function(itineraries) {
             $scope.itineraries = itineraries;
             $scope.totalCount = $scope.itineraries.count;
             // Workaround to value being lost on returning to the page
             $scope.page = Math.floor($scope.offset / $scope.pageSize + 1);
             if (itineraries.payload.length === 0) {
               // Suggests page number is now higher than the number of results
               // Reset so that at least the next query will be correct
               $scope.offset = 0;
               $scope.page = 1;
               StateService.saveItinerarySearchResultsPage(1);
               if (itineraries.count > 0) {
                 // Repeat the query to get the first page
                 $scope.ajaxRequestError = {error: false};
                 ItinerarySearchService.query(
                   {
                     lat: lat,
                     lng: lng,
                     distance: distance,
                     offset: $scope.offset,
                     page_size: $scope.pageSize
                   })
                   .$promise.then(function(itineraries) {
                     $scope.itineraries = itineraries;
                     $scope.totalCount = $scope.itineraries.count;
                   }).catch(function(response) {
                     $scope.ajaxRequestError = {error: true};
                   });
               } // end query second attempt
             }
           }).catch(function(response) {
             if (response.status === 401) {
               $location.path('/login');
             } else {
               $scope.ajaxRequestError = {
                 error: true,
                 status: response.status
               };
               $log.warn('Error fetching itinerary search results:', response.status, response.statusText);
             }
           });
       };

       $scope.listItineraries();
       $scope.doPagingAction = function(text, page, pageSize, total) {
         $scope.offset = pageSize * (page - 1);
         StateService.saveItinerarySearchResultsPage(page);
         $scope.listItineraries();
       };
     }]);

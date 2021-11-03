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

angular.module('myApp.itineries.controller', [])

  .controller(
    'ItinerariesCtrl',
    ['$rootScope',
     '$scope',
     '$location',
     '$log',
     'ItineraryService',
     'StateService',
     function ($rootScope, $scope, $location, $log, ItineraryService, StateService) {
       $rootScope.pageTitle = null;
       $scope.page = StateService.getItinerariesPage();
       $scope.pageSize = 10;
       $scope.offset = $scope.page ? $scope.pageSize * ($scope.page -1) : 0;
       $scope.totalCount = 0;
       $scope.listItineraries = function() {
         $scope.ajaxRequestError = {error: false};
         ItineraryService.query(
           {page_size: $scope.pageSize,
            offset: $scope.offset},
           function(data) {
             $scope.itineraries = data;
             $scope.totalCount = $scope.itineraries.count;
             // Workaround to value being lost on returning to the page
             $scope.page = Math.floor($scope.offset / $scope.pageSize + 1);
             if (data.payload.length === 0) {
               // Suggests page number is now higher than the number of results
               // Reset so that at least the next query will be correct
               $scope.offset = 0;
               $scope.page = 1;
               StateService.saveItinerariesPage(1);
               if (data.count > 0) {
                 // Repeat the query to get the first page
                 $scope.ajaxRequestError = {error: false};
                 ItineraryService.query(
                   {page_size: $scope.pageSize,
                    offset: $scope.offset},
                   function(data) {
                     $scope.itineraries = data;
                     $scope.totalCount = $scope.itineraries.count;
                   },
                   function(response) {
                     $scope.ajaxRequestError = {error: true};
                     if (response.status === 400) {
                       $log.warn('Invalid request fetching itineraries', response.statusText);
                     } else {
                       $log.warn('Error fetching itineraries:', response.status, response.statusText);
                     }
                   }
                 );
               } // end query second attempt
             }
           },
           function(response) {
             $scope.ajaxRequestError = {error: true};
             if (response.status === 401) {
               $location.path('/login');
             } else if (response.status === 400) {
               $log.warn('Invalid request fetching itineraries', response.statusText);
             } else {
               $log.warn('Error fetching itineraries:', response.status, response.statusText);
             }
           }
         );
       };
       $scope.listItineraries();
       $scope.doPagingAction = function(text, page, pageSize, total) {
         $scope.page = page;
         $scope.offset = pageSize * (page - 1);
         StateService.saveItinerariesPage(page);
         $scope.listItineraries();
       };
       $scope.newItinerary = function() {
         $location.path('/itinerary-edit');
       };
       $scope.importItinerary = function() {
         $location.path('/itinerary-import');
       };
       $scope.showSharesReport = function() {
         $location.path('/itinerary-sharing-report');
       };
       $scope.showSearchPage = function() {
         $location.path('/itinerary-search');
       };
     }]);

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

angular.module('myApp.itinerary.sharing.report.controller', [])

  .controller(
    'ItinerarySharingReportCtrl',
    ['$scope',
     '$log',
     '$location',
     'StateService',
     'ItinerarySharingReportService',
     function($scope,
              $log,
              $location,
              StateService,
              ItinerarySharingReportService) {
       $scope.page = StateService.getItinerarySharingReportPage();
       $scope.pageSize = 10;
       $scope.offset = $scope.page ? $scope.pageSize * ($scope.page -1) : 0;
       $scope.totalCount = 0;
       $scope.listItineraries = function() {
         $scope.ajaxRequestError = {error: false};
         ItinerarySharingReportService.query(
           {page_size: $scope.pageSize,
            offset: $scope.offset})
           .$promise.then(function(result) {
             $scope.itineraries = result.payload;
             $scope.totalCount = result.count;
             // Workaround to value being lost on returning to the page
             $scope.page = Math.floor($scope.offset / $scope.pageSize + 1);
             if (result.payload.length === 0) {
               // Suggests page number is now higher than the number of results
               // Reset so that at least the next query will be correct
               $scope.offset = 0;
               $scope.page = 1;
               StateService.saveItinerarySharingReportPage(1);
               if (result.count > 0) {
                 // Repeat the query to get the first page
                 ItinerarySharingReportService.query(
                   {page_size: $scope.pageSize,
                    offset: $scope.offset})
                   .$promise.then(function(result) {
                     $scope.itineraries = result.payload;
                     $scope.totalCount = result.count;
                   }).catch(function(response) {
                     $scope.ajaxRequestError = {error: true, status: response.status};
                     if (response.status === 400) {
                       $log.warn('Invalid request fetching itinerary sharing report', response.statusText);
                     } else {
                       $log.warn('Error fetching itinerary sharing report:', response.status, response.statusText);
                     }
                   });
               } // end query second attempt
             }
           }).catch(function(response) {
             $scope.ajaxRequestError = {error: true, status: response.status};
             if (response.status === 401) {
               $location.path('/login');
             } else if (response.status === 400) {
               $log.warn('Invalid request fetching itinerary sharing report', response.statusText);
             } else {
               $log.warn('Error fetching itinerary sharing report:', response.status, response.statusText);
             }
           });
       };
       $scope.doPagingAction = function(text, page, pageSize, total) {
         $scope.offset = pageSize * (page - 1);
         StateService.saveItinerarySharingReportPage(page);
         $scope.listItineraries();
       };
       $scope.listItineraries();
     }]);

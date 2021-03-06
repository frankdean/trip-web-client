/**
 * @license TRIP - Trip Recording and Itinerary Planning application.
 * (c) 2016-2020 Frank Dean <frank@fdsd.co.uk>
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

angular.module('myApp.trackinfo.controller', [])

  .controller(
    'TrackerInfoCtrl',
    ['$rootScope', '$scope', '$log', '$location', 'ConfigService', 'TrackingUuid', 'TripLoggerSettingsDownload', 'SaveAs',
     function($rootScope, $scope, $log, $location, ConfigService, TrackingUuid, TripLoggerSettingsDownload, SaveAs) {
       $rootScope.pageTitle = null;
       $scope.now = Date.now();
       $scope.uuid = TrackingUuid.query(
         {},
         function(value) {
           // success
         },
         function(response) {
           // error
           if (response.status === 401) {
             $location.path('/login');
           } else {
             $log.warn('Error fetching current UUID ', response.status, response.statusText);
             $scope.ajaxRequestError = {
               error: true,
               status: response.status
             };
           }
         });
       $scope.osmAndTrackingUrlPrefix = ConfigService.getOsmAndTrackerUrlPrefix();
       $scope.gpsLoggerUrlPrefix = ConfigService.getGpsLoggerUrlPrefix();
       $scope.generateUuid = function() {
         $scope.ajaxRequestError = {error: false};
         TrackingUuid.update(
           {},
           function(value) {
             // success
             $scope.uuid = value;
             $scope.ajaxRequestMessage = {success: true};
             $scope.now = Date.now();
           },
           function(response) {
             // error
             if (response.status === 401) {
               $location.path('/login');
             } else {
               $log.warn('Error fetching updating UUID ', response.status, response.statusText);
               $scope.ajaxRequestError = {
                 error: true,
                 status: response.status
               };
             }
           });
       };
       $scope.downloadTripLoggerSettings = function() {
         $scope.ajaxRequestError = {error: false};
         TripLoggerSettingsDownload.download(
           {}).$promise.then(function(response) {
             // Only likely to happen in unit tests
             if (response.data && response.data.size > 0) {
               SaveAs(response.data, 'triplogger-settings.yaml');
             } else {
               $log.warn('Downloaded response contained no data');
             }
           }).catch(function(response) {
             if (response.status === 401) {
               $location.path('/login');
               $location.search('');
             } else {
               $scope.ajaxRequestError = {
                 error: true,
                 status: response.status
               };
               $log.warn('TripLogger settings download failed', response.status);
             }
           });
       };
     }]);


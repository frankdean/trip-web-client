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

angular.module('myApp.admin.system.status.controller', [])

  .controller(
    'SystemStatusCtrl',
    ['$rootScope', '$scope',
     '$log',
     'SystemStatusService',
     'TileMetricReportService',
     '$location',
     function($rootScope, $scope, $log, SystemStatusService, TileMetricReportService, $location) {
       $rootScope.pageTitle = null;
       $scope.data = {};
       SystemStatusService.get({})
         .$promise.then(function(status) {
           angular.extend($scope.data, status);
         }).catch(function(response) {
           if (response.status === 401) {
             $location.path('/login');
           } else {
             $log.error('Failure getting system status');
             $scope.ajaxRequestError = {
               error: true,
               status: response.status
             };
           }
         });
       TileMetricReportService.query({months: 13})
         .$promise.then(function(metrics) {
           metrics.forEach(function(v, i) {
             if (i < metrics.length -1) {
               v.monthlyUsage = v.cumulative_total - metrics[i + 1].cumulative_total;
             } else {
               v.monthlyUsage = v.cumulative_total;
             }
           });
           if (metrics.length > 12) {
             metrics.pop();
           }
           $scope.data.metrics = metrics;
         }).catch(function(response) {
           if (response.status === 401) {
             $location.path('/login');
           } else {
             $log.error('Failure getting tile metrics report', response);
             $scope.ajaxRequestError = {
               error: true,
               status: response.status
             };
           }
         });
     }]);

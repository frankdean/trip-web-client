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
    ['$scope',
     '$log',
     'SystemStatusService',
     '$location',
     function($scope, $log, SystemStatusService, $location) {
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
     }]);

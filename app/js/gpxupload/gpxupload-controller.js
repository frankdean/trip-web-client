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

angular.module('myApp.gpxupload.gpxupload-controller', [])

  .controller('GpxController', [
    '$scope', '$log', '$location', '$routeParams', 'gpxUploadService',
    function($scope, $log, $location, $routeParams, gpxUploadService) {
      $scope.itineraryId = $routeParams.id !== undefined ? decodeURIComponent($routeParams.id) : undefined;
      $scope.cancel = function() {
        $location.path('/itinerary');
        $location.search({id: encodeURIComponent($scope.itineraryId)});
      };
      $scope.upload = function() {
        $scope.ajaxRequestError =  {error: false};
        $scope.fileTooBigError = {error: false};
        $log.debug('itineraryId:', $scope.itineraryId);
        gpxUploadService.save({id: $scope.itineraryId},
                              $scope.formData
                              ).$promise.then(function(value) {
                                $log.debug('Upload succeeded');
                                $location.path('/itinerary');
                                $location.search({id: encodeURIComponent($scope.itineraryId)});
                              }).catch(function(response) {
                                $log.debug('Upload failed', response.status);
                                if (response.status === 401) {
                                  $location.path('/login');
                                } else if (response.status === 413) {
                                  $scope.fileTooBigError = {error: true};
                                } else {
                                  $scope.ajaxRequestError = {error: true, status: response.status};
                                }
                              });
      };
    }]);

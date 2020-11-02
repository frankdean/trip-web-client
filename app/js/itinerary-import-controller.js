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

angular.module('myApp.itinerary.import.controller', [])

  .controller('ItineraryImportController', [
    '$scope', '$location', '$log', 'ItineraryUploadService', '$timeout',
    function($scope, $location, $log, ItineraryUploadService, $timeout) {
      $scope.messages = {};
      $scope.ajaxRequestError = null;
      $scope.cancel = function() {
        $location.path('/itineraries');
        $location.search('');
      };
      $scope.upload = function() {
        $scope.ajaxRequestError =  {error: false};
        $scope.messages.fileTooBigError = null;
        $scope.messages.uploading = {ok: true};

        ItineraryUploadService.save({},
                                    $scope.formData
                                   ).$promise.then(function(value) {
                                     $location.path('/itinerary');
                                     $location.search({id: value.id});
                                   }).catch(function(response) {
                                     $log.error('Itinerary import failed', response);
                                     $scope.messages = {};
                                     if (response.status === 401) {
                                       $location.path('/login');
                                       $location.search('');
                                     } else if (response.status === 413) {
                                       $scope.messages.fileTooBigError = true;
                                     } else {
                                       $scope.ajaxRequestError = {error: true, status: response.status};
                                     }
                                   });
      };
    }
  ]);

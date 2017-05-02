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

angular.module('myApp.itinerary.route.name.controller', [])

  .controller(
    'ItineraryRouteNameCtrl',
    ['$scope',
     '$routeParams',
     '$location',
     'ItineraryRouteNameService',
     'ItineraryRouteService',
     'PathColorService',
     '$log',
     function($scope, $routeParams, $location, ItineraryRouteNameService, ItineraryRouteService, PathColorService, $log) {
       $scope.data = {};
       $scope.data.reverse = true;
       $scope.master = {};
       $scope.itineraryId = $routeParams.itineraryId !== undefined ? decodeURIComponent($routeParams.itineraryId) : undefined;
       $scope.routeId = $routeParams.routeId !== undefined ? decodeURIComponent($routeParams.routeId) : undefined;
       PathColorService.query()
         .$promise.then(function(colors) {
           $scope.colors = colors;
         }).catch(function(response) {
           $log.warn('Error fetching route colors', response.status, response.statusText);
           $scope.ajaxRequestError = {
             error: true,
             status: response.status
           };
         });
       if ($scope.routeId) {
         ItineraryRouteNameService.get({itineraryId: $scope.itineraryId, routeId: $scope.routeId})
           .$promise.then(function(route) {
             angular.extend($scope.data, route);
             $scope.master = angular.copy($scope.data);
           }).catch(function(response) {
             if (response.status === 401) {
               $location.path('/login');
             } else {
               $log.warn('Error fetching itinerary route:', response.status, response.statusText);
               $scope.ajaxRequestError = {
                 error: true,
                 status: response.status
               };
             }
           });
       }
       $scope.save = function(form) {
         $scope.ajaxRequestError = {error: false};
         if (form && form.$valid) {
           if (!$scope.data.copy) {
             ItineraryRouteNameService.save({},
                                            {itineraryId: $scope.itineraryId,
                                             routeId: $scope.routeId,
                                             name: $scope.data.name,
                                             color: $scope.data.color
                                            })
               .$promise.then(function(value) {
                 $location.path('/itinerary');
                 $location.search({id: encodeURIComponent($scope.itineraryId)});
               }).catch(function(response) {
                 $log.error('Save itinerary route name failed');
                 if (response.status === 401) {
                   $location.path('/login');
                 } else {
                   $scope.ajaxRequestError = {
                     error: true,
                     saveFailed: true,
                     status: response.status
                   };
                 }
               });
           } else {
             // Create a copy
             ItineraryRouteService.get(
               {},
               {id: $scope.itineraryId,
                routeId: $scope.routeId})
               .$promise.then(function(route) {
                 var newRoute = angular.copy(route);
                 newRoute.id = undefined;
                 newRoute.name = $scope.data.name;
                 newRoute.points.forEach(function(v) {
                   v.id = undefined;
                 });
                 if ($scope.data.reverse  && newRoute.points) {
                   newRoute.points.reverse();
                 }
                 ItineraryRouteService.save({},
                                            {id: $scope.itineraryId,
                                             name: newRoute.name,
                                             color: $scope.data.color,
                                             points: newRoute.points})
                   .$promise.then(function(result) {
                     $location.path('/itinerary');
                     $location.search({id: encodeURIComponent($scope.itineraryId)});
                   }).catch(function(response) {
                     $log.error('Saving route copy failed:', response);
                     $scope.ajaxRequestError = {
                       error: true,
                       status: response.status
                     };
                   });
               }).catch(function(fetchRouteFailed) {
                 $log.error('System error fetching route:', fetchRouteFailed);
                 $scope.ajaxRequestError = {error: true};
               });
           }
         }
       };
       $scope.cancel = function(form) {
         $scope.ajaxRequestError = {error: false};
         $location.path('/itinerary');
         $location.search({id: encodeURIComponent($scope.itineraryId)});
       };
       $scope.reset = function(form) {
         $scope.ajaxRequestError = {error: false};
         form.$setPristine();
         form.$setUntouched();
         $scope.data = angular.copy($scope.master);
       };
     }]);

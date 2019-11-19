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

angular.module('myApp.itinerary.route.join.controller', [])
  .controller(
    'ItineraryRouteJoinCtrl',
    ['$rootScope', '$scope',
     '$routeParams',
     '$log',
     '$location',
     'ItinerarySelectionService',
     'ItineraryRouteService',
     'PathColorService',
     'MapConfigService',
     'leafletBoundsHelpers',
     function($rootScope, $scope,
              $routeParams,
              $log,
              $location,
              ItinerarySelectionService,
              ItineraryRouteService,
              PathColorService,
              MapConfigService,
              leafletBoundsHelpers) {
       $rootScope.pageTitle = null;

       $scope.itineraryId = $routeParams.itineraryId !== undefined ? decodeURIComponent($routeParams.itineraryId) : undefined;
       var i, t, choices = ItinerarySelectionService.getChoices();
       if (choices) {
         if (choices.routes && choices.routes.length > 0) {
           angular.extend($scope, {
             data: {},
             autozoom: true,
             joinTracks: false,
             status: {
               showMap: false
             },
             map: {
               height: 240,
               status: {
                 showMap: false
               },
               controls: {
                 scale: {
                   position: "bottomright"
                 }
               },
               center: {zoom: 14},
               paths: []
             }
           });

           PathColorService.query()
             .$promise.then(function(colors) {
               $scope.colors = colors;
             }).catch(function(response) {
               $log.warn('Error fetching track colors', response.status, response.statusText);
               $scope.ajaxRequestError = {
                 error: true,
                 status: response.status
               };
             });

           MapConfigService.getMapLayers()
             .then(function(layers) {
               angular.extend($scope.map, {
                 layers: {
                   baselayers: layers
                 },
                 defaults: {
                   controls: {
                     layers: {
                       visible: (layers.length > 1),
                       position: 'topleft',
                       collapsed: true
                     }
                   },
                   maxZoom: 17
                 }
               });
               $scope.status.showMap = true;
             })
             .catch(function(error) {
               $log.error('Failed to get the map layer configuration: ', error);
               $scope.mapLayersError = {error: error};
             });

           ItineraryRouteService.getRoutes(
             {id: $scope.itineraryId,
              routes: choices.routes})
             .$promise.then(function(routes) {
               $scope.routes = routes;
               if (routes && routes.length > 0 && routes[0].name && routes[0].name.length > 0) {
                 $scope.data.name = routes[0].name + ' (joined)';
               }
               $scope.updateMap();
             }).catch(function(response) {
               $scope.ajaxRequestError = {
                 error: true,
                 status: response.status
               };
               if (response.status === 401) {
                 $location.path('/login');
               } else if (response.status === 400) {
                 $log.warn('Invalid request for itinerary routes: ', response.statusText);
               } else {
                 $log.warn('Error fetching itinerary routes: ', response.status, response.statusText);
               }
             });

         }
       } else {
         $log.warn('Display selection not set - no routes specified');
         $location.path('/itinerary');
         $location.search({id: encodeURIComponent($scope.itineraryId)});
       }

       $scope.updateMap = function() {
         var latlng, latlngs = [];
         $scope.map.paths = [];
         if ($scope.routes) {
           $scope.routes.forEach(function(route) {
             route.points.forEach(function(v) {
               latlng =  {lat: parseFloat(v.lat, 10), lng: parseFloat(v.lng, 10)};
               latlngs.push(latlng);
             });
             if (!$scope.joinRoutes) {
               $scope.map.paths.push({
                 color: route.htmlcolor ? route.htmlcolor : 'magenta',
                 opacity: 0.5,
                 weight: 4,
                 latlngs: latlngs
               });
               latlngs = [];
             }
           });
           if ($scope.autozoom) {
             var bounds = L.latLngBounds(latlngs);
             $scope.map.paths.forEach(function(p) {
               bounds.extend(p.latlngs);
             });
             if (bounds && bounds.isValid()) {
               $scope.map.bounds = leafletBoundsHelpers.createBoundsFromLeaflet(bounds);
               $scope.map.bounds.options = {maxZoom: 16};
             }
           }
           if ($scope.joinRoutes) {
             $scope.map.paths.push({
               color: 'magenta',
               opacity: 0.5,
               weight: 4,
               latlngs: latlngs
             });
           }
         }
       };

       $scope.up = function(routeId) {
         i = $scope.routes.findIndex(function(e) {
           return routeId === e.id;
         });
         if (i > -1) {
           t = $scope.routes.splice(i, 1);
           i--;
           if (i < 0) {
             $scope.routes.push(t[0]);
           } else {
             $scope.routes.splice(i, 0, t[0]);
           }
         }
         $scope.updateMap();
       };

       $scope.down = function(routeId) {
         i = $scope.routes.findIndex(function(e) {
           return routeId === e.id;
         });
         if (i > -1) {
           t = $scope.routes.splice(i, 1);
           i++;
           if (i > $scope.routes.length) {
             i = 0;
           }
           $scope.routes.splice(i, 0, t[0]);
         }
         $scope.updateMap();
       };

       $scope.join = function(form) {
         var newRoute = {
           id: $scope.itineraryId,
           name: $scope.data.name,
           color: $scope.data.color,
           points: []
         };
         $scope.routes.forEach(function(route) {
           route.points.forEach(function(point) {
             newRoute.points = newRoute.points.concat(point);
           });
         });

         ItineraryRouteService.save(
           newRoute)
           .$promise.then(function() {
             $location.path('/itinerary');
             $location.search({id: encodeURIComponent($scope.itineraryId)});
           }).catch(function(response) {
             $log.warn('Error creating new route:', response.status, response.statusText);
             $scope.ajaxRequestError = {
               error: true,
               status: response.status
             };
           });
       };

       $scope.cancel = function(form) {
         $location.path('/itinerary');
         $location.search({id: encodeURIComponent($scope.itineraryId)});
       };
     }]);

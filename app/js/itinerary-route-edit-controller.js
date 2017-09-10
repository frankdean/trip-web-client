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

angular.module('myApp.itinerary.route.edit.controller', [])


  .controller(
    'ItineraryRouteEditCtrl',
    ['$scope',
     '$routeParams',
     '$location',
     '$log',
     '$window',
     'ConfigService',
     'MapConfigService',
     'leafletBoundsHelpers',
     'ItineraryRouteService',
     function($scope,
              $routeParams,
              $location,
              $log,
              $window,
              ConfigService,
              MapConfigService,
              leafletBoundsHelpers,
              ItineraryRouteService) {
       $scope.itineraryId = $routeParams.itineraryId !== undefined ? decodeURIComponent($routeParams.itineraryId) : undefined;
       $scope.routeId = $routeParams.routeId !== undefined ? decodeURIComponent($routeParams.routeId) : undefined;
       $scope.shared = $routeParams.shared !== undefined ? decodeURIComponent($routeParams.shared) === "true" : false;
       $scope.pageSize = 10;
       $scope.offset = $scope.page ? $scope.pageSize * ($scope.page -1) : 0;
       $scope.totalCount = 0;
       $scope.data = {};
       $scope.data.autozoom = true;

       angular.extend($scope, {
         height: 240,
         status: {
           showMap: false
         },
         map: {
           controls: {
             scale: {
               position: "bottomright"
             }
           },
           center: {
             lat: 0,
             lng: 0,
             zoom: 2
           },
           bounds: {},
           markers: [],
           paths: []
         }
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

       $scope.updateRouteInfo = function() {
         ItineraryRouteService.get(
           {id: $scope.itineraryId,
            routeId: $scope.routeId
           }).$promise.then(function(routeInfo) {
             $scope.route = routeInfo;
           }).catch(function(response) {
             if (response.status === 401) {
               $location.path('/login');
             } else {
               $log.warn('Error fetching route info:', response.status, response.statusText);
               $scope.ajaxRequestError = {
                 error: true,
                 status: response.status
               };
             }
           });
       };

       $scope.showTrack = function() {
         $scope.map.paths.splice(0);
         ItineraryRouteService.getPoints(
           {id: $scope.itineraryId,
            routeId: $scope.routeId
           })
           .$promise.then(function(data) {
             var latlng, latlngs = new Array(data.points.length);
             data.points.forEach(function(v, index) {
               latlng =  {lat: parseFloat(v.lat, 10), lng: parseFloat(v.lng, 10)};
               latlngs[index] = latlng;
             });
             if ($scope.data.autozoom) {
               var bounds = L.latLngBounds(latlngs);
               $scope.map.paths.forEach(function(p) {
                 bounds.extend(p.latlngs);
               });
               if (bounds && bounds.isValid()) {
                 $scope.map.bounds = leafletBoundsHelpers.createBoundsFromLeaflet(bounds);
                 $scope.map.bounds.options = {maxZoom: 16};
               }
             }
             $scope.map.paths.push({
               color: $scope.route && $scope.route.color ? $scope.route.color : 'magenta',
               opacity: 0.5,
               weight: 4,
               latlngs: latlngs
             });
           }).catch(function(response) {
             if (response.status === 401) {
               $location.path('/login');
             } else {
               $log.warn('Error fetching route info:', response.status, response.statusText);
               $scope.ajaxRequestError = {
                 error: true,
                 status: response.status
               };
             }
           });
       };

       $scope.listPoints = function() {
         $scope.map.markers.splice(0);
         ItineraryRouteService.getPoints(
           {id: $scope.itineraryId,
            routeId: $scope.routeId,
            page_size: $scope.pageSize,
            offset: $scope.offset
           })
           .$promise.then(function(data) {
             $scope.data.points = data.points;
             $scope.totalCount = data.count;
             if ($scope.data.selectAll) {
               $scope.selectAll();
             }
           }).catch(function(response) {
             if (response.status === 401) {
               $location.path('/login');
             } else {
               $log.warn('Error fetching route info:', response.status, response.statusText);
               $scope.ajaxRequestError = {
                 error: true,
                 status: response.status
               };
             }
           });
       };

       $scope.updateRouteInfo();
       $scope.listPoints();
       $scope.showTrack();

       $scope.doPagingAction = function(text, page, pageSize, total) {
         $scope.formError = undefined;
         $scope.offset = pageSize * (page - 1);
         $scope.listPoints();
       };
       $scope.cancel = function(form) {
         $location.path('/itinerary');
         $location.search({
           id: encodeURIComponent($scope.itineraryId)
         });
       };
       $scope.selectAll = function(form) {
         $scope.formError = undefined;
         $scope.map.markers.splice(0);
         $scope.data.points.forEach(function(v) {
           v.selected = $scope.data.selectAll;
           $scope.showMarker(v);
         });
       };
       $scope.removeMarker = function(pointId) {
         var i = $scope.map.markers.findIndex(function(v) {
           return (v.tripPointId === pointId);
         });
         if (i > -1) {
           $scope.map.markers.splice(i, 1);
         }
       };
       $scope.showMarker = function(point) {
         var msg;
         if (point.selected) {
           if ($scope.data.autozoom) {
             var bounds = L.latLngBounds({lat: point.lat, lng: point.lng});
             $scope.map.markers.forEach(function(p) {
               bounds.extend({lat: p.lat, lng: p.lng});
             });
             if (bounds && bounds.isValid()) {
               $scope.map.bounds = leafletBoundsHelpers.createBoundsFromLeaflet(bounds);
               $scope.map.bounds.options = {maxZoom: 16};
             } else {
               if ($scope.points) {
                 $scope.points.forEach(function(v) {
                   bounds.extend({lat: v.lat, lng: v.lng});
                   if (bounds.isValid()) {
                     $scope.map.bounds = leafletBoundsHelpers.createBoundsFromLeaflet(bounds);
                     $scope.map.bounds.options = {maxZoom: 16};
                   }
                 });
               }
             }
           }
           msg = 'ID: ' + point.id;
           $scope.map.markers.push(
             {tripPointId: point.id,
              lat: point.lat,
              lng: point.lng,
              icon: ConfigService.getDefaultMarkerIcon(),
              message: msg
             });
         } else {
           $scope.removeMarker(point.id);
         }
       };

       $scope.deletePoints = function(form) {
         var selectedPoints = [],
             selectedCount = 0;
         $scope.formError = undefined;
         $scope.data.points.forEach(function(v) {
           if (v.selected) {
             selectedCount++;
             selectedPoints.push(v.id);
             $scope.removeMarker(v.id);
           }
         });
         if ($scope.totalCount - $scope.offset - selectedCount < 1) {
           // If we've deleted all the items on the last page, decrement the page number
           if ($scope.offset > $scope.pageSize) {
             $scope.offset -= $scope.pageSize;
           } else {
             $scope.offset = 0;
           }
         }
         ItineraryRouteService.deletePoints(
           {id: $scope.itineraryId,
            routeId: $scope.routeId,
            points: selectedPoints})
           .$promise.then(function() {
             $scope.updateRouteInfo();
             $scope.showTrack();
             $scope.listPoints();
           }).catch(function(response) {
             $log.warn('Error deleting route points:', response.status, response.statusText);
             $scope.ajaxRequestError = {
               error: true,
               status: response.status
             };
           });
       };

       $scope.split = function(form) {
         var newRoute = {},
             selectedPointId,
             selectedPoints = [],
             selectedCount = 0,
             pointIndex;
         $scope.formError = undefined;
         $scope.data.points.forEach(function(v) {
           if (v.selected) {
             selectedCount++;
             selectedPointId = Number(v.id);
           }
         });
         if (selectedCount > 1) {
           $log.error('More than one point selected');
           $scope.formError = {editOnlyOne: true};
         } else {
           if ($scope.route.points.length > 0) {
             pointIndex = $scope.route.points.findIndex(function(p) {
               return Number(p.id) === selectedPointId;
             });
             if (pointIndex > -1) {
               newRoute.id = $scope.itineraryId;
               newRoute.name = $scope.route.name + ' (split)';
               newRoute.color = $scope.route.color;
               newRoute.points = $scope.route.points.slice(pointIndex);
               ItineraryRouteService.save(
                 {},
                 newRoute)
                 .$promise.then(function(result) {
                   $scope.route.points.splice(pointIndex);
                   ItineraryRouteService.update(
                     {},
                     {id: $scope.itineraryId,
                      routeId: $scope.route.id,
                      points: $scope.route.points})
                     .$promise.then(function(result) {
                       $location.path('/itinerary');
                       $location.search({id: encodeURIComponent($scope.itineraryId)});
                     }).catch(function(response) {
                       $log.error('Saving original route failed:', response);
                       $scope.ajaxRequestError = {
                         error: true,
                         status: response.status
                       };
                     });
                 }).catch(function(response) {
                   $log.error('Saving new split route failed:', response);
                   $scope.ajaxRequestError = {
                     error: true,
                     status: response.status
                   };
                 });
             } else {
               $log.error('Could not find the selected point:', selectedPointId);
             }
           } else {
             $log.error('Seems to be no points in the route');
           }
         }
       };

     }]);

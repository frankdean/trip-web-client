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

angular.module('myApp.map.point.controller', [])

  .controller(
    'MapPointCtrl',
    ['$scope',
     '$routeParams',
     '$location',
     'ConfigService',
     'MapConfigService',
     'UtilsService',
     '$window',
     '$log',
     function($scope, $routeParams, $location, ConfigService, MapConfigService, UtilsService, $window, $log) {
       var lat, lng;
       angular.extend($scope, {
         height: $window.innerHeight - 120,
         status: {
           showMap: false
         },
         controls: {
           scale: {
             position: "bottomright"
           }
         },
         center: {zoom: 14},
         markers: {}
       });

       MapConfigService.getMapLayers()
         .then(function(layers) {
           angular.extend($scope, {
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

       lat = parseFloat(decodeURIComponent($routeParams.lat));
       lng = parseFloat(decodeURIComponent($routeParams.lng));
       if (!(Number.isNaN(lat) || Number.isNaN(lng))) {
         lat = Math.round(lat * 100000000) / 100000000;
         lng = Math.round(lng * 100000000) / 100000000;
         $scope.center = {
           lat: lat,
           lng: lng,
           zoom: 14
         };
         $scope.markers = {
           selected: {
             lat: lat,
             lng: lng,
             icon: ConfigService.getDefaultMarkerIcon(),
             message: lat + ', ' + lng
           }
         };
       }
     }]);

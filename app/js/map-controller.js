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

angular.module('myApp.map.controller', [])

  .controller(
    'MapCtrl',
    ['$scope',
     '$sanitize',
     '$routeParams',
     '$location',
     'RecentPoints',
     'Storage',
     'ConfigService',
     'MapConfigService',
     'UtilsService',
     'leafletData',
     'leafletBoundsHelpers',
     '$timeout',
     '$window',
     '$log',
     'mySocket',
     function($scope, $sanitize, $routeParams, $location, RecentPoints, Storage, ConfigService, MapConfigService, UtilsService, leafletData, leafletBoundsHelpers, $timeout, $window, $log, mySocket) {
       var dateFrom, dateTo, now;

       angular.extend($scope, {
         autocenter: true,
         data: {
           nicknameSelect: $routeParams.nickname !== undefined ? decodeURIComponent($routeParams.nickname) : undefined,
           dateFrom: decodeURIComponent($routeParams.from),
           dateTo: decodeURIComponent($routeParams.to),
           hdop: $routeParams.hdop !== undefined ? decodeURIComponent($routeParams.hdop) : undefined,
           notesOnlyFlag: $routeParams.notesOnlyFlag !== undefined ? decodeURIComponent($routeParams.notesOnlyFlag) : undefined
         },
         status: {
           firstRun: true,
           liveupdate: false,
           updating: false,
           connected: false,
           withinTimeSpan: true,
           hideWarning: true,
           // Delay construciton of map object until attribution fetched from server
           showMap: false
         },
         map: {
           center: {},
           height: $window.innerHeight - 120,
           controls: {
             scale: {
               position: "bottomright"
             }
           },
           bounds: {},
           markers: {},
           paths: {}
         }
       });
       dateTo = Date.parse($scope.data.dateTo);
       dateFrom = Date.parse($scope.data.dateFrom);
       now = Date.now();
       $scope.status.withinTimeSpan = (now >= dateFrom && now <= dateTo);
       $timeout(function() {
         $scope.status.hideWarning = false;
       }, 2000);

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

       // Only do live updates when viewing other nicknames
       if ($scope.data.nicknameSelect && Date.now() <= dateTo) {
         mySocket.connect();
         mySocket.on('connect', function() {
           $scope.status.connected = true;
           now = Date.now();
           $scope.status.withinTimeSpan = (now >= dateFrom && now <= dateTo);
           $scope.status.liveupdate = $scope.status.withinTimeSpan;
         });
         mySocket.on('disconnect', function() {
           $scope.status.connected = false;
           $scope.status.liveupdate = false;
         });
         $scope.$on('$destroy', function() {
           $scope.status.liveupdate = false;
           mySocket.disconnect();
           mySocket.removeAllListeners();
         });
         mySocket.forward($scope.data.nicknameSelect, $scope);
         $scope.$on('socket:' + $scope.data.nicknameSelect, function(ev, data) {
           now = Date.now();
           if (now >= dateFrom && now <= dateTo) {
             $scope.status.withinTimeSpan = true;
             $scope.status.liveupdate = true;
             $scope.updatePaths();
           } else {
             $scope.status.withinTimeSpan = false;
             $scope.status.liveupdate = false;
             // Don't disconnect the socket if we might want it connected in the future
             if (now >= dateTo) {
               mySocket.disconnect();
               mySocket.removeAllListeners();
             }
           }
         });
       }
       $scope.updatePaths = function() {
         if ($scope.status.updating) {
           $log.debug('Update in progress, skipping subsequent request');
           return;
         }
         $scope.status.updating = true;
         $scope.ajaxRequestError = {error: false};
         RecentPoints.query(
           {nickname: $scope.data.nicknameSelect,
            from: $scope.data.dateFrom,
            to: $scope.data.dateTo,
               max_hdop: $scope.data.hdop,
               notesOnlyFlag: $scope.data.notesOnlyFlag},
           function (value) {
             if (value !== undefined) {
               $scope.distance = value.distance;
               $scope.ascent = value.ascent;
               $scope.descent = value.descent;
               $scope.lowest = value.lowest;
               $scope.highest = value.highest;
               if (value.payload !== undefined) {
                 $scope.map.paths.p1 = {
                   color: 'red',
                   opacity: 0.5,
                   weight: 4,
                   latlngs: {}
                 };
                 var latlngs = new Array(value.payload.length);
                 var latlng;
                 value.payload.forEach(function(item, index, array){
                   latlng =  {lat: parseFloat(item.lat, 10), lng: parseFloat(item.lng, 10), time: (new Date(item.time)).toLocaleString('en-GB'), note: item.note};
                   latlngs[index] = latlng;
                 });
                 $scope.map.paths.p1.latlngs = latlngs;
                 if (latlng !== undefined) {
                   $scope.map.markers = {
                     mostRecent: {
                       lat: latlng.lat,
                       lng: latlng.lng,
                       icon: ConfigService.getDefaultMarkerIcon(),
                       focus: true,
                       message: $sanitize(latlng.time + (latlng.note && latlng.note !== '' ? '</br>' + _.escape(latlng.note) : ''))
                     }
                   };
                 }
                 if (!$scope.status.firstRun) {
                   $scope.map.bounds = {};
                   if (latlngs.length === 1) {
                     if ($scope.autocenter) {
                       $scope.map.center = {lat: latlng.lat, lng: latlng.lng, zoom: 14};
                     } else {
                       $scope.map.center.zoom = 14;
                     }
                   } else if ($scope.autocenter) {
                     leafletData.getMap().then(function(map) {
                       map.panTo(new L.LatLng(latlng.lat, latlng.lng));
                     });
                   }
                 } else {
                   $scope.status.firstRun = false;
                   if (latlngs.length === 1) {
                     $scope.map.center = {lat: latlng.lat, lng: latlng.lng, zoom: 14};
                   } else if (latlngs.length > 1) {
                     $scope.map.bounds = leafletBoundsHelpers.createBoundsFromLeaflet(L.latLngBounds(latlngs));
                     $scope.map.bounds.options = {maxZoom: 14};
                   }
                 }
                 $scope.ajaxRequestError = {error: false};
               } else {
                 $scope.ajaxRequestError = {error: true};
               }
             } else {
               $scope.ajaxRequestError = {error: true};
             }
             $timeout(function() {
               $scope.status.updating = false;
             }, 1000);
           }, function(response) {
             $scope.ajaxRequestError = {
               error: true,
               status: response.status
             };
             if (response.status === 401) {
               $location.path('/login');
             } else if (response.status === 400) {
               $log.warn('Invalid request tracks: ', response.statusText);
             } else {
               $log.warn('Error fetching tracks: ', response.status, response.statusText);
             }
             $timeout(function() {
               $scope.status.updating = false;
             }, 10000);
           });
       };
       $scope.updatePaths();
     }]);
